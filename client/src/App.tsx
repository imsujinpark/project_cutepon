import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Nav from './components/layout/Nav';
import GlobalStyle from './GlobalStyle';
import Home from './pages/Home';
import Login from './pages/Login';
import NewCoupon from './pages/NewCoupon';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ReceivedCoupons from './pages/ReceivedCoupons';
import SentCoupons from './pages/SentCoupons';

import axios from 'axios';

import { useSelector } from 'react-redux';
import { RootState } from './store';

const App: React.FunctionComponent = () => {
    const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
    console.log({ isAuthChecked });

    // login status
    const { isLoggedIn, token, refreshToken } = useSelector(
        (state: RootState) => {
            return state.user;
        }
    );

    console.log({ isLoggedIn, token, refreshToken });

    // useEffect(() => {
    //     if (isLoggedIn) {
    //         axios.defaults.headers.common['Authorization'] = token;
    //     }
    //     setIsAuthChecked(true);
    // }, []);

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
            </Div>
        </BrowserRouter>
    );
};

const Div = styled.div`
    width: 100vw;
    height: fit-content;
`;

export default App;
