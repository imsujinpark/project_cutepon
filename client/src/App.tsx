import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/layout/Nav';
import GlobalStyle from './GlobalStyle';
import Home from './pages/Home';
import Login from './pages/Login';

const App: React.FunctionComponent = () => {
    return (
        <BrowserRouter>
            <GlobalStyle />
            <Nav />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
