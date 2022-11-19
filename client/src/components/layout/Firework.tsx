import styled from "styled-components";

const Firework = () => {
	return (
		<Container>
			<div className="firework" id="firework1">
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
			</div>
			<div className="firework" id="firework2">
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
			</div>
			<div className="firework" id="firework3">
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
				<div className="explosion"></div>
			</div>
		</Container>
	);
};
// modified the code by Minzcode (https://codepen.io/MinzCode/pen/abmwmOG)
const Container = styled.div`
    z-index: 9999;
    margin: 0;
	padding: 0;
	height: 100vh;
	display: flex;
	justify-content: center;
    position: fixed;
    left: 50vw;
    top: -10vh;
	align-items: center;
	background-color: none;
    .firework {
	    position: absolute;
    }
    .explosion {
        position: absolute;
        left: -2px;
        bottom: 0;
        width: 4px;
        height: 80px;
        transform-origin: 50% 100%;
        /* background-color: rgba(0,0,0,.2); */
        overflow: hidden;
    }
    .explosion:nth-child(1) {
        transform: rotate(0deg) translateY(-15px);
    }
    .explosion:nth-child(2) {
        transform: rotate(30deg) translateY(-15px);
    }
    .explosion:nth-child(3) {
        transform: rotate(60deg) translateY(-15px);
    }
    .explosion:nth-child(4) {
        transform: rotate(90deg) translateY(-15px);
    }
    .explosion:nth-child(5) {
        transform: rotate(120deg) translateY(-15px);
    }
    .explosion:nth-child(6) {
        transform: rotate(150deg) translateY(-15px);
    }
    .explosion:nth-child(7) {
        transform: rotate(180deg) translateY(-15px);
    }
    .explosion:nth-child(8) {
        transform: rotate(210deg) translateY(-15px);
    }
    .explosion:nth-child(9) {
        transform: rotate(240deg) translateY(-15px);
    }
    .explosion:nth-child(10) {
        transform: rotate(270deg) translateY(-15px);
    }
    .explosion:nth-child(11) {
        transform: rotate(300deg) translateY(-15px);
    }
    .explosion:nth-child(12) {
        transform: rotate(330deg) translateY(-15px);
    }

    .explosion::before {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        top: 100%;
        height: 40px;
        background-color: #f5cf52;
    }
    @keyframes explosion {
        0% {
            top: 100%;
        }
        33%, 100% {
            top: -50%;
        }
    }

    #firework1 {
        left: 50%;
        top: 50%;
        transform: scale(1);
    }
    #firework1 .explosion::before {
        animation: explosion 2s ease-in-out infinite;
    }

    #firework2 {
        left: 40%;
        top: 45%;
        transform: scale(.7);
    }
    #firework2 .explosion::before {
        animation: explosion 2s .6s ease-in-out infinite;
    }

    #firework3 {
        left: 60%;
        top: 65%;
        transform: scale(.4);
    }
    #firework3 .explosion::before {
        animation: explosion 2s .4s ease-in-out infinite;
    }

`;

export default Firework;
