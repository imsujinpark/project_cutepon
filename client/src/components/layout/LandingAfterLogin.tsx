import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const LandingAfterLogin = () => {

	const navigate = useNavigate();

	useEffect(() => {
		navigate("/received/active");
	}, []);
    
	return (
		<Container>
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

export default LandingAfterLogin;