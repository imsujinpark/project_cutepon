export interface LoginButtonRule {
    loginButtonData: {
        title: string;
        image?: string;
    };
}

export type CouponData = {
    id: number;
    origin?: string;
    target?: string;
    title: string;
    description: string;
    receivedDate: number;
    expirationDate: number;
    status: "active" | "expired" | "redeemed" | "deleted";
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