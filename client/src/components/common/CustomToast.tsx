import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { faExclamation, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// redux related
import { useSelector, useDispatch } from "react-redux";
import { closeToast } from "../../features/toastSlice";
import { RootState } from "../../store";

// mode는 warning 또는 notice
const CustomToast = () => {
	// 렌더링 후 초기 상태는 토스트 토스트 열리는 애니메이션
	const [toastAnimation, setToastAnimation] = useState("openAnimation");
	const dispatch = useDispatch();

	const { message, mode } = useSelector((state: RootState) => {
		return state.toast;
	});

	useEffect(() => {
		let toastTimer: ReturnType<typeof setTimeout>;
		// Toast animation close in 2 seconds
		// after, changes showToast to false in 0.5 second
		const animationTimer = setTimeout(() => {
			setToastAnimation("closeAnimation");
			toastTimer = setTimeout(() => {
				dispatch(closeToast());
			}, 500);
		}, 2000);
		return () => {
			clearTimeout(toastTimer);
			clearTimeout(animationTimer);
		};
	}, [message]); // when message is changed while being shown, restart timeout

	return (
		<Container className={toastAnimation}>
			<Box className={mode === "warning" ? "red" : "green"}>
				{mode === "warning" && (
					<StyledFontAwesomeIcon
						icon={faExclamation}
						className="red"
					/>
				)}
				{mode === "notice" && (
					<StyledFontAwesomeIcon icon={faCheck} className="green" />
				)}
				<Text>{message}</Text>
			</Box>
		</Container>
	);
};

const slideIn = keyframes`
    from {
        transform: translateY(-200%);
    }
    to {
        transform: translateY(0%);
    }
`;

const slideOut = keyframes`
    from {
        transform: translateY(0%);
    }
    to {
        transform: translateY(-200%);
    }
`;

const Container = styled.div`
    width: 100vw;
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    top: 10%;
    z-index: 999;

    &.openAnimation {
        animation: ${slideIn} 0.5s ease-in-out 0s 1 normal forwards;
    }

    &.closeAnimation {
        animation: ${slideOut} 0.5s ease-in-out 0s 1 normal forwards;
    }
`;

export const Box = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 14px 8px 12px;
    font-size: 12px;
    background-color: var(--liver-100);
    border-radius: 10px;
    border: none;
    box-shadow: var(--shadow-low);
    opacity: 0.9;
    &.red {
        background-color: var(--red-100);
    }
    &.green {
        background-color: var(--green-100);
    }
`;

const Text = styled.p`
    margin: 0;
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    margin-right: 16px;
    font-size: 16px;
    &.red {
        color: var(--red-500);
    }
    &.green {
        color: var(--green-500);
    }
`;

export default CustomToast;
