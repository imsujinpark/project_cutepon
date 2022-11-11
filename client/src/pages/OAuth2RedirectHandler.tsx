import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
// redux related
import { useDispatch } from 'react-redux';
import { loginFulfilled } from '../features/userSlice';
import { useEffect } from 'react';
import { silentRefresh } from '../common/utils';

const OAuth2RedirectHandler = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const tokenParam = searchParams.get('token'); //
    const refreshTokenParam = searchParams.get('refresh_token');

    useEffect(() => {
        OAuthRedirector();
    }, []);

    const OAuthRedirector = () => {
        dispatch(
            loginFulfilled({
                token: tokenParam,
                refreshToken: refreshTokenParam,
            })
        );
        axios.defaults.headers.common['Authorization'] = tokenParam;
        if (refreshTokenParam !== null) {
            silentRefresh(refreshTokenParam);
        }
        navigate('/');
    };

    return (
        <div>
            <div>OAuth2.0 Redirect Page</div>s
        </div>
    );
};

export default OAuth2RedirectHandler;
