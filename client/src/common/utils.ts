import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Errors } from "./types";
// redux related
import { useDispatch, useSelector } from "react-redux";
import { setNoticeToast, setWarningToast } from "../features/toastSlice";
import { loginFulfilled } from "../features/userSlice";
import store,  { RootState } from "../store";

// a function to ask server for new token every 30 min
export const silentRefresh = async (refreshToken: string): Promise<boolean> => {
	// Token expire time (30 min)
	const TOKEN_EXPIRY_TIME = 30 * 60 * 1000;

	try {
		// asks server for new token
		const { data } = await axios.get("/refresh_token", {
			headers: {
				Authorization: refreshToken,
			},
		});
		// going to call itself again after 30 min with updated refresh token as an auth header
		setTimeout(function () {
			silentRefresh(data.refresh_token);
		}, TOKEN_EXPIRY_TIME);

		// set the new token in redux store + session storage 
		store.dispatch(loginFulfilled({
			token: data.token,
			refreshToken: data.refresh_token,
		}));

		// set the new token as default header for http request
		axios.defaults.headers.common["Authorization"] = data.token;
		return true;

	}
	catch (error: any) {
		if (
			error.response.data.message &&
            error.response.data.error !== undefined
		) {
			console.log(`${error.response.data.message}`);
		}
		else {
			console.log(error);
		}
		// log out redux needed here
		return false;
	}
};

// D-Day calculator
export const dDayCalculator = (epochMs: number): string => {
	const now: Date = new Date(); // current date
	const gap = epochMs - now.getTime(); // difference in milliseconds
	const gapDay = gap / (1000 * 60 * 60 * 24); // milliseconds to days

	// to prevent -0.1 ~ -0.9 day passed from now turning into D-0
	if (gapDay < 0) {
		return `D+${Math.abs(Math.floor(gapDay))}`;
	}
	else {
		return `D-${Math.floor(gapDay)}`;
	}
};

// epoch date -> string "YYYYMMDD"
export const dateToYYYYYMMDD = (epochMs: number): string => {
	const date: Date = new Date(epochMs);
	const dateToString: string = date.toISOString().slice(0, 10).replace(/-/g, "");
	return dateToString;
};

// today's date in YYYY-MM-DD for default value in expiration date
export const nowToYYYYMMDD = (): string => {
	const now: Date = new Date();
	const nowToString: string = now.toISOString().split("T")[0];
	return nowToString;
};

type Method = "get" | "post";
// isRefreshabled: true means silentRefresh() function has not yet been called. This will prevent stackoverflow from recursion.
export const couponRequest = async (method: Method, api: string, paylaod?: any, axiosOptions?: any, isRefreshable = true): Promise<any> => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	// login status
	const { refreshToken } = useSelector(
		(state: RootState) => {
			return state.user;
		}
	);
    
	try {
		let response;
		switch (method) {
			case "get": {
				response = await axios.get(api, axiosOptions);
			} break;
			case "post": {
				response = await axios.post(api, axiosOptions);
			} break;
		}
		return response.data;
	}
	catch (error: any){

		if (
			error.response.data.message &&
            error.response.data.error
		) {
			switch (error.response.data.error) {
				case Errors.AuthorizationMissing: {
					dispatch(setWarningToast("You are not logged in"));
					navigate("/login");
				} break;
        
				case Errors.AuthorizationExpired: {
					if (refreshToken !== null && isRefreshable && await silentRefresh(refreshToken)) {
						return couponRequest(method, api, paylaod, axiosOptions, false);
					}
					else {
						dispatch(setWarningToast("Login information has expired"));
						navigate("/login");
					}
				} break;
        
				case Errors.AuthorizationInvalid: {
					if (refreshToken !== null && isRefreshable && await silentRefresh(refreshToken)) {
						return couponRequest(method, api, paylaod, axiosOptions, false);
					}
					else {
						dispatch(setWarningToast("Login information is invalid"));
						navigate("/login");
					}
				} break;
        
				case Errors.RegistrationInvalidEmail: {
					dispatch(
						setWarningToast(
							"Please confirm your email with the provider"
						)
					);
					return;
				}
        
				case Errors.SendCouponTargetUnknown: {
					dispatch(setWarningToast("Receiver not recognised"));
					return;
				}	
        
				case Errors.SendCouponTargetMissing: {
					dispatch(setWarningToast("No receiver information"));
					return;
				}
        
				case Errors.RedeemCouponIdMissing: {
					dispatch(setWarningToast("Coupon ID is missing"));
					return;
				}
        
				case Errors.RedeemCouponUnknownCoupon: {
					dispatch(setWarningToast("Invalid coupon"));
					return;
				}
        
				case Errors.RedeemCouponWrongOwner: {
					dispatch(
						setWarningToast(
							"This coupon does not belong to you"
						)
					);
					return;
				}
        
				case Errors.RedeemCouponExpired: {
					dispatch(setWarningToast("Coupon is expired"));
					return;
				}
        
				case Errors.RedeemCouponNotActive: {
					dispatch(setWarningToast("Coupon is already disabled"));
					return;
				}
        
				case Errors.RateLimitExceeded: {
					dispatch(
						setWarningToast("Request rate exceeded the limit")
					);
					return;
				}
        
				case Errors.Internal: {
					dispatch(setWarningToast("Unexpected error"));
				}	break;
			}
			return error.response.data;
		}
		else {
			// The error is from axios, so throw it
			throw error;
		}
	}
};