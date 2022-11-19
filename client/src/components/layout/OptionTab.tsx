import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import Button from "../common/Button";
import { OptionType, CouponOption } from "../../common/types";

const OptionTab = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	// console.log({ pathname });

	const { status } = useParams();
	// console.log({ status });

	const options: OptionType[] = [
		{
			mode: "active",
			text: "Active",
		},
		{
			mode: "disabled",
			text: "Disabled",
		},
	];

	const handleClick = (mode: CouponOption) => {
		if (
			pathname === "/received/active" ||
            pathname === "/received/disabled"
		) {
			navigate(`/received/${mode}`);
		}
		else if (
			pathname === "/sent/active" ||
            pathname === "/sent/disabled"
		) {
			navigate(`/sent/${mode}`);
		}
		else {
			console.log("wrong path");
			navigate("/");
		}
	};

	return (
		<OptionWrapper>
			{options.map((option, idx) => {
				return (
					<Button
						key={idx}
						content={option.text}
						className={`small curve ${
							status === option.mode ? "darkliver" : "grey"
						}`}
						onClick={() => {
							handleClick(option.mode);
						}}
					/>
				);
			})}
		</OptionWrapper>
	);
};

const OptionWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 200px;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 16px;
`;

export default OptionTab;
