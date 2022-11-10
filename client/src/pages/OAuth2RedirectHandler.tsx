import { useSearchParams } from 'react-router-dom';
// redux related
import { useSelector, useDispatch } from 'react-redux';
import { loginFulfilled, logoutFulfilled } from '../features/userSlice';
import { RootState } from '../store';
import { persistor } from '../index';

const OAuth2RedirectHandler = () => {
    // https://cutepon.net/oauth2/tokens?token=b0590ecb-0dbd-4c21-be59-91c0cb3b411a&refresh_token=83c87474-882f-4065-a66c-d44deddbdeeb
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const tokenParam = searchParams.get('token'); //
    const refreshTokenParam = searchParams.get('refresh_token');

    // login status
    const { isLoggedIn, token, refreshToken } = useSelector(
        (state: RootState) => {
            return state.user;
        }
    );

    console.log({ isLoggedIn, token, refreshToken });

    // purge function to remove state from session storage
    const purge = async () => {
        await persistor.purge();
    };

    const logout = () => {
        dispatch(logoutFulfilled());
        setTimeout(() => purge(), 2000);
    };

    const login = () => {
        dispatch(
            loginFulfilled({
                token: tokenParam,
                refreshToken: refreshTokenParam,
            })
        );
    };

    return (
        <div>
            <div>OAuth2.0 Redirect Page</div>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default OAuth2RedirectHandler;
