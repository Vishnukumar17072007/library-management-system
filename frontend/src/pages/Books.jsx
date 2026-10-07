import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import api from "../services/api";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";

export default function Books() {
  const { isAdmin } = useAuth();

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await api.get("/books");

        setBooks(response.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  const categories = [
    "all",
    ...new Set(books.map((book) => book.category).filter(Boolean)),
  ];

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      book.title?.toLowerCase().includes(searchText) ||
      book.author?.toLowerCase().includes(searchText);

    const matchesCategory = category === "all" || book.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1>Book Collections</h1>

          <p>Browse books available in our library.</p>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All Categories" : item}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading books...</div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty">No books found.</div>
      ) : (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              setBooks={setBooks}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </main>
  );
}