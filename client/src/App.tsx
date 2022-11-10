import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Nav from './components/layout/Nav';
import GlobalStyle from './GlobalStyle';
import Home from './pages/Home';
import Login from './pages/Login';
import NewCoupon from './pages/NewCoupon';
import ReceivedCoupons from './pages/ReceivedCoupons';
import SentCoupons from './pages/SentCoupons';

const App: React.FunctionComponent = () => {
    return (
        <BrowserRouter>
            <GlobalStyle />
            <Div>
                <Nav />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/received" element={<ReceivedCoupons />} />
                    <Route path="/sent" element={<SentCoupons />} />
                    <Route path="/new" element={<NewCoupon />} />
                </Routes>
            </Div>
        </BrowserRouter>
    );
};

const Div = styled.div`
    width: 100vw;
    height: fit-content;
`;

export default App;
