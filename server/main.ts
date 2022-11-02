import Bao from "baojs";
import jwt from "jsonwebtoken";
import Bun from "bun";
import {User} from '../database/src/User';
import {Coupon} from '../database/src/Coupon';

// if (process.env.NODE_ENV == null) {
//     process.env.NODE_ENV = 'development';
// }

const app = new Bao();

/** Only reason this exist is that I cant throw an Error from an expression */
function throw_expression(msg: string): never {
    throw new Error(msg);
}

function generate_user_token(data: {unique_id:string, email:string}) {
    jwt.sign(data, process.env.JWT_SECRET ?? throw_expression("process.env.SECRET required!"), { expiresIn: 60*5 });
}

function generate_user_token_long(data: {unique_id:string, email:string}) {
    jwt.sign(data, process.env.REFRESH_JWT_SECRET ?? throw_expression("process.env.SECRET required!"), { expiresIn: '150d' });
}

function get_user_data(authorization: string) {
    jwt.verify(authorization, process.env.JWT_SECRET ?? throw_expression("process.env.SECRET required!"), (err, payload) => {
        if (err) throw err;
        if (!payload) throw "Esto no puede ser gente";
        return payload;
    });
}

async function get_access_token_google(code: string): Promise<string> {
    const url = 'https://oauth2.googleapis.com/token'
    const values = {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
    }
    const data = new URLSearchParams(values).toString();
    const response = await fetch(
        url, {
        method: 'POST',
        // TODO might have to send the data raw
        body: JSON.stringify(data)
    });
    /* response data from google comes with access_token, refresh_token and id_token, expires_in and scope
    we only need the access_token for this process */
    const jsonResponse = await response.json<{access_token:string}>();
    return jsonResponse.access_token;
}

async function get_user_data_google(access_token: string): Promise<{unique_id:string, email:string}> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo'
    const response = await fetch(
        url, {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    const userInfo = await response.json<{unique_id: string, email:string}>();
    return userInfo;
}

function get_or_register_user(data: {unique_id:string, email:string}): User {
    let user = User.get_existing_user(data.unique_id);
    if (!user) {
        user = User.create_new_user(data.unique_id, data.email);
    }
    return user;
}

app.errorHandler = (error: Error) => {
    console.log(error);
    if ((process.env.NODE_ENV ?? throw_expression("process.env.NODE_ENV required!")) === 'development')
        return new Response(`Oh no! An error has occurred...\n${error}`);
    else
        return new Response(`Oh no! An error has occurred...`);
};

app.notFoundHandler = () => {
    return new Response(`Route not found...`);
};

app.before((ctx) => {
    if (ctx.path.startsWith(`/li`)) {
        console.log("Protected API being called...");
        const user = get_user_data(ctx.headers.get("Authorization") ?? throw_expression("No Authorization found!"));
        ctx.extra["auth"] = user;
    }
    return ctx;
});

app.get("/li/hello", (ctx) => {
    return ctx.sendText(`Hello ${ctx.extra.user.displayName}!`);
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

        redirect_uri: process.env.REDIRECT_URI ?? throw_expression("process.env.REDIRECT_URI required!"),
        client_id: process.env.CLIENT_ID ?? throw_expression("process.env.CLIENT_ID required!"),
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
    return ctx.sendJson({ url });
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

// callback URI for google oauth
app.get('/oauth2/google/callback', async function handleGoogleLoginCallback (ctx) {
    // extract authorization grant code from the querystring
    const code = ctx.params['code'];
    console.log(`Got a code ${code} on the oauth callback`);
        
    // get access_token with the authorization grant code
    const access_token = await get_access_token_google(code) ;

    // get user details from google resource server using the access_token
    const userDetails = await get_user_data_google(access_token);

    // if(!userDetails.verified_email) {
    //     throw 'User has not a verified email!';
    // }

    // upsert user details on the database
    // TODO get a unique identifier for this user
    // TODO check if user already exists
    // TODO if not, inser in db
    const user = get_or_register_user(userDetails);

    // generate JWT for the user
    const token = generate_user_token(userDetails)

    // generate refresh token for user 
    const refreshToken = generate_user_token_long(userDetails)

    // store refresh token on redis
    // Notes Oscar. It does SADD (Set Add) of key `name` and value `refreshToken`.
    // await redisService.appendRefreshToken(name, refreshToken)

    return ctx.sendJson({token, refreshToken});
});

const port = process.env.APP_PORT ?? 3000;
console.log(`Starting app at http://localhost:${port}`);
app.listen({ port: Number(port) });