import { useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, {keyframes} from "styled-components";

import { FormValues } from "../../common/types";
import useDetectClickOutside from "../../hooks/useDetectClickOutside";
import Button from "../common/Button";
import { dateToYYYYYMMDDHHMM, dDayCalculator} from "../../common/utils";
// redux related
import { useDispatch } from "react-redux";
import { setNoticeToast } from "../../features/toastSlice";

type UserProps = {
    data: FormValues;
    className: string;
};
const DummyCoupon = ({ data, className }: UserProps) => {
	const {
		target_user,
		title,
		description,
		expiration_date,
	} = data;

	const dispatch = useDispatch();
	const navigate = useNavigate();
	const couponRef = useRef(null);
	// state to check if the coupon is clicked for option buttons
	const [isClicked, setIsClicked] = useDetectClickOutside(couponRef, false);

	// today's date in epoch
	const now = new Date();
	const nowToEpoch = now.getTime();

	// change expiration date: string -> Date -> change time to 23:59 local (number)
	const stringToDate = new Date(expiration_date);
	const dateToMidnightNum = stringToDate.setHours(23, 59, 59, 999);

	const handleCouponClick = (): void => {
		setIsClicked(true);
	};

	const handleRedeem = async () => {
		dispatch(setNoticeToast("Successfully redeemed"));
		// setIsClicked(false);
		// const payload = {
		// 	coupon_id: id 
		// };

		// const {data, message, path, error} = await couponRequest("post", "/api/redeem", payload);
		
		// // Unhandled server error
		// if (error) {
		// 	console.log(error);
		// }
		// // handled server error requires warning toast & navigate action
		// else if (message && path) {
		// 	dispatch(setWarningToast(message));
		// 	navigate(path);
		// }
		// // handled server error requires only warning toast
		// else if (message) {
		// 	dispatch(setWarningToast(message));
		// }
		// // no error
		// else {
		// 	console.log(data);
		// 	dispatch(setNoticeToast("Successfully redeemed"));
		// 	setTimeout(() => window.location.reload(), 500);
		// }
	};

	return (
		<OuterContainer className={className}>
			<Container
				className={`"active" ${isClicked && "blur"}`}
				onClick={handleCouponClick}
				ref={couponRef}
			>
				<InnerContainer>
					<Head>
						<h2>{title}</h2>
						<span>to. {target_user}</span>
					</Head>
					<Body title={description}>{description}</Body>
					<TailTop>Active</TailTop>
					<TailBottom>
						<span>#{dateToYYYYYMMDDHHMM(nowToEpoch)}-00</span>
						<span>{dDayCalculator(dateToMidnightNum)}</span>
					</TailBottom>
				</InnerContainer>
			</Container>
			{isClicked && (
				<ButtonWrapper>
					<Button
						content="Redeem"
						className="primary"
						onClick={handleRedeem}
					/>
				</ButtonWrapper>
			)}
		</OuterContainer>
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
const shake = keyframes`
    5%, 45% {
        transform: translate3d(-1px, 0, 0);
    }

    10%, 40% {
        transform: translate3d(2px, 0, 0);
    }

    15%, 25%, 35% {
        transform: translate3d(-4px, 0, 0);
    }

    20%, 30% {
        transform: translate3d(4px, 0, 0);
    }
    50% {
        transform: translate3d(0px, 0, 0);
    }
`;
// styled components
const OuterContainer = styled.div`
    max-width: 98vw;
    width: 360px;
    height: 120px;
    margin: 4px 0;
    animation: ${fadeIn} 0.5s;
    &.shake {
        animation: ${shake} 2s infinite;
    }
`;
const Container = styled.div`
    cursor: pointer;
    max-width: 98vw;
    width: 100%;
    height: 100%;
    border: 4px solid var(--primary-400);
    border-left: 20px solid var(--primary-400);
    background-color: var(--ecru-200);
    border-radius: 6px;

    /* // disabled coupons
    :not(&.Active) {
        background-color: var(--liver-050);
        border: 4px solid var(--liver-200);
        border-left: 20px solid var(--liver-200);

        // InnerContainer
        > div {
            border-left: 2px dashed var(--liver-200);
        }
        > div > * {
            color: var(--liver-300);
        }
    } */

    &.blur {
        opacity: 40%;
    }

    &:hover {
        border: 4px solid var(--primary-500);
        border-left: 20px solid var(--primary-500);
        background-color: var(--ecru-300);
        /* // disabled coupons
        :not(&.Active) {
            background-color: var(--liver-100);
            border: 4px solid var(--liver-300);
            border-left: 20px solid var(--liver-300);

            // InnerContainer
            > div {
                border-left: 2px dashed var(--liver-300);
            }
        } */
    }
`;

const InnerContainer = styled.div`
    max-width: 92vw;
    width: 336px;
    height: 112px;
    border-left: 2px dashed var(--primary-400);
    display: flex;
    flex-direction: column;
    color: var(--liver-600);
    padding: 8px 10px 8px 8px;
    > * {
        width: 318px;
        max-width: 86vw;
    }
    &:hover {
        border-left: 2px dashed var(--primary-500);
    }
`;

const Head = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    // title
    > h2 {
        margin: 0;
        font-size: 14px;
        width: 218px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    // Sender/Receiver
    > span {
        font-size: 10px;
        width: 90px;
        text-align: right;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

const Body = styled.div`
    width: 100%;
    height: 30px;
    font-size: 12px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    text-overflow: ellipsis;
    margin-bottom: 12px;
    color: var(--liver-500);
`;

const TailTop = styled.div`
    font-size: 10px;
    font-weight: bold;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
    color: var(--liver-500);
`;

const TailBottom = styled.div`
    font-size: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--liver-500);
    > span:first-of-type {
        color: var(--liver-300);
    }
`;

const ButtonWrapper = styled.div`
    position: relative;
    top: -120px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 999;
    width: 100%;
    height: 120px;
    border-radius: 6px;
`;

export default DummyCoupon;
