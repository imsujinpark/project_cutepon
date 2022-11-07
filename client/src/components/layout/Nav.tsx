import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Nav = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <StyledFontAwesomeIcon icon={faBars} title="menu" />
            <Logo
                onClick={() => {
                    navigate('/');
                }}
            >
                <strong>CUTE</strong>PON
            </Logo>
            <StyledFontAwesomeIcon
                icon={faRightToBracket}
                title="login"
                onClick={() => {
                    console.log(`hi`);
                    navigate('/login');
                }}
            />
        </Container>
    );
};

export default Nav;

const Container = styled.nav`
    background-color: var(--primary-500);
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > * {
        color: var(--white);
    }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    font-size: 24px;
    margin: 0 24px;
    cursor: pointer;
`;

const Logo = styled.span`
    cursor: pointer;
    font-size: 20px;
`;
