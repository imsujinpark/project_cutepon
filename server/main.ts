import Bao from "baojs";
import jwt from "jsonwebtoken";
import Bun from "bun";
import { User } from '../database/src/User';
import { Coupon } from '../database/src/Coupon';
import { Database, Statement } from 'bun:sqlite';

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

/** Only reason this exist is that I cant throw an Error from an expression */
function throw_expression(msg: string): never {
    throw new Error(msg);
}

function generate_user_token(internal_id:number, public_id:string) {
    return jwt.sign({internal_id, public_id}, process.env.JWT_SECRET, { expiresIn: 60*5 });
}

function generate_user_token_long(internal_id:number, public_id:string) {
    return jwt.sign({internal_id, public_id}, process.env.REFRESH_JWT_SECRET, { expiresIn: '150d' });
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
        const token = ctx.headers.get("Authorization");
        if(!token) {
            throw new Error("Authorization header is missing!");
        }
        console.log("token");
        console.log(token);
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if(err) throw err;
            console.log("payload");
            console.log(payload);
            console.log("ctx.extra");
            console.log(ctx.extra);
            ctx.extra['user'] = payload;
            console.log("ctx.extra.user");
            console.log(ctx.extra.user);
        })
    }
    return ctx;
});

app.get("/li/hello", (ctx) => {
    console.log("ctx.extra.user");
    console.log(ctx.extra.user);
    console.log("ctx.extra");
    console.log(ctx.extra);
    return ctx.sendText(`Hello ${ctx.extra.user.internal_id}!`);
});

app.get("/hello", (ctx) => {
    return ctx.sendText(`Hello world!`);
});

// Notes Oscar. Step 1, user goes to the google login page
// by using the link provided by /login/google down below...
// That link provided will have a series of configuration parameters
// which will define:
// * Where to redirect the user when the authorization process is completed
// * What permissions we are asking the user to give us (profile and email in this case)
// * What format we want to get the permission in (in our case, we want a `code`
//   which we can send google when asking for data we got permissions for)
// * Lastly we set a secret ID that represents our application, which google knows of and
//   recognizes, so that when the user goes authenthicate google can see that indeed we
//   the ones asking for permissions.

// route that returns the link to the google oauth consent screen
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

// Notes Oscar. Step 2, when user finishes the google login and gives consent,
// google will redirect the user to the URI we asked it to be redirected, in our case,
// this one down here `http://localhost:3000/oauth2/redirect/google`.
// When redirected, the URI that google gives the client will have a `code` which we
// can then use when querying google for the user's data. Now that we have access to the
// users verified data (email, name, and picture) we will...
// 1. Ask google for the access_token to the users data, using the code received. 
// 2. Ask google for the email, name and picture of the user, using the access_token received.
//    Notes: Why is there 2 steps for this? kind of redundant?
// 3. Store the data of the user in the database.
// 4. Generate an encrypted token with a private key that only the server knows
//    {private key} + {name, email} = Access token
//    Since it is encrypted no one can get the email and name of that token except us.
//    And since it contains name and email, we can require it while accessing our server,
//    allowing us to verify the user is a validated user.
//    Notes: Aparently JWT allows to put an expiration date to the token, so that the token
//    can expire, making the user have to get a new token.
//    Notes: Since we are going to access that token very often, we can store it in redis
//    for O(1) verification of tokens.
// 5. Finally, send that token to the user.
//    Notes: For some reason, here it generates 2 tokens with same data (name and email) but
//    different expirations, and sends both to the user (token and refreshToken), but not sure why...

// https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse
app.get('/oauth2/google/callback', async function handle_google_oauth_callback (ctx) {
    const url = new URL(ctx.req.url);
    const error = url.searchParams.get('error');
    if (error) { throw new Error(error); }
    const code = url.searchParams.get('code');
    if (!code) throw new Error("No code found on oauth callback");
    const token = await googleapi_token(code) ;
    console.log(token.access_token);
    const user_details = await googleapi_oauth2_v2_userinfo(token.access_token);
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
    const jwt_token = generate_user_token(user.internal_id, user.public_id)
    console.log("jwt_token");
    console.log(jwt_token);
    const jwt_refresh_token = generate_user_token_long(user.internal_id, user.public_id)
    // store refresh token on redis
    // Notes Oscar. It does SADD (Set Add) of key `name` and value `refreshToken`.
    // await redisService.appendRefreshToken(name, refreshToken)
    return ctx.sendJson({token: jwt_token, refresh_token: jwt_refresh_token});
});

verify_environment();

console.log(`Starting app at http://localhost:${process.env.APP_PORT}/oauth2/google`);

app.listen({ port: Number(process.env.APP_PORT) });