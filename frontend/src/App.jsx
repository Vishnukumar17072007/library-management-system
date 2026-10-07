import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import GuestRoute from "./components/GuestRoute";

import Home from "./pages/Home";
import Books from "./pages/Books";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import Reservations from "./pages/Reservations";
import AdminBooks from "./pages/AdminBooks";
import AdminReservations from "./pages/AdminReservations";
import Dashboard from "./pages/Dashboard";

import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Home />;
}

function NotFound() {
  return (
    <main className="page">
      <h1>404</h1>
      <p>Page not found.</p>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/books" element={<Books />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/wishlists" element={<Wishlist />} />
          <Route path="/reservations" element={<Reservations />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/books" element={<AdminBooks />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;