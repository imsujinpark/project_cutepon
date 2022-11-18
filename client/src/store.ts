import { combineReducers, configureStore } from "@reduxjs/toolkit";

//for redux persist
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import storage from "redux-persist/lib/storage";

import userSlice from "./features/userSlice";
import copyCouponSlice from "./features/copyCouponSlice";
import toastSlice from "./features/toastSlice";

const rootReducer = combineReducers({
	user: userSlice.reducer,
	copyCoupon: copyCouponSlice.reducer,
	toast: toastSlice.reducer,
});

const persistConfig = {
	key: "root",
	storage: storage, // will be saved in local storage
	whitelist: ["user"], // will save only user reducer in local storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
	reducer: persistedReducer,
	devTools: process.env.NODE_ENV !== "production",
	middleware: [thunk],
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;