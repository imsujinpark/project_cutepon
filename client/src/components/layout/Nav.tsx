import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { DropdownMenuData } from '../../common/types';
import useDetectClickOutside from '../../hooks/useDetectClickOutside';
import logo from '../../assets/logo.png';

const Nav = () => {
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [isClicked, setIsClicked] = useDetectClickOutside(menuRef, false);
    const [isMenuActivated, setIsMenuActivated] = useState<boolean>(false);
    const [menuAnimation, setMenuAnimation] = useState<'open' | 'close' | ''>(
        ''
    );

    // for dropdown open and close animation
    useEffect(() => {
        // to prevent state being close when being rendered
        if (isMenuActivated) {
            isClicked ? setMenuAnimation('open') : setMenuAnimation('close');
        }
    }, [isClicked]);

    const menus: DropdownMenuData[] = [
        {
            name: 'Received Coupons',
            path: '/received',
        },
        {
            name: 'Sent Coupons',
            path: '/sent',
        },
        {
            name: 'Send New Coupon!',
            path: '/new',
        },
    ];

    const handleMenuClick = (): void => {
        setIsClicked(!isClicked);
        setIsMenuActivated(true);
    };

    return (
        <OuterContainer>
            <Container>
                <IconWrapper>
                    <StyledFontAwesomeIcon
                        icon={faBars}
                        title="menu"
                        ref={menuRef}
                        onClick={handleMenuClick}
                    />
                </IconWrapper>
                <Logo
                    onClick={() => {
                        navigate('/');
                    }}
                >
                    <img src={logo} alt="logo"></img>
                </Logo>
                <Link to="/login">
                    <IconWrapper>
                        <StyledFontAwesomeIcon
                            icon={faRightToBracket}
                            title="login"
                        />
                    </IconWrapper>
                </Link>
            </Container>
            <DropDown className={menuAnimation}>
                <ul>
                    {menus.map((menu, idx) => {
                        return (
                            <NavLink
                                key={idx}
                                to={menu.path}
                                className={({ isActive }) =>
                                    isActive ? 'selected' : ''
                                }
                            >
                                <li>{menu.name}</li>
                            </NavLink>
                        );
                    })}
                </ul>
            </DropDown>
        </OuterContainer>
    );
};

// animation keyframes

const slideIn = keyframes`
    from {
        transform: translateY(0px);
    }
    to {
        transform: translateY(110px);
    }

    0% {
        opacity: 0;
    }
    10% {
        opacity: 0.8;
    }
    100% {
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateY(110%);
    }
    to {
        transform: translateY(0px);
    }

    0% {
        opacity: 1;
    }
    90% {
        opacity: 0.8;
    }
    100% {
        opacity: 0;
    }
`;

// styled components

// nav + dropdown
const OuterContainer = styled.div`
    width: 100%;
    height: 60px;
    overflow: hidden;
    position: sticky;
    position: -webkit-sticky;
    top: 0;
    z-index: 9999;
`;

// nav
const Container = styled.nav`
    background-color: var(--primary-500);
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    z-index: 9999;
    > * {
        color: var(--white);
    }
`;

const IconWrapper = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 24px;
`;
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    font-size: 24px;
    cursor: pointer;
`;

const Logo = styled.div`
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    > img {
        width: 88px;
    }
`;

const DropDown = styled.nav`
    position: fixed;
    top: -50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--liver-500);
    box-shadow: var(--shadow-low);
    z-index: 9998;

    &.open {
        animation: ${slideIn} 0.5s ease-in-out 0s 1 normal forwards;
        opacity: 100%;
    }

    &.close {
        animation: ${slideOut} 0.5s ease-in-out 0s 1 normal forwards;
    }

    > ul {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100vw;
        > * {
            width: 100%;
            color: var(--liver-500);
            > li {
                width: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background-color: var(--lightpink-400);
                padding: 10px 0;
                font-size: 12px;
            }
            // every menu li except the last one
            :not(:last-of-type) > li {
                border-bottom: 1px solid var(--ecru-100);
            }
            /* // last li
            :last-of-type > li {
                background-color: var(--ecru-200);
            } */
            &:hover > li {
                background-color: var(--lightpink-300);
                text-shadow: var(--text-shadow);
            }
            &.selected > li {
                background-color: var(--ecru-500);
                font-weight: bold;
                color: var(--liver-400);
            }
        }
    }
`;

export default Nav;
