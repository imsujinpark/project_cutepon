import { createSlice } from "@reduxjs/toolkit";
import { PURGE } from "redux-persist"; // for store purge (remove state);
import { userType } from "../common/types";

const initialState: userType = {
    isLoggedIn: false,
    token: null,
    refreshToken: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginFulfilled(state, action) {
            state.isLoggedIn = true;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
        tokenRefreshed(state, action) {
            state.token = action.payload.token;
        },
        logoutFulfilled() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(PURGE, () => initialState);
    }
});

export default userSlice;
export const {
    loginFulfilled,
    tokenRefreshed,
    logoutFulfilled
} = userSlice.actions;