import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBars,
    faRightToBracket,
    faBell,
    faFaceSmile,
    faFaceSurprise,
} from '@fortawesome/free-solid-svg-icons';
import { DropdownMenuData } from '../../common/types';
import useDetectClickOutside from '../../hooks/useDetectClickOutside';
import logo from '../../assets/logo.png';
// redux related
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Nav = () => {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const profileRef = useRef(null);

    // login status
    const { isLoggedIn } = useSelector((state: RootState) => {
        return state.user;
    });

    // these states are for Menu Dropdown on the left side
    const [isMenuClicked, setIsMenuClicked] = useDetectClickOutside(
        menuRef,
        false
    );
    const [isMenuActivated, setIsMenuActivated] = useState<boolean>(false); // this state shows whether menu button has been clicked at least once
    const [menuAnimation, setMenuAnimation] = useState<'open' | 'close' | ''>(
        ''
    );

    // these states are for profile Dropdown on the right side
    const [isProfileClicked, setIsProfileClicked] = useDetectClickOutside(
        profileRef,
        false
    );
    const [isProfileActivated, setIsProfileActivated] =
        useState<boolean>(false);
    const [profileAnimation, setProfileAnimation] = useState<
        'open' | 'close' | ''
    >('');

    // for dropdown open and close animation
    useEffect(() => {
        // to prevent state being close when being rendered, check if menu button has ever been clicked
        if (isMenuActivated) {
            isMenuClicked
                ? setMenuAnimation('open')
                : setMenuAnimation('close');
        }
    }, [isMenuClicked]);

    useEffect(() => {
        // to prevent state being close when being rendered, check if menu button has ever been clicked
        if (isProfileActivated) {
            isProfileClicked
                ? setProfileAnimation('open')
                : setProfileAnimation('close');
        }
    }, [isProfileClicked]);

    const menus: DropdownMenuData[] = [
        {
            name: 'Received Coupons',
            path: '/received/active',
        },
        {
            name: 'Sent Coupons',
            path: '/sent/active',
        },
        {
            name: 'Send New Coupon!',
            path: '/new',
        },
    ];

    const profileOptions: DropdownMenuData[] = [
        {
            name: 'Logout',
            path: '/logout',
        },
    ];

    const handleMenuClick = (): void => {
        setIsMenuClicked(!isMenuClicked);
        setIsMenuActivated(true);
    };

    const handleProfileClick = (): void => {
        setIsProfileClicked(!isProfileClicked);
        setIsProfileActivated(true);
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
                {isLoggedIn ? (
                    <RightSideWrapper>
                        <IconWrapper>
                            <StyledFontAwesomeIcon
                                icon={
                                    isProfileClicked
                                        ? faFaceSurprise
                                        : faFaceSmile
                                }
                                title="profile"
                                ref={profileRef}
                                onClick={handleProfileClick}
                            />
                        </IconWrapper>
                        <IconWrapper>
                            <StyledFontAwesomeIcon
                                icon={faBell}
                                title="notification"
                            />
                        </IconWrapper>
                    </RightSideWrapper>
                ) : (
                    <Link to="/login">
                        <RightSideWrapper>
                            <IconWrapper>
                                <StyledFontAwesomeIcon
                                    icon={faRightToBracket}
                                    title="login"
                                />
                            </IconWrapper>
                        </RightSideWrapper>
                    </Link>
                )}
            </Container>
            <MenuDropDown className={menuAnimation}>
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
            </MenuDropDown>
            <ProfileDropDown
                className={profileAnimation}
                onClick={() => setIsProfileClicked(false)}
            >
                <ul>
                    {profileOptions.map((item, idx) => {
                        return (
                            <NavLink
                                key={idx}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? 'selected' : ''
                                }
                            >
                                <li>{item.name}</li>
                            </NavLink>
                        );
                    })}
                </ul>
            </ProfileDropDown>
        </OuterContainer>
    );
};

// animation keyframes

const slideInForMenu = keyframes`
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

const slideOutForMenu = keyframes`
    from {
        transform: translateY(110px);
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

const slideInForProfile = keyframes`
    from {
        transform: translateY(0px);
    }
    to {
        transform: translateY(40px);
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

const slideOutForProfile = keyframes`
    from {
        transform: translateY(40px);
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

const RightSideWrapper = styled.div`
    width: 93px;
    display: flex;
    flex-direction: row;
    margin: 0 12px 0 30px;
    justify-content: flex-end;
    align-items: center;
    > * {
        margin: 0 12px 0 12px;
        width: 24px;
    }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    font-size: 24px;
    cursor: pointer;
    &:active {
        font-size: 22px;
    }
`;

const Logo = styled.div`
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 66px; // to make logo come to the middle
    > img {
        width: 88px;
    }
`;

const MenuDropDown = styled.nav`
    position: fixed;
    top: -50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--liver-500);
    box-shadow: var(--shadow-low);
    z-index: 9998;
    opacity: 0;

    &.open {
        animation: ${slideInForMenu} 0.5s ease-in-out 0s 1 normal forwards;
        opacity: 100%;
    }

    &.close {
        animation: ${slideOutForMenu} 0.5s ease-in-out 0s 1 normal forwards;
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

const ProfileDropDown = styled.nav`
    position: fixed;
    top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--liver-500);
    box-shadow: var(--shadow-low);
    z-index: 9998;
    opacity: 0;

    &.open {
        animation: ${slideInForProfile} 0.5s ease-in-out 0s 1 normal forwards;
        opacity: 100%;
    }

    &.close {
        animation: ${slideOutForProfile} 0.5s ease-in-out 0s 1 normal forwards;
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
