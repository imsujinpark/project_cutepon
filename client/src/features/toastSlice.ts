import { createSlice } from '@reduxjs/toolkit';

type Type = {
    showToast: boolean;
    message: string;
    mode: "notice" | "warning";
};

const initialState: Type = {
    showToast: false,
    message: "",
    mode: "notice",
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        setWarningToast(state, action) {
            state.showToast = true;
            state.mode = "warning";
            state.message = action.payload;
        },
        setNoticeToast(state, action) {
            state.showToast = true;
            state.mode = "notice";
            state.message = action.payload;
        },
        closeToast(state) {
            state.showToast = false;
        },
    }
});

export default toastSlice;
export const {
    setWarningToast,
    setNoticeToast,
    closeToast,
} = toastSlice.actions;