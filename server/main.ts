import Bao from "baojs";
import { User } from '../database/src/User';
import { Coupon } from '../database/src/Coupon';
import { Database, Statement } from 'bun:sqlite';
import * as jose from 'jose';

function database_start(): Database {
    const database = new Database("./data/database.sqlite3");
    console.log("Opening " + database.filename);
    if (process.env.NODE_ENV === 'development') {
        User.reset_table(database);
        Coupon.reset_table(database);
    }
    User.initialize_statements(database);
    Coupon.initialize_statements(database);
    return database;
}

function database_close(database: Database) {
    console.log("Closing " + database.filename);
    database.close();
}

interface token_data {
    token: string,
    internal_id: number,
    expiration: number
};

interface user_tokens {
    token: string,
    refresh_token: string,
};

function require_not_null(object: any): void {
    if (!object) throw new Error("required non null!");
}

function verify_environment(): void {
    require_not_null(process.env.NODE_ENV);
    require_not_null(process.env.APP_PORT);
    require_not_null(process.env.JWT_SECRET);
    require_not_null(process.env.REFRESH_JWT_SECRET);
    require_not_null(process.env.CLIENT_ID);
    require_not_null(process.env.CLIENT_SECRET);
    require_not_null(process.env.REDIRECT_URI);
}

function throw_expression(msg: string): never {
    throw new Error(msg);
}

// TODO not working for now...
// https://medium.com/@Flowlet/a-quick-introduction-to-json-web-tokens-jwt-and-jose-95f6e06b7bf7
async function generate_user_token(internal_id: number, public_id: string): Promise<string> {
    const secret = process.env.JWT_SECRET;
    const data = { internal_id, public_id };
    const jwt = await new jose.SignJWT(data)
        .setProtectedHeader({ alg: 'ES256' })
        .setExpirationTime('5h')
        .sign(Buffer.from(secret));
    return jwt;
}

// TODO not working for now...
// https://medium.com/@Flowlet/a-quick-introduction-to-json-web-tokens-jwt-and-jose-95f6e06b7bf7
async function generate_user_token_long(internal_id: number, public_id: string): Promise<string> {
    const secret = process.env.REFRESH_JWT_SECRET;
    const data = { internal_id, public_id };
    const jwt = await new jose.SignJWT(data)
        .setProtectedHeader({ alg: 'ES256' })
        .setExpirationTime('150d')
        .sign(Buffer.from(secret));
    return jwt;
}

/** return type of googleapis.com/token */
interface g_token {
    access_token: string,
    expires_in: number,
    token_type: string,
    scope: string,
    refresh_token: string
};

// https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
async function googleapi_token(code: string): Promise<g_token> {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
    };
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(values)
    });
    // Google responds to this request by returning a JSON object that contains a short-lived access token
    // and a refresh token. Note that the refresh token is only returned if your application set the
    // access_type parameter to offline in the initial request to Google's authorization server.
    const token = await response.json<g_token>();
    return token;
}

/** return type of googleapis.com/oauth2/v2/userinfo */
interface g_userinfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
};
  
// https://developers.google.com/identity/protocols/oauth2/web-server#callinganapi
async function googleapi_oauth2_v2_userinfo(access_token: string): Promise<g_userinfo> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    const userinfo = await response.json<g_userinfo>();
    return userinfo;
}

/** return type of googleapis.com/token */
interface user_data {
    name: string,
    email: string,
    unique_id: string,
    pciture: string,
};

function get_or_register_user(data: user_data): User {
    let user = User.get_existing_user(data.unique_id);
    if (!user) {
        user = User.create_new_user(data.unique_id, data.email);
    }
    return user;
}

///////////////////////////////
// Application down below... //
///////////////////////////////

const database = database_start();
const app = new Bao();

/** token -> token_data */
const sessions = new Map<string, token_data>();
/** refresh_token -> refresh_token_data */
const sessions_long = new Map<string, token_data>();
/** internal_id -> user_tokens */
const user_sessions = new Map<number, user_tokens>();

app.errorHandler = (error: Error) => {
    console.log(error);
    if (process.env.NODE_ENV === 'development')
        return new Response(`Oh no! An error has occurred...\n${error}`);
    else
        return new Response(`Oh no! An error has occurred...`);
};

app.notFoundHandler = () => {
    return new Response(`Route not found...`);
};

app.before((ctx) => {
    if (ctx.path.startsWith(`/li`)) {
        const session = ctx.headers.get("Authorization");
        if(!session) {
            throw new Error("Authorization header is missing!");
        }
        const user_session = sessions.get(session);
        if (!user_session) {
            throw new Error("Authorization not recognized!");
        }
        if (Date.now().valueOf() > user_session.expiration) {
            throw new Error("Authorization expired!");
        }
        ctx.extra['internal_id'] = user_session.internal_id;
    }
    return ctx;
});

app.get("/refresh_token", (ctx) => {
    const auth = ctx.headers.get("Authorization");
    if(!auth) {
        throw new Error("Authorization header is missing!");
    }
    const refresh_token = sessions_long.get(auth);
    if (!refresh_token) {
        throw new Error("Authorization not recognized!");
    }
    if (Date.now().valueOf() > refresh_token.expiration) {
        throw new Error("Authorization expired!");
    }

    const user_tokens = user_sessions.get(refresh_token.internal_id);
    if (!user_tokens) {
        throw new Error("Unreachable! The user somehow has a valid refresh token but not sessions?");
    }
    sessions.delete(user_tokens.token);
    const hour_in_ms = 3600000;
    const expiration_short = new Date().getTime() + hour_in_ms * 1;
    const token = crypto.randomUUID();
    sessions.set(token, {internal_id: refresh_token.internal_id, token: token, expiration: expiration_short});
    const tokens = {token, refresh_token: refresh_token.token};
    user_sessions.set(refresh_token.internal_id, tokens);
    return ctx.sendJson(tokens);
});

app.get("/li/hello", (ctx) => {
    return ctx.sendText(`Hello ${ctx.extra.internal_id}!`);
});

app.get("/hello", (ctx) => {
    return ctx.sendText(`Hello world!`);
});

app.get('/oauth2/google', function handleGoogleLogin (ctx) {
    const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        // Notes Oscar. REDIRECT_URI = http://localhost:3000/oauth2/redirect/google
        // After the user has gone through the google login page, google will redirect him to this URI
        // that we provide him with in here.
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };
    const queryString = new URLSearchParams(options);
    const url = `${rootURL}?${queryString.toString()}`;
    return ctx.sendRaw(Response.redirect(url));
});

// https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse
app.get('/oauth2/google/callback', async function handle_google_oauth_callback (ctx) {
    const url = new URL(ctx.req.url);
    const error = url.searchParams.get('error');
    if (error) { throw new Error(error); }
    const code = url.searchParams.get('code');
    if (!code) throw new Error("No code found on oauth callback");
    const api_access = await googleapi_token(code) ;
    const user_details = await googleapi_oauth2_v2_userinfo(api_access.access_token);
    if(!user_details.verified_email) {
        throw new Error('User has not a verified email!');
    }
    const user_data: user_data = {
        name: user_details.name,
        email: user_details.email,
        unique_id: user_details.id,
        pciture: user_details.picture,
    }
    const user: User = get_or_register_user(user_data);

    // TODO fix the issues with jwt stuff...
    // https://medium.com/@Flowlet/a-quick-introduction-to-json-web-tokens-jwt-and-jose-95f6e06b7bf7
    // const jwt_token = await generate_user_token(user.internal_id, user.public_id)
    // const jwt_refresh_token = await generate_user_token_long(user.internal_id, user.public_id)

    const old_sessions = user_sessions.get(user.internal_id);
    if (old_sessions) {
        sessions_long.delete(old_sessions.refresh_token);
        sessions.delete(old_sessions.token);
    }
    const hour_in_ms = 3600000;
    const expiration_short = new Date().getTime() + hour_in_ms * 1;
    const expiration_long = new Date().getTime() + hour_in_ms * 2;
    const token = crypto.randomUUID();
    sessions.set(token, {internal_id: user.internal_id, token: token, expiration: expiration_short});
    const refresh_token = crypto.randomUUID();
    sessions_long.set(refresh_token, {internal_id: user.internal_id, token: refresh_token, expiration: expiration_long});
    const tokens = {token, refresh_token};
    user_sessions.set(user.internal_id, tokens);

    return ctx.sendJson(tokens);
});

verify_environment();

app.listen({ hostname: process.env.APP_DOMAIN,  port: Number(process.env.APP_PORT), development: false });