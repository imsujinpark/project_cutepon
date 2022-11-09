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

export type CouponOption = "active" | "disabled";

export type OptionType = {
    mode: CouponOption;
    text: string;
};