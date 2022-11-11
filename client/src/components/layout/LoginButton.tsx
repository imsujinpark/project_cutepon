import styled from 'styled-components';
import { LoginButtonRule } from '../../common/types';

const LoginButton = (props: LoginButtonRule) => {
    const { title, image } = props.loginButtonData;

    return (
        // the below link should change more dynamically when more oauth login feature is added
        <a href="/oauth2/google">
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
