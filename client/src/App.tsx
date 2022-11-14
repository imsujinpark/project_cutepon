import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
// external components and functions
import Nav from './components/layout/Nav';
import GlobalStyle from './GlobalStyle';
import Home from './pages/Home';
import Login from './pages/Login';
import NewCoupon from './pages/NewCoupon';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ReceivedCoupons from './pages/ReceivedCoupons';
import SentCoupons from './pages/SentCoupons';
import CustomToast from './components/common/CustomToast';
import { silentRefresh } from './common/utils';
// redux related
import { useSelector } from 'react-redux';
import { RootState } from './store';

const App = () => {
    // this state is to prevent component rendering before default header is set for http request when logged in
    // if the rendering takes too long, a loading component might be added in the future
    const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

    // login status
    const { isLoggedIn, token, refreshToken } = useSelector(
        (state: RootState) => {
            return state.user;
        }
    );

    const { showToast } = useSelector((state: RootState) => {
        return state.toast;
    });

    console.log({ isLoggedIn, token, refreshToken });

    useEffect(() => {
        // if the user is logged in and refresh token exists, call silent refresh function
        if (isLoggedIn && refreshToken !== null) {
            silentRefresh(refreshToken);
        }
        setIsAuthChecked(true); // we can now render the rest of the components
    }, []);

    return (
        <BrowserRouter>
            <GlobalStyle />
            <Div>
                <Nav />
                {isAuthChecked && (
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/oauth2/tokens"
                            element={<OAuth2RedirectHandler />}
                        />
                        <Route path="/received" element={<ReceivedCoupons />} />
                        <Route path="/sent" element={<SentCoupons />} />
                        <Route path="/new" element={<NewCoupon />} />
                    </Routes>
                )}
                {showToast && <CustomToast />}
            </Div>
        </BrowserRouter>
    );
};

const Div = styled.div`
    width: 100vw;
    height: fit-content;
`;

export default App;
