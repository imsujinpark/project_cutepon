import { ReactElement } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import googleLogo from '../assets/google_logo.png';

const Login = (): ReactElement => {
    const loginHandler = async (): Promise<void> => {
        console.log('one');

        try {
            console.log('two');
            const res = await axios.get(`/oauth2/google`);
            console.log({ res });
        } catch (error) {
            console.log('three');
            console.log({ error });
        }
    };

    return (
        <Container>
            <Button onClick={loginHandler}>
                <Img src={googleLogo} alt="logo" />
                <span>Sign in with Google</span>
            </Button>
        </Container>
    );
};

const Container = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Button = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
`;

const Img = styled.img`
    width: 20px;
    margin-right: 16px;
`;

export default Login;
