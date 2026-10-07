import { useEffect, useState } from "react";
import { Heart, Trash2, BookOpen } from "lucide-react";

import api from "../services/api";

export default function Wishlist() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      const response = await api.get("/wishlist");

      setBooks(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeBook = async (bookId) => {
    try {
      await api.delete(`/wishlist/${bookId}`);

      setBooks((current) =>
        current.filter((book) => Number(book.id) !== Number(bookId)),
      );
    } catch (error) {
      alert(error.response?.data?.message || "Unable to remove book");
    }
  };

  if (loading) {
    return <main className="page">Loading wishlist...</main>;
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>My Wishlist</h1>

        <p>Books you've saved for later.</p>
      </div>

      {books.length === 0 ? (
        <div className="empty">Your wishlist is empty.</div>
      ) : (
        <div className="book-grid">
          {books.map((book) => {
            const availableCount = Number(book.available_count ?? 0);

            const totalCount = Number(book.total_count ?? book.quantity ?? 0);

            return (
              <div className="book-card" key={book.id}>
                {/* BOOK COVER */}

                <div className="book-cover">
                  {book.cover_image ? (
                    <img src={book.cover_image} alt={book.title} />
                  ) : (
                    <div className="book-image-placeholder">
                      <BookOpen size={52} />

                      <span>No Image</span>
                    </div>
                  )}
                </div>

                {/* BOOK INFORMATION */}

                <div className="book-info">
                  <h3>{book.title}</h3>

                  <p className="book-author">{book.author}</p>

                  {book.category && (
                    <span className="book-category">{book.category}</span>
                  )}

                  <div className="book-stock">
                    <p className="available-count">
                      Available: <strong>{availableCount}</strong>
                    </p>

                    {totalCount > 0 && (
                      <p className="total-count">Total: {totalCount}</p>
                    )}
                  </div>
                </div>

                {/* WISHLIST ACTION */}

                <div className="book-actions">
                  <div className="wishlist-book-actions">
                    <Heart size={20} fill="red" color="red" />

                    <span>In Wishlist</span>
                  </div>

                  <button
                    type="button"
                    className="delete-wishlist-button"
                    onClick={() => removeBook(book.id)}
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}