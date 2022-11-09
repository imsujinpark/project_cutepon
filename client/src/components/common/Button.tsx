import styled from 'styled-components';

type Class = {
    className?: string;
    content: string;
    onClick?: { (): void };
};

const Button = ({ className, content, onClick }: Class) => {
    return (
        <StyledButton className={className} onClick={onClick}>
            {content}
        </StyledButton>
    );
};

const StyledButton = styled.button`
    width: 100px;
    height: 48px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 12px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    &.grey {
        background-color: var(--liver-200);
        color: var(--liver-600);
    }
    &.darkliver {
        background-color: var(--liver-500);
        color: var(--white);
    }
    &.lightpink {
        background-color: var(--lightpink-400);
        color: var(--liver-600);
    }
    &.primary {
        background-color: var(--primary-500);
        color: var(--white);
    }
    &.small {
        width: 88px;
        height: 30px;
        font-size: 10px;
    }
    &.curve {
        border-radius: 12px;
    }
`;

export default Button;
