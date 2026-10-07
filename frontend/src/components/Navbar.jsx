import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Home,
  Heart,
  User,
  LogOut,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const navClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <header className="navbar">
      {/* Logo */}
      <Link to="/" className="logo" onClick={closeMenu}>
        <BookOpen size={28} />
        <span>
          LM<span>S</span>
        </span>
      </Link>

      {/* Desktop / Mobile Navigation */}
      <nav className={menuOpen ? "nav-menu open" : "nav-menu"}>
        {isAdmin ? (
          <NavLink to="/dashboard" className="nav-link">
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
        ) : (
          <NavLink to="/" className="nav-link">
            <Home size={18} />
            Home
          </NavLink>
        )}

        <NavLink to="/books" className={navClass} onClick={closeMenu}>
          Books
        </NavLink>

        {!isAdmin && (
          <>
            <NavLink to="/wishlists" className={navClass} onClick={closeMenu}>
              <Heart size={17} />
              Wishlist
            </NavLink>

            <NavLink
              to="/reservations"
              className={navClass}
              onClick={closeMenu}
            >
              <ClipboardList size={17} />
              Reservations
            </NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin/books" className={navClass} onClick={closeMenu}>
              Admin
            </NavLink>

            <NavLink
              to="/admin/reservations"
              className={navClass}
              onClick={closeMenu}
            >
              <ClipboardList size={17} />
              Reservations
            </NavLink>
          </>
        )}

        {/* Mobile user section */}
        <div className="mobile-nav-user">
          {user ? (
            <>
              <span className="user-name">
                <User size={17} />
                {user.name}
              </span>

              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn" onClick={closeMenu}>
                Login
              </Link>

              <Link to="/register" className="primary-btn" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Desktop user section */}
      <div className="nav-user">
        {user ? (
          <>
            <span className="user-name">
              <User size={17} />
              {user.name}
            </span>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={17} />
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="primary-btn">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={25} /> : <Menu size={25} />}
      </button>
    </header>
  );
}