import { User } from "./User.js";
import * as util from "./util.js";
import * as uuid from 'uuid';

interface session_data {
    // The token used to access this session
    token: token,
    // The user identifier of this token
    user_id: internal_id,
    // UTC unix timestamp in ms
    expiration: unix_timestamp_ms
};

interface user_tokens {
    token: token,
    refresh_token: refresh_token,
};

type token = string;
type refresh_token = string;
type internal_id = number;
type unix_timestamp_ms = number;

enum SessionError {
    // The token was not recognized by the system
    InvalidToken,
    // The token is recognized but it is expired
    ExpiredToken
}

export class SessionsManager {

    sessions = new Map<token, session_data>();
    sessions_long = new Map<refresh_token, session_data>();
    user_sessions = new Map<internal_id, user_tokens>();

    verify_token(token: token): session_data | SessionError {

        const user_session = this.sessions.get(token);
        
        if (!user_session) return SessionError.InvalidToken;
        
        if (Date.now() > user_session.expiration) {
            
            // TODO remove the session?

            return SessionError.ExpiredToken;
        }
        
        return user_session;
    }

    // SessionError.InvalidToken -> there is a bug somewhere, or needs to login again
    // SessionError.ExpiredToken -> needs to login again
    refresh_session(refresh_token: refresh_token): SessionError | user_tokens {
        
        const user_session_long = this.sessions_long.get(refresh_token);

        if (!user_session_long) return SessionError.InvalidToken;

        if (Date.now() > user_session_long.expiration) {
            
            // TODO remove the session?

            return SessionError.ExpiredToken;
        }

        const user_id = user_session_long.user_id;

        const user_tokens = this.user_sessions.get(user_id);

        if (!user_tokens) util.unreachable(`
            The user somehow has a valid refresh token but not known sessions?
        `.trim());

        if (user_tokens.refresh_token !== refresh_token) util.unreachable(`
            Somehow the refresh_token provided by the user and the one registered dont match?
        `.trim());

        // If we have made it this far, it means the user has a valid refresh_token
        // So we have to refresh both the refresh_token and his token and give it to him (and remove the old ones)

        // First remove his old sessions and tokens.
        this.sessions.delete(user_tokens.token);
        this.sessions_long.delete(refresh_token);
        this.user_sessions.delete(user_id);

        // Now, create new tokens.
        let new_session: session_data;
        let tries_session: number = 0;
        do {
            new_session = this.create_session_with_expiration(user_id, 1); // 1 hour for token
            tries_session++;
            if (tries_session > 10) util.unreachable("Somehow failed to create a token that is not in use more than 10 times?!")
        }
        while (this.sessions.get(new_session.token))

        let new_session_long;
        let tries_session_long = 0;
        do {
            new_session_long = this.create_session_with_expiration(user_id, 24 * 7 * 2); // 2 weeks for refresh_token
            tries_session_long++;
            if (tries_session_long > 10) util.unreachable("Somehow failed to create a token that is not in use more than 10 times?!")
        }
        while (this.sessions_long.get(new_session_long.token))

        
        // Save the tokens.
        this.sessions.set(new_session.token, new_session);
        this.sessions_long.set(new_session_long.token, new_session_long);
        
        const tokens = {
            token: new_session.token,
            refresh_token: new_session_long.token
        };

        this.user_sessions.set(user_id, tokens);

        // Return the tokens
        return tokens;
    }

    private create_session_with_expiration(user_id:internal_id, hours_from_now: number): session_data {
        
        const expiration_timestamp = new Date().getTime() + util.hour_in_ms * hours_from_now;
        const token = uuid.v4();

        return {
            expiration: expiration_timestamp,
            token: token,
            user_id: user_id
        }
    }

}
