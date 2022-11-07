import styled from 'styled-components';
import googleLogo from '../assets/google_logo.png';
import LoginButton from '../components/layout/LoginButton';

const Login = () => {
    const googleLogin = { title: 'Sign in with Google', image: googleLogo };

    return (
        <Container>
            <h1>Login</h1>
            <LoginButton loginButtonData={googleLogin} />
        </Container>
    );
};

const Container = styled.div`
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 48px 0 0 0;
`;

export default Login;
