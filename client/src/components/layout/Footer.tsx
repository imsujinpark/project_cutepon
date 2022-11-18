import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
	return (
		<Container>
			<LeftBox>
				<LeftTop>PROJECT CUTEPON</LeftTop>
				<LeftBottom>
					<a href="mailto: project.cutepon@gmail.com">
						<FontAwesomeIcon icon={faEnvelope} />
					</a>
					<a href="https://github.com/imsujinpark/project_cutepon" target="_blank" rel="noreferrer">
						<FontAwesomeIcon icon={faGithub} />
					</a>
				</LeftBottom>
			</LeftBox>
			<RightBox>
				<div>
					{/* <div className="position">BE</div> */}
					<div className="name">Oscar Aguinagalde</div>
					<a href="https://github.com/OAguinagalde" target="_blank" rel="noreferrer">
						<FontAwesomeIcon icon={faGithub} />
					</a>
				</div>
				<div>
					{/* <div className="position">FE</div> */}
					<div className="name">Sujin Park</div>
					<a href="https://github.com/imsujinpark/" target="_blank" rel="noreferrer">
						<FontAwesomeIcon icon={faGithub} />
					</a>
				</div>
			</RightBox>
		</Container>
	);
};

const Container = styled.div`
    width: 100%;
    display: flex;
    /* flex-direction: column; */
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    padding: 12px 0px 8px 0;
    background-color: var(--liver-400);
    color: var(--white);
    font-size: 14px;
    a {
        color: var(--white);
    }
`;
// Project name + contact info
const LeftBox = styled.div`
    /* padding-bottom: 16px; */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 8px 0;
`;
// Project name
const LeftTop = styled.div`
    margin-bottom: 8px;
    font-weight: bold;
`;
// contact info
const LeftBottom = styled.div`
    > * {
        margin-right: 16px;
    }
`;
// Contributor
const RightBox = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: end;
    margin: 8px 0;
    // wraps position, name, a tag of icon
    > div {
        width: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    > div:not(:last-of-type) {
        margin-right: 8px;
    }
    .position {
        text-align: center;
        margin-bottom: 8px;
        border: 1px solid var(--white);
        width: 26px;
        border-radius: 2px;
        font-size: 11px;
    }
    .name {
        font-size: 11px;
        text-align: center;
        margin-bottom: 8px;
    }
`;
export default Footer;