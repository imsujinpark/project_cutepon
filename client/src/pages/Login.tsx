import { useEffect } from "react";
import styled from "styled-components";
import googleLogo from "../assets/google_logo.png";
import LoginButton from "../components/layout/LoginButton";

// redux related
import { useDispatch } from "react-redux";
import { logoutFulfilled } from "../features/userSlice";
import { persistor } from "../index";

const Login = () => {
	const dispatch = useDispatch();

	const googleLogin = { title: "Sign in with Google", image: googleLogo };

	// purge function is to remove state from session storage
	const purge = async () => {
		await persistor.purge();
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
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 48px 0 0 0;
`;

export default Login;
