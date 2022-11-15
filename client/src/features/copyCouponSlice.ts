import { createSlice } from "@reduxjs/toolkit";
import { FormValues } from "../common/types";
import { nowToYYYYMMDD } from "../common/utils";

// this is a slice to keep form data input as states
// is utilised mostly for copying an existing coupon

// today's date in YYYY-MM-DD for default value in expiration date
const now: Date = new Date();
const nowToString: string = now.toISOString().split('T')[0];

const initialState: FormValues = {
    target_user: "@gmail.com",
    title: "",
    description: "",
    expiration_date: nowToString,
};

const copyCouponSlice = createSlice({
    name: "copyCoupon",
    initialState,
    reducers: {
        makeCopy(state, action) {
            state.title = action.payload.title;
            state.target_user = action.payload.target_user;
            state.description = action.payload.description;
            state.expiration_date = action.payload.expiration_date;
        },
        // setTitle(state, action) {
        //     state.title = action.payload;
        // },
        // setTargetUser(state, action) {
        //     state.target_user = action.payload;
        // },
        // setDescription(state, action) {
        //     state.description = action.payload;
        // },
        // setExpirationDate(state, action) {
        //     state.expiration_date = action.payload;
        // },
        clearCopyCoupon() {
            return initialState;
        }
    }
});

export default copyCouponSlice;
export const {
    makeCopy,
    // setTitle,
    // setTargetUser,
    // setDescription,
    // setExpirationDate,
    clearCopyCoupon,
} = copyCouponSlice.actions;