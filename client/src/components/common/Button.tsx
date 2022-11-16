import styled from "styled-components";

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
`;

export default Button;
