// external components
import LandingBeforeLogin from "../components/layout/LandingBeforeLogin";
import LandingAfterLogin from "../components/layout/LandingAfterLogin";
// redux related
import { useSelector } from "react-redux";
import { RootState } from "../store";

const Home = () => {
	// login status
	const { isLoggedIn } = useSelector(
		(state: RootState) => {
			return state.user;
		}
	);

	return (
		<>
			{isLoggedIn ? <LandingAfterLogin /> : <LandingBeforeLogin />}
		</>
	);
};

export default Home;
