/**
 * these are all external types that are used/shared in each functions 
 */

export interface LoginButtonRule {
    loginButtonData: {
        title: string;
        image?: string;
    };
}

export type CouponData = {
    id: number;
    title: string;
    description: string;
    created_date: number;
    expiration_date: number;
    origin_user?: string;
    target_user?: string;
    status: CouponStatus;
    finish_date: number;
    // user_data: {hidden: number};
};

export type DropdownMenuData = {
    name: string;
    path: string;
};

// types for coupon mode selecting tab
export type CouponMode = "active" | "disabled";

export type OptionType = {
    mode: CouponMode;
    text: string;
};

// enum to show coupon status
export enum CouponStatus {
    Active, Redeemed, Deleted, Expired
}
// 1 -> Console.log(CouponStatus.Redeemed)
// "Redeemed" -> Console.log(CouponStatus[CouponStatus.Redeemed])

// for redux toolkit initial state for userSlice
export type userType = {
    isLoggedIn: boolean;
    token: string | null;
    refreshToken: string | null;
};

// interface for redux toolkit useSelector
export interface RootState {
    user: userType;
}

// a type for new coupon form
export type FormValues = {
    target_user: string;
    title: string;
    description: string;
    expiration_date: string;
};

// a type for new coupon form with converted date
export type ConvertedFormValues = {
    target_user: string;
    title: string;
    description: string;
    expiration_date: number;
};

// error handling
export enum Errors {
    AuthorizationMissing,
    AuthorizationExpired,
    AuthorizationInvalid,
    RegistrationInvalidEmail,
    SendCouponTargetUnknown,
    SendCouponTargetMissing,
    RedeemCouponIdMissing,
    RedeemCouponUnknownCoupon,
    RedeemCouponWrongOwner,
    RedeemCouponExpired,
    RedeemCouponNotActive,
    RateLimitExceeded,
    Internal
}