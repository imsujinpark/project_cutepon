import styled, { keyframes } from "styled-components";

type Class = {
    className?: string;
    content: string;
    onClick?: { (e: React.MouseEvent<HTMLElement>): void };
    disabled?: boolean;
};

const Button = ({ className, content, onClick, disabled }: Class) => {
	return (
		<StyledButton
			className={className}
			onClick={onClick}
			disabled={disabled}
		>
			{content}
		</StyledButton>
	);
};
// keyframes animation
const shake = keyframes`
    5%, 45% {
        transform: translate3d(-1px, 0, 0);
    }

    10%, 40% {
        transform: translate3d(2px, 0, 0);
    }

    15%, 25%, 35% {
        transform: translate3d(-4px, 0, 0);
    }

    20%, 30% {
        transform: translate3d(4px, 0, 0);
    }
    50% {
        transform: translate3d(0px, 0, 0);
    }
`;
// styled components
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
        &:active {
            background-color: var(--liver-300);
        }
    }
    &.darkliver {
        background-color: var(--liver-500);
        color: var(--white);
        &:active {
            background-color: var(--liver-600);
        }
    }
    &.lightpink {
        background-color: var(--lightpink-400);
        color: var(--liver-600);
        &:active {
            background-color: var(--primary-300);
        }
    }
    &.primary {
        background-color: var(--primary-500);
        color: var(--white);
        &:active {
            background-color: var(--primary-600);
        }
    }
    &.small {
        width: 88px;
        height: 30px;
        font-size: 10px;
    }
    &.large {
        max-width: 98vw;
        width: 352px;
        height: 36px;
        font-size: 13px;
    }
    &.curve {
        border-radius: 12px;
    }

    &:active {
        transform: translateY(2px);
    }

    &.invalid {
        opacity: 60%;
        &:active {
            transform: translateY(0px);
        }
    }
    &.shake {
        animation: ${shake} 2s infinite;
    }
`;

export default Button;
