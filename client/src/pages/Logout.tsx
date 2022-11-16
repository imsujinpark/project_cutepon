import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// external functions
import { purge } from "../common/utils";
// redux related
import { useDispatch } from "react-redux";
import { logoutFulfilled } from "../features/userSlice";
import { setNoticeToast } from "../features/toastSlice";

const Logout = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	useEffect(() => {
		logout();
	}, []);

	const logout = () => {
		dispatch(logoutFulfilled()); // changes login state in redux slice
		setTimeout(() => purge(), 1000); // will remove login info from session storage
		dispatch(setNoticeToast("Successfully logged out"));
		// window.location.reload(); // refresh to remove remaining silent refresh function timeout
		navigate("/");
	};

	return <div>Logging out...</div>;
};

export default Logout;
