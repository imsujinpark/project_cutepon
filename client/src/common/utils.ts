import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Errors } from "./types";
// redux related
import { loginFulfilled, logoutFulfilled } from "../features/userSlice";
import store,  { RootState } from "../store";
import { persistor } from "../index";

// a function to ask server for new token every 30 min
export const silentRefresh = async (refreshToken: string): Promise<boolean> => {
	// Interval between silentRefresh callbacks (30 min)
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
		// log out if refresh fails
		store.dispatch(logoutFulfilled());
		setTimeout(() => purge(), 1000); 
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

// epoch date -> string "YYYYMMDD-HHMM"
export const dateToYYYYYMMDDHHMM = (epochMs: number): string => {
	const date: Date = new Date(epochMs);
	const dateToString: string = date.toISOString().slice(0, 10).replace(/-/g, "");
	const timeToString: string = date.toISOString().slice(11, 16).replace(/:/g, "");
	// below for time in local, above in utc is use now
	// as it needs to be the same for everyone to be a coupon id
	// const dateToString: string = date.toLocaleString().slice(0, 10).replace(/\//g, "");
	// const timeToString: string = date.toLocaleString().slice(12, 20).replace(/:/g, "");
	return dateToString + "-" + timeToString;
};

// today's date in YYYY-MM-DD for default value in expiration date
export const nowToYYYYMMDD = (): string => {
	const now: Date = new Date();
	const nowToString: string = now.toISOString().split("T")[0];
	return nowToString;
};

// gets login information from session storage (replacing useSelector in non-react functions)
export const getLoginInfoFromSessionStorage = () => {
	// access data saved by redux persist
	const stringSessionStorage = sessionStorage.getItem("persist:root");
	if (stringSessionStorage === null) {
		// initial value of login status from loginSlice
		return {isLoggedin: false, token: null, refreshToken: null};
	}
	else {
		const {user} = JSON.parse(stringSessionStorage);
		const {isLoggedin, token, refreshToken} = JSON.parse(user);
		return {isLoggedin, token, refreshToken};
	}
};

type Method = "get" | "post";
/**
 * @param headers 
 * @param isRefreshable true means silentRefresh() function has not yet been called. This will prevent stackoverflow from recursion.
 * @returns 
 * When successful, {data: response.data}
 * when error is handled and navigate is needed, {message: "this is a message used for toast", path: "/login"}
 * when error is handled but navigate is not needed, {message: "this is a message used for toast"}
 * when errer could not be handled {error: error.response.data}
 */
export const couponRequest = async (method: Method, api: string, paylaod?: any, axiosOptions?: any, isRefreshable = true): Promise<any> => {

	// refresh token from session storage
	const {refreshToken} = getLoginInfoFromSessionStorage();
	
	try {
		let response;
		switch (method) {
			case "get": {
				response = await axios.get(api, axiosOptions);
			} break;
			case "post": {
				response = await axios.post(api, paylaod, axiosOptions);
			} break;
		}
		return {data:  response.data};
	}
	catch (error: any){
	
		if (
			error.response.data.message &&
            error.response.data.error >= 0
		) {
			switch (error.response.data.error) {
				case Errors.AuthorizationMissing: {
					return {message: "You are not logged in", path: "/login"};
				} 

				case Errors.AuthorizationExpired: {
					if (refreshToken !== null && isRefreshable && await silentRefresh(refreshToken)) {
						return couponRequest(method, api, paylaod, axiosOptions, false);
					}
					else {
						return {message: "Login information has expired", path: "/login"};
					}
				} 
        
				case Errors.AuthorizationInvalid: {
					if (refreshToken !== null && isRefreshable && await silentRefresh(refreshToken)) {
						return couponRequest(method, api, paylaod, axiosOptions, false);
					}
					else {
						return {message: "Login information is invalid", path: "/login"};
					}
				}
        
				case Errors.RegistrationInvalidEmail: {
					return {message: "Please confirm your email with the provider"};
				}
        
				case Errors.SendCouponTargetUnknown: {
					return {message: "Receiver not recognised"};
				}	
        
				case Errors.SendCouponTargetMissing: {
					return {message: "No receiver information"};
				}
        
				case Errors.RedeemCouponIdMissing: {
					return {message: "Coupon ID is missing"};
				}
        
				case Errors.RedeemCouponUnknownCoupon: {
					return {message: "Invalid coupon"};
				}
        
				case Errors.RedeemCouponWrongOwner: {
					return {message: "This coupon does not belong to you"};
				}
        
				case Errors.RedeemCouponExpired: {
					return {message: "Coupon is expired"};
				}
        
				case Errors.RedeemCouponNotActive: {
					return {message: "Coupon is already disabled"};
				}
        
				case Errors.RateLimitExceeded: {
					return {message: "Request rate exceeded the limit"};
				}
        
				case Errors.Internal: {
					return {message: "Unexpected error"};
				}
			}
			return {error: error.response.data};
		}
		else {
			// The error is from axios, so throw it
			// throw error;
			return {error: error};
		}
	}
};

// purge function is to remove state from session storage
export const purge = async () => {
	await persistor.purge();
};