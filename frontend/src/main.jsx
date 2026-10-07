import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import { WishlistProvider } from "./context/WishListContext";

ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <DashboardProvider>
            <WishlistProvider>
                <App />
            </WishlistProvider>
        </DashboardProvider>
    </AuthProvider>
);