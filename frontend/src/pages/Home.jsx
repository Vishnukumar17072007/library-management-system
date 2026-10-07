import { Link } from "react-router-dom";
import { BookOpen, Search, Heart, CalendarCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
export default function Home() {
  const { user, isAdmin } = useAuth();
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <BookOpen size={17} />
            DIGITAL LIBRARY
          </div>

          <h1>
            Discover your next
            <span> great read.</span>
          </h1>

          <p>
            Explore our collection of books, save your favorites and reserve
            books for convenient pickup.
          </p>

          <div className="hero-buttons">
            <Link to="/books" className="primary-btn large">
              Browse Books
            </Link>

            {!user && (
              <Link to="/register" className="secondary-btn large">
                Join the Library
              </Link>
            )}
          </div>
        </div>
      </section>

      {!isAdmin && (<section className="features">
        <Link to="/books" className="feature">
          <Search size={30} />
          <h3>Find Books</h3>
          <p>Search and explore our library collection.</p>
        </Link>

        <Link to="/wishlists" className="feature">
          <Heart size={30} />
          <h3>Save Favorites</h3>
          <p>Keep your favorite books in your wishlist.</p>
        </Link>

        <Link to="/reservations" className="feature">
          <CalendarCheck size={30} />
          <h3>Reserve & Pickup</h3>
          <p>Reserve available books for library pickup.</p>
        </Link>
      </section>)}
    </main>
  );
}