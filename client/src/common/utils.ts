import axios from 'axios';

import { loginFulfilled } from '../features/userSlice';
import store from '../store';

// a function to ask server for new token every 30 min
export const silentRefresh = async (refreshToken: string) => {
    // Token expire time (30 min)
    const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

    try {
        // asks server for new token
        const { data } = await axios.get(`/refresh_token`, {
            headers: {
                Authorization: refreshToken,
            },
        });
        // going to call itself again after 30 min with updated refresh token as an auth header
        setTimeout(function () {
            silentRefresh(data.refresh_token);
        }, TOKEN_EXPIRY_TIME);

        // set the new token in redux store + session storage 
        store.dispatch(loginFulfilled({
            token: data.token,
            refreshToken: data.refresh_token,
        }));

        // set the new token as default header for http request
        axios.defaults.headers.common['Authorization'] = data.token;
        return;

    } catch (error) {
        console.log(error);
    }

};

// D-Day calculator
export const dDayCalculator = (epochMs: number): string => {
    const now: Date = new Date(); // current date
    const gap = epochMs - now.getTime(); // difference in milliseconds
    const gapDay = Math.ceil(gap / (1000 * 60 * 60 * 24)); // milliseconds to days

    if (gapDay < 0) {
        return `D+${Math.abs(gapDay)}`;
    } else {
        return `D-${gapDay}`;
    }
};
