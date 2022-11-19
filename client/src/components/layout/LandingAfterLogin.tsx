import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// external functions
import { couponRequest } from "../../common/utils";
// redux related
import { useDispatch, useSelector } from "react-redux";
import { setNoticeToast, setWarningToast } from "../../features/toastSlice";

const LandingAfterLogin = () => {

	// const [userName, setUserName] = useState<string>("");
	// const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		navigate("/received/active");
	}, []);

	// useEffect(() => {
	// 	hello();
	// }, []);

	// const hello = async () => {
	// 	const {data, message, path, error} = await couponRequest("get", "/api/hello");
		
	// 	// Unhandled server error
	// 	if (error) {
	// 		console.log(error);
	// 	}
	// 	// handled server error requires warning toast & navigate action
	// 	else if (message && path) {
	// 		dispatch(setWarningToast(message));
	// 		navigate(path);
	// 	}
	// 	// handled server error requires only warning toast
	// 	else if (message) {
	// 		dispatch(setWarningToast(message));
	// 	}
	// 	// no error
	// 	else {
	// 		setUserName(data);
	// 	}
	// };

    
	return (
		<Container>
			{/* <div>{userName}</div> */}
			<div>Home</div>
		</Container>
	);
};
// styled components
const Container = styled.div`
	width: 100%;
	height: 90vh;
    padding: 36px 0 36px 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
	* {
		color: var(--liver-800);
	}
`;

const Greeting = styled.div`
    
`;
export default LandingAfterLogin;