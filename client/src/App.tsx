import React, { Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import styled from "styled-components";
// external components and functions
import Nav from "./components/layout/Nav";
import GlobalStyle from "./GlobalStyle";
import Login from "./pages/Login";
import NewCoupon from "./pages/NewCoupon";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import CustomToast from "./components/common/CustomToast";
import Logout from "./pages/Logout";
import ScrollToTop from "./components/layout/ScrollToTop";
import { silentRefresh } from "./common/utils";
// redux related
import { useSelector } from "react-redux";
import { RootState } from "./store";
// font-awesome icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const App = () => {
	// React.lazy imports
	const Home = React.lazy(() => import("./pages/Home"));
	const ReceivedCoupons = React.lazy(() => import("./pages/ReceivedCoupons"));
	const SentCoupons = React.lazy(() => import("./pages/SentCoupons"));

	// this state is to prevent component rendering before default header is set for http request when logged in
	// if the rendering takes too long, a loading component might be added in the future
	const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

	// login status
	const { isLoggedIn, token, refreshToken } = useSelector(
		(state: RootState) => {
			return state.user;
		}
	);

	const { showToast } = useSelector((state: RootState) => {
		return state.toast;
	});

	// this will let the default headers to be set first before rendering certain components
	const preventRenderBeforeAuth = async () => {
		// if the user is logged in and refresh token exists, call silent refresh function
		if (isLoggedIn && refreshToken !== null) {
			await silentRefresh(refreshToken);
		}
		setIsAuthChecked(true); // we can now render the rest of the components
	};

	useEffect(() => {
		preventRenderBeforeAuth();
	}, []);

	return (
		<Div>
			<BrowserRouter>
				<GlobalStyle />
				<ScrollToTop />
				<Nav />
				{isAuthChecked && (
					<Suspense
						fallback={
							<Loader>
								<FontAwesomeIcon icon={faSpinner} spin />
							</Loader>
						}
					>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/login" element={<Login />} />
							<Route
								path="/oauth2/tokens"
								element={<OAuth2RedirectHandler />}
							/>
							<Route
								path="/received/:status"
								element={<ReceivedCoupons />}
							/>
							<Route path="/sent/:status" element={<SentCoupons />} />
							<Route path="/new" element={<NewCoupon />} />
							<Route path="/logout" element={<Logout />} />
						</Routes>
					</Suspense>
				)}
				{showToast && <CustomToast />}
			</BrowserRouter>
		</Div>
	);
};

const Div = styled.div`
    width: 100vw;
    height: fit-content;
`;

const Loader = styled.div`
    width: 100vw;
    height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    > * {
        color: var(--primary-500);
        font-size: 36px;
    }
`;

export default App;
