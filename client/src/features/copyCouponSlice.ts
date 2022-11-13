import { createSlice } from "@reduxjs/toolkit";
import { FormValues } from "../common/types";

// this is a slice to keep form data input as states
// is utilised mostly for copying an existing coupon

const initialState: FormValues = {
    target_user: "@gmail.com",
    title: "",
    description: "",
    expiration_date: "",
};

const copyCouponSlice = createSlice({
    name: "copyCoupon",
    initialState,
    reducers: {
        makeCopy(state, action) {
            state.title = action.payload.title;
            state.target_user = action.payload.target_user;
            state.description = action.payload.description;
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