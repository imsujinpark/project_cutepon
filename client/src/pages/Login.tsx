import { useEffect } from "react";
import styled from "styled-components";
import googleLogo from "../assets/google_logo.png";
import LoginButton from "../components/layout/LoginButton";
// external functions
import { purge } from "../common/utils";
// redux related
import { useDispatch } from "react-redux";
import { logoutFulfilled } from "../features/userSlice";

const Login = () => {
	const dispatch = useDispatch();

	const googleLogin = {
		title: "Continue with Google", image: googleLogo 
	};
		
	// remove any previous login info which is now invalid
	useEffect(() => {
		dispatch(logoutFulfilled());
		setTimeout(() => purge(), 500); 
	}, []);

	return (
		<Container>
			<h1>Login</h1>
			<LoginButton loginButtonData={googleLogin} />
		</Container>
	);
};

const Container = styled.div`
    width: 100vw;
	height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 48px 0 0 0;
`;

export default Login;
