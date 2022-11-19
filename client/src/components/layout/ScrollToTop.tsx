// scrolls to the top when routes changes and shows different component
// check App.js for usage

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {

	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({
			top: 0, left: 0, behavior: "auto"
		});
	}, [pathname]);

	return null;
};

export default ScrollToTop;