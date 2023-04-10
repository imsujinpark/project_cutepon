import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// redux toolkit related
import { Provider } from "react-redux";
import store from "./store";

//redux persist related
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
export const persistor = persistStore(store);

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</React.StrictMode>
);