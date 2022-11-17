import { User } from './src/User.js';
import { Coupon, CouponStatus } from './src/Coupon.js';
import { Database, Statement } from './src/sqlite-async.js';
import * as jsonwebtoken from 'jsonwebtoken';
import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import cors, {CorsOptions, CorsOptionsDelegate, CorsRequest} from 'cors';
import * as dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
import http from 'http';
import fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
// import { json as body_as_json } from 'body-parser';
import pkg from 'body-parser';
const { json: body_as_json } = pkg;
// This is required for stack traces to refer to the original typescript code instead of the compiled js
import { install as soure_map_support } from 'source-map-support';
import rateLimit from 'express-rate-limit'
import * as util from './src/util.js';
import { UserCoupon } from './src/UserCoupon.js';
import { SessionError, SessionsManager } from './src/sessions.js';

async function database_start(): Promise<Database> {
    
    const database:Database = await Database.open("./data/database.sqlite3");
    console.log("Open database ./data/database.sqlite3");

    database.on("error", (err: Error) => {
        throw err;
    });

    // await User.reset_table(database);
    // await Coupon.reset_table(database);
    await User.initialize_statements(database);
    await Coupon.initialize_statements(database);
    await UserCoupon.initialize_statements(database);

    return database;
}

function verify_environment(): void {
    util.require_not_null(process.env.APP_DOMAIN);
    util.require_not_null(process.env.JWT_SECRET);
    util.require_not_null(process.env.REFRESH_JWT_SECRET);
    util.require_not_null(process.env.CLIENT_ID);
    util.require_not_null(process.env.CLIENT_SECRET);
    util.require_not_null(process.env.NODE_ENV);
    util.require_not_null(process.env.NODE_ROOT);
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
    picture: string,
};

async function get_or_register_user(data: user_data): Promise<User> {
    let user = await User.get_existing_user_unique(data.unique_id);
    if (user) {
        return Promise.resolve(user);
    }
    else {
        return await User.create_new_user(data.unique_id, data.email);
    }
}

enum Errors {
    AuthorizationMissing,
    AuthorizationExpired,
    AuthorizationInvalid,
    RegistrationInvalidEmail,
    SendCouponTargetUnknown,
    SendCouponTargetMissing,
    RedeemCouponIdMissing,
    RedeemCouponUnknownCoupon,
    RedeemCouponWrongOwner,
    RedeemCouponExpired,
    RedeemCouponNotActive,
    DeleteCouponIdMissing,
    DeleteCouponDeleteActiveNoAuthorized,
    DeleteCouponUnknownCoupon,
    RateLimitExceeded,
    NotImplemented,
    Internal
};

function response_error(res: Response, error: Errors, next: express.NextFunction): void {
    let status: number = 500; // Internal error by default
    switch(error) {
        case Errors.AuthorizationExpired: status = 401; // Unauthorized
        case Errors.AuthorizationMissing: status = 401; // Unauthorized
        case Errors.AuthorizationInvalid: status = 401; // Unauthorized
        case Errors.RegistrationInvalidEmail: status = 403; // Forbidden
        case Errors.SendCouponTargetUnknown: status = 400; // Bad Request
        case Errors.SendCouponTargetMissing: status = 400; // Bad Request
        case Errors.RedeemCouponIdMissing: status = 400; // Bad Request
        case Errors.RedeemCouponUnknownCoupon: status = 400; // Bad Request
        case Errors.RedeemCouponWrongOwner: status = 403; // Forbidden
        case Errors.RedeemCouponExpired: status = 400; // Bad Request
        case Errors.RedeemCouponNotActive: status = 400; // Bad Request
        case Errors.DeleteCouponIdMissing: status = 400; // Bad Request
        case Errors.DeleteCouponDeleteActiveNoAuthorized: status = 401; // Unauthorized
        case Errors.DeleteCouponUnknownCoupon: status = 400; // Bad Request
        case Errors.RateLimitExceeded: status = 500; // Forbidden
        case Errors.NotImplemented: status = 501; // Not implemented
        case Errors.Internal: status = 500; // Forbidden
    }
    const error_object = { error: error, message: Errors[error] }
    res.status(status).json(error_object);
    
    let err = new Error(util.inspect(error_object));
    util.log(`Error handled: ${util.inspect(err)}`);
    
    (err as any).__handled__ = true;
    next(err);
}

// Given an async RequestHandler, returns an synchronized version of it by wrapping it in a Promise
// This is necessary becase express doesn't yet handle exceptions thrown in async handlers, making the whole process
// to crash if such a thing happens. By wrapping your async handlers in this function, exceptions thrown in the function are
// properly caught and passed on to the error handler that you may have defined. Example:
//
//     app.use(asyncHandler(async(req, res, next) => {
//         await authenticate(req);
//         next();
//     }));
//     
//     app.get('/async', asyncHandler(async(req, res) => {
//         const result = await request('http://example.com');
//         res.end(result);
//     }));
// 
const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next)

///////////////////////////////
// Application down below... //
///////////////////////////////

async function main() {

    verify_environment();

    const sessions: SessionsManager = new SessionsManager()

    const database = await database_start();
    const app = express();
    
    /** redirect http to https */
    app.use((req, res, next) => {
        if (process.env.NODE_ENV != 'development' && !req.secure) {
            return res.redirect("https://" + req.headers.host + req.url);
        }
        next();
    });

    // Rate limit `/api/*` to 250 request per 15 minutes
    // Send `Errors.RateLimitExceeded` if exceeded
    // Test with powershel:
    // 
    //     for ($i = 0; $i -lt 300; $i+=1) {Invoke-WebRequest http://localhost/api/hello}
    // 
    app.use('/api/*', rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 250,
        handler: (req, res, next, opt) => response_error(res, Errors.RateLimitExceeded, next),
    }));

    /** cors configuration */
    app.use(cors());

    /** Anything in the path /api/* is a protected route and needs to be accessed with proper authorization */
    app.use('/api/*', asyncHandler(async (req, res, next) => {
        const token = req.headers.authorization;
        if(!token) return response_error(res, Errors.AuthorizationMissing, next);
        const result = sessions.verify_token(token);
        if (result === SessionError.InvalidToken) return response_error(res, Errors.AuthorizationInvalid, next);
        else if (result === SessionError.ExpiredToken) return response_error(res, Errors.AuthorizationExpired, next);
        (req as any).internal_id = result.user_id;
        next();
    }));

    app.get("/api/hello", asyncHandler(async (req, res, next) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        res.send(`Hello ${user.public_id}!`)
    }));

    app.post("/api/send", body_as_json(), asyncHandler(async (req, res, next) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        if (!req.body.target_user) return response_error(res, Errors.SendCouponTargetMissing, next);
        const target: User|null = await User.get_existing_user_public(req.body.target_user);
        if (!target) return response_error(res, Errors.SendCouponTargetUnknown, next); 
        const expiration_date = req.body.expiration_date ? new Date(req.body.expiration_date) : new Date(Date.now() + util.day_in_ms * 30)
        const coupon = await Coupon.create_new_coupon(
            req.body.title ?? "Coupon",
            req.body.description ?? "",
            expiration_date,
            user,
            target
        );
        const updated = await Coupon.update_status(coupon) ?? coupon;
        const user_data = await UserCoupon.get(user, updated);
        res.json(updated.set_user_data(user_data).primitive());
    }));

    app.post("/api/redeem", body_as_json(), asyncHandler(async (req, res, next) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        if (!req.body.coupon_id) return response_error(res, Errors.RedeemCouponIdMissing, next);
        
        const now = new Date();
        let coupon_to_redeem = await Coupon.get(req.body.coupon_id);
        if (coupon_to_redeem === null) return response_error(res, Errors.RedeemCouponUnknownCoupon, next);

        coupon_to_redeem = await Coupon.update_status(coupon_to_redeem) ?? coupon_to_redeem;

        if (coupon_to_redeem.target_user.internal_id !== user.internal_id) return response_error(res, Errors.RedeemCouponWrongOwner, next);
        if (coupon_to_redeem.expiration_date.getTime() < now.getTime()) return response_error(res, Errors.RedeemCouponExpired, next);
        if (coupon_to_redeem.status !== CouponStatus.Active) return response_error(res, Errors.RedeemCouponNotActive, next);
        const redeemed_coupon = await Coupon.redeem(coupon_to_redeem)
        const user_data = await UserCoupon.get(user, redeemed_coupon);
        res.json(redeemed_coupon.set_user_data(user_data).primitive());
    }));

    app.post("/api/delete", body_as_json(), asyncHandler(async (req, res, next) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        if (!req.body.coupon_id) return response_error(res, Errors.DeleteCouponIdMissing, next);
        
        // check coupon exists
        let coupon_to_delete = await Coupon.get(req.body.coupon_id);
        if (coupon_to_delete === null) return response_error(res, Errors.DeleteCouponUnknownCoupon, next);
        
        // update status of coupon
        coupon_to_delete = await Coupon.update_status(coupon_to_delete) ?? coupon_to_delete;

        // get user data for this coupon
        const user_data = await UserCoupon.get(user, coupon_to_delete);

        if (coupon_to_delete.status !== CouponStatus.Active) {
            
            // If its not active we just hide it
            user_data.hidden = true;
            await UserCoupon.update(user_data);

        }
        else {
            
            // If active, only receiver of the coupon can delete
            if (coupon_to_delete.target_user.internal_id !== user.internal_id) {
                return response_error(res, Errors.DeleteCouponDeleteActiveNoAuthorized, next);
            }

            coupon_to_delete = await Coupon.set_deleted(coupon_to_delete);
        }

        coupon_to_delete.set_user_data(user_data);
        
        res.json(coupon_to_delete.primitive());
    }));

    app.get("/api/received", asyncHandler(async (req, res) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        const available = await Coupon.get_received(user);
        const updated = await Coupon.update_all(available);
        await UserCoupon.get_all(user, updated);
        const non_hidden_coupons = updated.filter((coupon) => !coupon.user_data.hidden);
        res.json(Coupon.primitivize(non_hidden_coupons));
    }));

    // TODO Add to docs as well as tests
    app.get("/api/sent", asyncHandler(async (req, res) => {
        const user: User = await User.get_existing_user_internal((req as any).internal_id) ?? util.unreachable();
        const sent = await Coupon.get_sent(user);
        const updated = await Coupon.update_all(sent);
        await UserCoupon.get_all(user, updated);
        const non_hidden_coupons = updated.filter((coupon) => !coupon.user_data.hidden);
        res.json(Coupon.primitivize(non_hidden_coupons));
    }));

    app.get("/refresh_token", (req, res, next) => {
        const refresh_token = req.headers.authorization;
        if(!refresh_token) return response_error(res, Errors.AuthorizationMissing, next);
        const result = sessions.refresh_session(refresh_token);
        if (result === SessionError.ExpiredToken) return response_error(res, Errors.AuthorizationExpired, next);
        else if (result === SessionError.InvalidToken) return response_error(res, Errors.AuthorizationInvalid, next);
        res.json(result);
    });

    app.get('/oauth2/google', function handleGoogleLogin(req, res) {
        const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            // Notes Oscar. REDIRECT_URI = http://localhost:3000/oauth2/redirect/google
            // After the user has gone through the google login page, google will redirect him to this URI
            // that we provide him with in here.
            redirect_uri: process.env.REDIRECT_URI ?? util.unreachable(),
            client_id: process.env.CLIENT_ID ?? util.unreachable(),
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

    app.get('/oauth2/google/callback', asyncHandler(async function handle_google_oauth_callback (req, res, next) {
        // https://developers.google.com/identity/protocols/oauth2/web-server#handlingresponse
        const error = req.query.error;
        if (error) throw new Error(error.toString());
        const code = req.query.code;
        if (!code) util.unreachable("No code found on oauth callback");
        const api_access = await googleapi_token(code.toString()) ;
        const user_details = await googleapi_oauth2_v2_userinfo(api_access.access_token);
        if(!user_details.verified_email) return response_error(res, Errors.RegistrationInvalidEmail, next);
        const user_data: user_data = {
            name: user_details.name,
            email: user_details.email,
            unique_id: user_details.id,
            picture: user_details.picture,
        }
        const user: User = await get_or_register_user(user_data);
        const tokens = sessions.make_session(user.internal_id);
        res.redirect(`/oauth2/tokens?${new URLSearchParams({...tokens}).toString()}`);
    }));

    /** serve all the files where the react app will be */
    app.use(express.static('../client/build'));
    
    /** Any route that has not been recognized, send it to the react application and let it route it */
    app.get('*', (req, res) => {
        res.sendFile('./client/build/index.html', { root: process.env.NODE_ROOT });
    });

    /** Handle errors on the Express app globally */
    app.use((err: unknown, req: Request, res: Response, next: unknown) => {
        
        // __handled__ is an internal paremeter set to errors that are intentionally thrown by the server
        // and the client is already notified of beforehand, hence there is no need to do it again.
        // But unexpected errors still need to be notified to the client
        if (!(err as any).__handled__) {
            
            // If unexpected error, log it and send an Internal error to the client
            util.log(`:::: Unhandled error ::::\n${util.inspect(err)}`);
            res.status(Errors.Internal).json({ error: Errors.Internal, message: Errors[Errors.Internal] });
            
        }
        else {
        }

    });
    
    console.log(`NODE_ENV ${process.env.NODE_ENV}`)
    
    // Start a server on http:80 for the sole purpose of redirecting to https in production
    // Or in development, for testing
    const server = http.createServer(app)
        .listen(80, () => {
            console.log(`http://${process.env.APP_DOMAIN}/`)
            console.log(`http://${process.env.APP_DOMAIN}/oauth2/google`)
            console.log(`http://${process.env.APP_DOMAIN}/hello`)
        });
    
    // Start a server on https:443
    if (fs.existsSync("cert.pem") && fs.existsSync("key.pem")) {
        const cert = fs.readFileSync("cert.pem");
        const key = fs.readFileSync("key.pem");
        const server = https.createServer({key, cert}, app)
            .listen(443, () => {
                console.log(`https://${process.env.APP_DOMAIN}/`)
                console.log(`https://${process.env.APP_DOMAIN}/oauth2/google`)
                console.log(`https://${process.env.APP_DOMAIN}/hello`)
            });
    }
}

soure_map_support();
dotenv.config();
main();
