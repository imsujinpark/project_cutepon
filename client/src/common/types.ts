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
    status: "active" | "expired" | "redeemed" | "deleted";
    // finish_date: number | null;
};

export type DropdownMenuData = {
    name: string;
    path: string;
};

// types for coupon mode selecting tab
export type CouponOption = "active" | "disabled";

export type OptionType = {
    mode: CouponOption;
    text: string;
};

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