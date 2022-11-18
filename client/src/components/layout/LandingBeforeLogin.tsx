import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
// external components & fuctions
import Button from "../common/Button";
import DummyCoupon from "./DummyCoupon";
import Firework from "./Firework";
import { nowToYYYYMMDD } from "../../common/utils";

const LandingBeforeLogin = () => {
	// the states of coupon input with default values
	const [targetUser, setTargetUser] = useState<string>("My Bestie 😘");
	const [title, setTitle] = useState<string>("Special lunch on me");
	const [description, setDescription] = useState<string>("You can ask me to take you out on a special lunch on the day of your choice.");
	const [expirationDate, setExpirationDate] = useState<string>(nowToYYYYMMDD());
	// coupon data used for Coupon component
	const payload = {
		target_user: targetUser,
		title: title,
		description: description,
		expiration_date: expirationDate,
	};

	// these are string data used for typing animation
	const productIntro1 = "CUTEPON allows you to";
	const productIntro2 = "send and receive coupons";
	const productIntro3 = "with your friends and family";
	const firstTargetStr = "Let's try it!\nFill in your coupon details.\nThen click the \"Send\" button.";
	const secondTargetStr = "Ta-da!\nYou made your first coupon!\nNow click to redeem.";
	const thirdTargetStr = "Congratulations!\nYou are now ready to CUTEPON.\nLog in for more!";
	// these are states where each char of target string will be set one by one
	// use the below state in html for typing animation
	const [introTypedStr1, setIntroTypedStr1] = useState<string>("");
	const [introTypedStr2, setIntroTypedStr2] = useState<string>("");
	const [introTypedStr3, setIntroTypedStr3] = useState<string>("");
	const [firstTypedStr, setFirstTypedStr] = useState<string>("");
	const [secondTypedStr, setSecondTypedStr] = useState<string>("");
	const [thirdTypedStr, setThirdTypedStr] = useState<string>("");
	// these states set booleans of target component rendering
	const [showCouponEditor, setShowCouponEditor] = useState<boolean>(false); 
	const [couponSent, setCouponSent] = useState<boolean>(false);
	const [couponRedeemeed, setCouponRedeemed] = useState<boolean>(false);
	// these refs are for auto scroll
	const couponRef = useRef<HTMLDivElement>(null);
	const loginRef = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();

	useEffect(() => {
		intro();
	}, []);

	// first interaction of landing page
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
	// second interaction of landing page
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
	// third interaction of landing page
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
				<TyperWrapper className="title">{introTypedStr1}</TyperWrapper>
				<TyperWrapper className="title">{introTypedStr2}</TyperWrapper>
				<TyperWrapper className="title">{introTypedStr3}</TyperWrapper>
				<TyperWrapper 
					dangerouslySetInnerHTML={{
						__html: firstTypedStr
					}}
					className={`instruction ${!firstTypedStr.length && "invisible"}`}
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
					className={`instruction ${!secondTypedStr.length && "invisible"}`}
				/>
				{/* when redeem button is pressed, stop shaking */}
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
					className={`instruction ${!thirdTypedStr.length && "invisible"}`}
					ref={loginRef}
				/>
				{couponRedeemeed && <Firework />}
				{couponRedeemeed && thirdTypedStr.length > 70 && <FadeInWrapper>
					<Button 
						content="Log in" 
						className="primary shake"
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
	height: 1200px;
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
// wraps typing animation
const TyperWrapper = styled.div`
	width: 340px;
	margin-bottom: 12px;
	line-height: 22px;
	color: var(--liver-700);
	&.title {
		font-family: Verdana, Geneva, sans-serif;
		line-height: 12px;
		font-weight: 900;
		color: var(--primary-700);
		text-align: center;
		font-size: 18px;
	}
	&.instruction {
		width: 352px;
		height: 76px;
		padding: 4px 16px;
		background-color: var(--liver-100);
		border-radius: 8px;
		margin-top: 24px;
		font-size: 14px;
		box-shadow: var(--shadow-low);
	}
	&.invisible {
		display: none;
	}
`;
// wraps components used for interaction with fade in animation
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
// wraps To.
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
