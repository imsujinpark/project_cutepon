import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// external components & fuctions
import { couponRequest } from "../common/utils";
// redux related
import { useDispatch } from "react-redux";
import { setNoticeToast, setWarningToast } from "../features/toastSlice";

const Home = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const hello = async () => {
		const {data, message, path, error} = await couponRequest("get", "/api/hello");
		
		// Unhandled server error
		if (error) {
			console.log(error);
		}
		// handled server error requires warning toast & navigate action
		else if (message && path) {
			dispatch(setWarningToast(message));
			navigate(path);
		}
		// handled server error requires only warning toast
		else if (message) {
			dispatch(setWarningToast(message));
		}
		// no error
		else {
			dispatch(setNoticeToast(data));
			console.log(data);
		}
	};

	const toastTest = () => {
		dispatch(setNoticeToast("does it work?"));
	};
	const toastTest2 = () => {
		dispatch(setWarningToast("it doesnt work"));
	};

	return (
		<Container>
			<div>Home</div>
			<button onClick={hello}>Who am I?</button>
			<button onClick={toastTest}>notice toaster</button>
			<button onClick={toastTest2}>warning toaster</button>
		</Container>
	);
};

const Container = styled.div`
    width: 100%;
    padding: 48px 0 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
`;

export default Home;
