// external components
import LandingBeforeLogin from "../components/layout/LandingBeforeLogin";
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
			{isLoggedIn ? <LandingBeforeLogin /> : <LandingBeforeLogin />}
		</>
	);
};

export default Home;
