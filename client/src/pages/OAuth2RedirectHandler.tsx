import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { silentRefresh } from "../common/utils";
// redux related
import { useDispatch } from "react-redux";
import { loginFulfilled } from "../features/userSlice";
import { setNoticeToast } from "../features/toastSlice";

// this is a component rendering when user is redirected after a successful Oauth login
const OAuth2RedirectHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const token = searchParams.get("token"); // token taken from redirected url
	const refreshToken = searchParams.get("refresh_token"); // refresh token taken from redirected url

	useEffect(() => {
		OAuthRedirector();
	}, []);

	const OAuthRedirector = () => {
		dispatch(
			loginFulfilled({
				token: token,
				refreshToken: refreshToken,
			})
		);
		axios.defaults.headers.common["Authorization"] = token;
		if (refreshToken !== null) {
			silentRefresh(refreshToken);
		}
		dispatch(setNoticeToast("Successfully logged in"));
		navigate("/received/active");
	};

	return (
		<div>
			<div>OAuth2.0 Redirect Page</div>s
		</div>
	);
};

export default OAuth2RedirectHandler;
