import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
// components + external functions
import { CouponData, CouponStatus } from "../common/types";
import { Status } from "../common/constants";
import Coupon from "../components/layout/Coupon";
import OptionTab from "../components/layout/OptionTab";
import Description from "../components/layout/Description";
import { faArrowPointer } from "@fortawesome/free-solid-svg-icons";
import { couponRequest } from "../common/utils";
// redux related
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { setWarningToast } from "../features/toastSlice";

const ReceivedCoupons = () => {
	const [couponData, setCouponData] = useState<CouponData[]>([]);
	const [activeCoupons, setActiveCoupons] = useState<CouponData[]>([]);
	const [disabledCoupons, setDisabledCoupons] = useState<CouponData[]>([]);

	const { status } = useParams(); // status is either "active" or "disabled"
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// login status
	const { isLoggedIn } = useSelector((state: RootState) => {
		return state.user;
	});

	useEffect(() => {
		if (isLoggedIn) {
			getCoupons();
		}
		else {
			dispatch(setWarningToast("You are not logged in"));
			navigate("/login");
		}
	}, []);

	// filters server coupon data by status
	useEffect(() => {
		if (status === Status.ACTIVE) {
			const filteredArr = couponData.filter(data => data.status === CouponStatus.Active);
			setActiveCoupons([...filteredArr]);
		}
		else {
			const filteredArr = couponData.filter(data => data.status !== CouponStatus.Active && data.status !== CouponStatus.Deleted);
			setDisabledCoupons([...filteredArr]);
		}
	}, [status, couponData]);

	const getCoupons = async () => {
		const { data, message, path, error } = await couponRequest("get", "/api/received");

		// Unhandled server error
		if (error) {
			console.log(error);
		}
		// handled server error requires warning toast & navigate action
		else if (message && path) {
			dispatch(setWarningToast(message));
			navigate(path);
		}
		// handled server error requires only warning toast
		else if (message) {
			dispatch(setWarningToast(message));
		}
		// no error
		else {
			setCouponData([...data]);
		}
	};

	return (
		<Container>
			<h1>Received Coupons</h1>
			<OptionTab />
			{status === Status.ACTIVE ? (
				<Description
					text="Click the coupon to redeem, delete, or send a copy"
					icon={faArrowPointer}
				/>
			) : (
				<Description
					text="Click the coupon to hide or send a copy"
					icon={faArrowPointer}
				/>
			)}
			{status === Status.ACTIVE
				? activeCoupons.map((el, idx) => {
					return <Coupon key={idx} data={el} />;
				})
				: disabledCoupons.map((el, idx) => {
					return <Coupon key={idx} data={el} />;
				})}
		</Container>
	);
};

const Container = styled.div`
    width: 100%;
	min-height: calc(100vh - 60px);
	height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0 36px 0;
`;

export default ReceivedCoupons;
