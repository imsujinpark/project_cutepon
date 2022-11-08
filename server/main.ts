import { User } from './src/User.js';
import { Coupon } from './src/Coupon.js';
import { Database, Statement } from './src/sqlite-async.js';
import * as jsonwebtoken from 'jsonwebtoken';
import express, { Express, Request, Response } from 'express';
import cors, {CorsOptions, CorsOptionsDelegate, CorsRequest} from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios';

async function database_start(): Promise<Database> {
    
    const database = await Database.open("./data/database.sqlite3");
    console.log("Open database ./data/database.sqlite3");

    database.on("error", (err: Error) => {
        throw err;
    });

    await User.reset_table(database);
    await Coupon.reset_table(database);
    await User.initialize_statements(database);
    await Coupon.initialize_statements(database);

    return Promise.resolve(database);
}

function database_close(database: Database) {
    console.log("Closing " + {database});
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
    const secret = process.env.JWT_SECRET ?? throw_expression("JWT_SECRET");
    const data = { internal_id, public_id };
    const jwt = jsonwebtoken.sign(data, secret, {expiresIn: '5h'});
    // const jwt = await new jose.SignJWT(data)
    //     .setProtectedHeader({ alg: 'ES256' })
    //     .setExpirationTime('5h')
    //     .sign(Buffer.from(secret));
    return jwt;
}

// TODO not working for now...
// https://medium.com/@Flowlet/a-quick-introduction-to-json-web-tokens-jwt-and-jose-95f6e06b7bf7
async function generate_user_token_long(internal_id: number, public_id: string): Promise<string> {
    const secret = process.env.REFRESH_JWT_SECRET ?? throw_expression("REFRESH_JWT_SECRET");
    const data = { internal_id, public_id };
    const jwt = jsonwebtoken.sign(data, secret, {expiresIn: '150d'});
    // const jwt = await new jose.SignJWT(data)
    //     .setProtectedHeader({ alg: 'ES256' })
    //     .setExpirationTime('150d')
    //     .sign(Buffer.from(secret));
    return jwt;
}

/** return type of googleapis.com/token */
interface g_token {
    access_token: string,
    expires_in: number,
    token_type: string,
    scope: string,
    refresh_token: string,
    id_token: string
};

// https://developers.google.com/identity/protocols/oauth2/web-server#exchange-authorization-code
async function googleapi_token(code: string): Promise<any> {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
    };
    const response = await axios({
        url,
        method: 'POST',
        data: values
        // headers: {
        //     'Authorization': `Bearer ${access_token}`
        // }
    })
    // await axios(url, {
    //     method: 'POST',
    //     data: values
    // });
    // Google responds to this request by returning a JSON object that contains a short-lived access token
    // and a refresh token. Note that the refresh token is only returned if your application set the
    // access_type parameter to offline in the initial request to Google's authorization server.
    const token = await response.data; // NOTE if I use g_token it gives me a segmentation fault ffs bun!!!!!
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
async function googleapi_oauth2_v2_userinfo(access_token: string): Promise<any> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
    const response = await axios(url, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    });
    const userinfo = await response.data;
    return userinfo;
}

/** return type of googleapis.com/token */
interface user_data {
    name: string,
    email: string,
    unique_id: string,
    pciture: string,
};

async function get_or_register_user(data: user_data): Promise<User> {
    let user = await User.get_existing_user(data.unique_id);
    if (user) {
        return Promise.resolve(user);
    }
    else {
        return await User.create_new_user(data.unique_id, data.email);
    }
}

///////////////////////////////
// Application down below... //
///////////////////////////////

dotenv.config();
const database = database_start();
const app = express();
app.use(cors());
app.use(express.static('../client/build'));
verify_environment();

/** token -> token_data */
const sessions = new Map<string, token_data>();
/** refresh_token -> refresh_token_data */
const sessions_long = new Map<string, token_data>();
/** internal_id -> user_tokens */
const user_sessions = new Map<number, user_tokens>();

app.use('/li/*', (req, res, next) => {
    const session = req.headers.authorization;
    if(!session) {
        throw new Error("Authorization header is missing!");
    }
    // const token = authHeader.split(' ')[1];
    const user_session = sessions.get(session);
    if (!user_session) {
        throw new Error("Authorization not recognized!");
    }
    if (Date.now().valueOf() > user_session.expiration) {
        throw new Error("Authorization expired!");
    }
    req.body['internal_id'] = user_session.internal_id;
    next();
});

app.get("/refresh_token", (req, res) => {
    const auth = req.headers.authorization;
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
    res.json(tokens);
});

app.get("/li/hello", (req, res) => {
    res.send(`Hello ${req.body['internal_id']}!`)
});

// GET /oauth2/google
// 
// Redirects the user to an authorization form `https://accounts.google.com/o/oauth2/v2/auth`.
// Completing the form will redirect the user, once again, to `/oauth2/google/callback`.
app.get('/oauth2/google', function handleGoogleLogin(req, res) {
    const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        // Notes Oscar. REDIRECT_URI = http://localhost:3000/oauth2/redirect/google
        // After the user has gone through the google login page, google will redirect him to this URI
        // that we provide him with in here.
        redirect_uri: process.env.REDIRECT_URI ?? throw_expression("REDIRECT_URI"),
        client_id: process.env.CLIENT_ID ?? throw_expression("CLIENT_ID"),
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
    res.redirect(301, url);
});

// GET /oauth2/google/callback
// 
// URL Parameters:
//     * code: number. Code set automatically by google auth form on completion.
// 
// Response:
//     * token: string. Short duration token for accessing the APIs that require identification.
//     Put this token as is in the `Authorization` header of subsequent requests.
//     * refreshToken: string. Long duration token used as a means of renewing your identification.
//     If `token` expires, you can receive a new one by sending this `refreshToken` to the TODO API.
// 
// This is the API that acts both as a "login" and a "register". The `token` and `refreshToken` 
// returned will be subsequently used for accessing any API that requires authorization.
// 
// The client will never not manually access this API.When the client tries to login via oauth at
// `/oauth2/google` and completes the form, google will redirect the client here, with the required
// data already set.
app.get('/oauth2/google/callback', async function handle_google_oauth_callback (req, res) {
    // https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse
    const error = req.query.error;
    if (error) { throw new Error(error.toString()); }
    const code = req.query.code;
    if (!code) throw new Error("No code found on oauth callback");
    const api_access = await googleapi_token(code.toString()) ;
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
    const user: User = await get_or_register_user(user_data);

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
    res.json(tokens);
});

console.log(`http://localhost:80/`)
console.log(`http://localhost:80/oauth2/google`)
console.log(`http://localhost:80/hello`)
app.listen({ port: Number(process.env.APP_PORT), /*certFile: "./cert.pem", keyFile: "./key.pem"*/ });
