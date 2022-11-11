import axios from 'axios';
import { loginFulfilled } from '../features/userSlice';
import store from '../store';

export const silentRefresh = async (refreshToken: string) => {
    // Token expire time
    const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

    try {
        // asks server for new token
        const { data } = await axios.get(`/refresh_token`, {
            headers: {
                Authorization: refreshToken,
            },
        });
        // going to call itself again after 5 seconds
        setTimeout(function () {
            silentRefresh(refreshToken);
        }, 5000);
        // setTimeout(onSilentRefresh, JWT_EXPIRY_TIME - 60000);

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
        return;
    }

};
