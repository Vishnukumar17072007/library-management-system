import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

import "./index.css";
import { WishlistProvider } from "./context/WishListContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <WishlistProvider>
      <App />
    </WishlistProvider>
  </AuthProvider>,
);