import { combineReducers, configureStore } from "@reduxjs/toolkit";

//for redux persist
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import storageSession from "redux-persist/lib/storage/session";
import userSlice from "./features/userSlice";
import copyCouponSlice from "./features/copyCouponSlice";

const rootReducer = combineReducers({
    user: userSlice.reducer,
    copyCoupon: copyCouponSlice.reducer,
});

const persistConfig = {
    key: "root",
    storage: storageSession, // will be saved in session storage
    whitelist: ["user"], // will save only user reducer in session storage
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