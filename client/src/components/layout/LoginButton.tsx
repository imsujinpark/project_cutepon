import styled from 'styled-components';
import axios from 'axios';
import { LoginButtonRule } from '../../common/types';

const LoginButton = (props: LoginButtonRule) => {
    const { title, image } = props.loginButtonData;

    // const loginHandler = async (): Promise<void> => {
    //     console.log('one');

    //     try {
    //         console.log('two');
    //         const res = await axios.get(`/oauth2/google`);
    //         console.log({ res });
    //     } catch (error) {
    //         console.log('three');
    //         console.log({ error });
    //     }
    // };

    return (
        // <Button onClick={loginHandler}>
        <a href="https://cutepon.net/oauth2/google">
            <Button>
                {image && <Img src={image} alt="logo" />}
                <span>{title}</span>
            </Button>
        </a>
    );
};

const Button = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px 16px;
    border-radius: 8px;
    color: var(--liver-500);

    // title
    > span {
        font-size: 12px;
    }

    &:active {
        background-color: var(--liver-200);
        transform: translateY(2px);
    }
`;

const Img = styled.img`
    width: 16px;
    margin-right: 16px;
`;

export default LoginButton;
