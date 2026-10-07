import { useState } from "react";

import api from "../services/api";

export default function AdminBooks() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    cover_image: "",
    publication_year: "",
    quantity: 1,
  });

  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add book
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setAdding(true);

    try {
      const response = await api.post("/books", {
        title: form.title.trim(),
        author: form.author.trim(),
        isbn: form.isbn.trim() || null,
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        cover_image: form.cover_image.trim(),
        publication_year: form.publication_year
          ? Number(form.publication_year)
          : null,
        quantity: Number(form.quantity),
      });

      setForm({
        title: "",
        author: "",
        isbn: "",
        category: "",
        description: "",
        cover_image: "",
        publication_year: "",
        quantity: 1,
      });

      setSuccess(response.data?.message || "Book added successfully.");
    } catch (error) {
      console.error("Error adding book:", error);

      setError(error.response?.data?.message || "Failed to add book.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <main className="page">
      {/* =========================
                ADD BOOK
            ========================== */}

      <div className="page-header">
        <h1>Admin Book Management</h1>

        <p>Add, edit and delete books from the library.</p>
      </div>

      <div className="admin-add-book">
        <h2>Add New Book</h2>

        <form className="admin-book-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Book Title</label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="form-group">
              <label>Author</label>

              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Enter author name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter book description"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Cover Image URL</label>

              <input
                type="url"
                name="cover_image"
                value={form.cover_image}
                onChange={handleChange}
                placeholder="Enter cover image URL"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ISBN</label>

              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Enter ISBN"
              />
            </div>

            <div className="form-group">
              <label>Category</label>

              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Publication Year</label>

              <input
                type="number"
                name="publication_year"
                value={form.publication_year}
                onChange={handleChange}
                placeholder="e.g. 2024"
                min="1000"
                max="2100"
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="primary-btn" disabled={adding}>
            {adding ? "Adding Book..." : "Add Book"}
          </button>
        </form>
      </div>
    </main>
  );
}