import styled from "styled-components";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Status, StatusText } from "../../common/constants";
import Button from "../common/Button";
import { OptionType, CouponMode } from "../../common/types";

const OptionTab = () => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	// console.log({ pathname });

	const { status } = useParams();
	// console.log({ status });

	const options: OptionType[] = [
		{
			mode: Status.ACTIVE as CouponMode,
			text: StatusText.ACTIVE,
		},
		{
			mode: Status.DISABLED as CouponMode,
			text: StatusText.DISABLED,
		},
	];

	const handleClick = (mode: CouponMode) => {
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
