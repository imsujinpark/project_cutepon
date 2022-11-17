import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
// external components & fuctions
import Button from "../common/Button";
import DummyCoupon from "./DummyCoupon";
import { nowToYYYYMMDD } from "../../common/utils";
import { FormValues } from "../../common/types";

const LandingBeforeLogin = () => {
	const dummyData: FormValues = {
		target_user: "My Bestie 😘",
		title: "Special lunch on me",
		description: "You can ask me to take you out on a special lunch on the day of your choice.",
		expiration_date: nowToYYYYMMDD(),
	};
	const [targetUser, setTargetUser] = useState<string>(dummyData.target_user);
	const [title, setTitle] = useState<string>(dummyData.title);
	const [description, setDescription] = useState<string>(dummyData.description);
	const [expirationDate, setExpirationDate] = useState<string>(dummyData.expiration_date);
	const payload = {
		target_user: targetUser,
		title: title,
		description: description,
		expiration_date: expirationDate,
	};

	// const productIntro1 = "Send coupons with CUTEPON!";
	// const productIntro2 = "Receive coupons with CUTEPON!!";
	// const productIntro3 = "Cutepon with CUTEPON!!!";
	const productIntro1 = "CUTEPON allows you to";
	const productIntro2 = "send and receive coupons";
	const productIntro3 = "with your friends and family";
	const firstTargetStr = "Let's try it!\nFill in your coupon details.\nThen click the \"Send\" button.";
	const secondTargetStr = "Ta-da!\nYou made your first coupon!\nNow click to redeem.";
	const thirdTargetStr = "Congratulations!\nYou are now ready to CUTEPON.\nLog in for more!";

	const [introTypedStr1, setIntroTypedStr1] = useState<string>("");
	const [introTypedStr2, setIntroTypedStr2] = useState<string>("");
	const [introTypedStr3, setIntroTypedStr3] = useState<string>("");
	const [firstTypedStr, setFirstTypedStr] = useState<string>("");
	const [secondTypedStr, setSecondTypedStr] = useState<string>("");
	const [thirdTypedStr, setThirdTypedStr] = useState<string>("");

	const [showCouponEditor, setShowCouponEditor] = useState<boolean>(false);
	const [couponSent, setCouponSent] = useState<boolean>(false);
	const [couponRedeemeed, setCouponRedeemed] = useState<boolean>(false);

	const couponRef = useRef<HTMLDivElement>(null);
	const loginRef = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();

	useEffect(() => {
		intro();
	}, []);

	const intro = async() => {
		await typer(productIntro1, 20, (str) => setIntroTypedStr1(str), async() => await pause(20));
		await typer(productIntro2, 20, (str) => setIntroTypedStr2(str), async() => await pause(20));
		await typer(productIntro3, 20, (str) => setIntroTypedStr3(str), async() => await pause(1200));
		await typer(firstTargetStr, 50, (str) => setFirstTypedStr(str), async() => {
			await pause(500);
			setShowCouponEditor(true);
		});
	};

	// converts a function returning callback to return a promise
	const promisify = (func: (...args: any) => any) => (...args: any) =>
		new Promise((resolve, reject) =>
			func(...args, (err: Error, result: any) =>
				err ? reject(err) : resolve(result)
			)
		);
	// interval between each typed letter
	const pause = promisify((arg: number, func: () => void)  => setTimeout(func, arg));
	// addes given string by one character into the 
	const typer = async (msg: string, interval: number, onUpdate: (str:string) => void, onFinished?: () => Promise<any>) => {
		let result = "";
		for(let i = 0; i < msg.length; i++) {
			result += msg[i] === "\n" ? "<br/>" : msg[i];
			onUpdate(result);
			await pause(interval);
		}
		await onFinished?.();
	};

	const handleSend = async() => {
		setCouponSent(true);
		setTimeout(function () {
			couponRef.current && couponRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		}, 100);
		await typer(secondTargetStr, 50, (str) => setSecondTypedStr(str));
	};

	const handleRedeem = async() => {
		setCouponRedeemed(true);
		setTimeout(function () {
			loginRef.current && loginRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		}, 100);
		await typer(thirdTargetStr, 50, (str) => setThirdTypedStr(str));
	};
	
	return (
		<Container>
			<InnerContainer>
				{/* PRODUCT INTO */}
				<TyperWrapper className="oneLine bold darkpink center">{introTypedStr1}</TyperWrapper>
				<TyperWrapper className="oneLine bold darkpink center">{introTypedStr2}</TyperWrapper>
				<TyperWrapper className="oneLine bold darkpink center">{introTypedStr3}</TyperWrapper>
				<TyperWrapper 
					dangerouslySetInnerHTML={{
						__html: firstTypedStr
					}}
					className={`threeLines small wrap shadow ${!firstTypedStr.length && "invisible"}`}
				/>
				{showCouponEditor && <FadeInWrapper>
					<OuterCoupon>
						<InnerCoupon>
							<TargetWrapper>
								<span>To.&nbsp;</span>
								<input 
									type="text" 
									value={targetUser} 
									maxLength={10}
									className="targetUser" 
									onChange={(e) => setTargetUser(e.target.value)}
								/>
							</TargetWrapper>
							<input 
								type="text" 
								value={title}
								maxLength={20}
								className="title"
								onChange={(e) => setTitle(e.target.value)}
							/>
							<textarea 
								value={description} 
								maxLength={89}
								className="description"
								onChange={(e) => setDescription(e.target.value)}
							/>
							<DateWrapper>
								<span>Expires on </span>
								<input 
									type="date" 
									value={expirationDate} 
									className="expirationDate" 
									min={nowToYYYYMMDD()}
									onChange={(e) => setExpirationDate(e.target.value)}
								/>
							</DateWrapper>
						</InnerCoupon>
					</OuterCoupon>
					{/* when send button is pressed, stop shaking */}
					<Button 
						content="Send" 
						className={`lightpink large ${!couponSent && "shake"}`} 
						onClick={handleSend}
					/>
				</FadeInWrapper>}
				<TyperWrapper 
					dangerouslySetInnerHTML={{
						__html: secondTypedStr
					}}
					className={`threeLines small wrap shadow ${!secondTypedStr.length && "invisible"}`}
				/>
				{couponSent && <FadeInWrapper ref={couponRef}>
					<DummyCoupon 
						data={payload}
						className={`${secondTypedStr.length > 62 && !couponRedeemeed && "shake"}`}
						redeemHandler={handleRedeem}
					/>
				</FadeInWrapper>}
				<TyperWrapper 
					dangerouslySetInnerHTML={{
						__html: thirdTypedStr
					}}
					className={`threeLines small wrap shadow ${!thirdTypedStr.length && "invisible"}`}
					ref={loginRef}
				/>
				{couponRedeemeed && thirdTypedStr.length > 70 && <FadeInWrapper>
					<Button 
						content="Log in" 
						className={`primary ${thirdTypedStr.length > 38 && "shake"}`}
						onClick={() => navigate("/login")}
					/>	
				</FadeInWrapper>}
			</InnerContainer>
		</Container>
	);
};

// keyframes animation
const fadeIn = keyframes`
    from {
		opacity: 0;
    }
    to {
        opacity: 1;
    }
`;
// styled components
const Container = styled.div`
	width: 100%;
	height: 1100px;
    padding: 36px 0 36px 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
	* {
		color: var(--liver-800);
	}
`;

const InnerContainer = styled.div`
	max-width: 98vw;
    width: 352px;
	display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
`;

const TyperWrapper = styled.div`
	width: 340px;
	margin-bottom: 12px;
	line-height: 22px;
	color: var(--liver-700);
	&.threeLines {
		height: 76px;
		margin-top: 24px;
	}
	&.oneLine {
		line-height: 12px;
	}
	&.darkpink {
		color: var(--primary-700);
	}
	&.bold {
		font-weight: bold;
	}
	&.center {
		text-align: center;
	}
	&.small {
		font-size: 14px;
	}
	&.wrap {
		width: 352px;
		padding: 4px 16px;
		background-color: var(--liver-100);
		border-radius: 8px;
	}
	&.invisible {
		display: none;
	}
	&.shadow {
		box-shadow: var(--shadow-low);
	}
`;

const FadeInWrapper = styled.div`
	margin-bottom: 36px;
	animation: ${fadeIn} 0.5s;
`;

const OuterCoupon = styled.div`
    width: 100%;
	border: 4px solid var(--lightpink-300);
    border-left: 20px solid var(--lightpink-300);
    background-color: var(--ecru-200);
    border-radius: 6px;
	margin-bottom: 8px;
`;

const InnerCoupon = styled.div`
    border-left: 2px dashed var(--lightpink-300);
	max-width: 92vw;
    width: 328px;
	display: flex;
	flex-direction: column;
	> * {
		border: none;
		border-bottom: 1px solid var(--lightpink-300);
		padding: 4px 8px;
		background: transparent;
	}
	>.title {
		font-size: 15px;
		height: 32px;
	}
	>.description {
		resize: none;
		height: 38px;
		color: var(--liver-300);
		font-size: 12px;
	}
`;

const TargetWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
	> * {
		border: none;
		background: transparent;
		font-size: 12px;
	}
`;

const DateWrapper = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	align-items: center;
	> * {
		border: none;
		background: transparent;
		font-size: 12px;
		color: var(--liver-400);
		text-align: end;
	}
	>span {
		color: var(--liver-300);
	}
	>.expirationDate {
		width: 100px;
	}
`;

export default LandingBeforeLogin;
