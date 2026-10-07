import { useState } from "react";
import { Heart, X, Pencil, Trash2, BookOpen } from "lucide-react";

import { useWishlist } from "../context/WishListContext";
import api from "../services/api";

export default function BookCard({ book, setBooks, isAdmin = false }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [showReserveDialog, setShowReserveDialog] = useState(false);

  const [showEditDialog, setShowEditDialog] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [reserving, setReserving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [reservationError, setReservationError] = useState("");

  const [reservationSuccess, setReservationSuccess] = useState("");

  const [editError, setEditError] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });

  const [editForm, setEditForm] = useState({
    title: book?.title || "",
    author: book?.author || "",
    category: book?.category || "",
    description: book?.description || "",
    cover_image: book?.cover_image || "",
    total_count: book?.total_count || 1,
  });

  if (!book) {
    return null;
  }

  const inWishlist = isInWishlist(book.id);

  const availableCount = Number(book.available_count ?? 0);

  const totalCount = Number(book.total_count ?? book.quantity ?? 0);

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (inWishlist) {
      await removeFromWishlist(book.id);
    } else {
      await addToWishlist(book.id);
    }
  };

  // --------------------------------------------------
  // RESERVATION
  // --------------------------------------------------

  const handleReserveClick = () => {
    setReservationError("");
    setReservationSuccess("");
    setShowReserveDialog(true);
  };

  const handleCloseDialog = () => {
    if (reserving) {
      return;
    }

    setShowReserveDialog(false);
    setReservationError("");
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleReserve = async (e) => {
    e.preventDefault();

    setReservationError("");
    setReservationSuccess("");
    setReserving(true);

    try {
      const response = await api.post(`/reservations/${book.id}`, {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
      });

      setReservationSuccess(
        response.data?.message || "Book reserved successfully.",
      );

      setBooks((currentBooks) =>
        currentBooks.map((currentBook) =>
          currentBook.id === book.id
            ? {
                ...currentBook,
                available_count: Math.max(
                  0,
                  Number(currentBook.available_count ?? 0) - 1,
                ),
              }
            : currentBook,
        ),
      );

      setTimeout(() => {
        setShowReserveDialog(false);

        setForm({
          name: "",
          email: "",
          mobile: "",
          address: "",
        });

        setReservationSuccess("");
      }, 1500);
    } catch (error) {
      console.error("Error reserving book:", error);

      setReservationError(
        error.response?.data?.message || "Failed to reserve book.",
      );
    } finally {
      setReserving(false);
    }
  };

  // --------------------------------------------------
  // EDIT
  // --------------------------------------------------

  const handleEditClick = (e) => {
    e.stopPropagation();

    setEditError("");

    setEditForm({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      description: book.description || "",
      cover_image: book.cover_image || "",
      total_count: book.total_count || book.quantity || 1,
    });

    setShowEditDialog(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();

    setEditError("");
    setEditing(true);

    try {
      const response = await api.put(`/books/${book.id}`, {
        title: editForm.title.trim(),
        author: editForm.author.trim(),
        category: editForm.category.trim() || null,
        description: editForm.description.trim() || null,
        cover_image: editForm.cover_image.trim() || null,
        total_count: Number(editForm.total_count),
      });

      const updatedBook = response.data?.data;

      if (updatedBook) {
        setBooks((currentBooks) =>
          currentBooks.map((currentBook) =>
            currentBook.id === book.id ? updatedBook : currentBook,
          ),
        );
      }

      setShowEditDialog(false);
    } catch (error) {
      console.error("Error updating book:", error);

      setEditError(error.response?.data?.message || "Failed to update book.");
    } finally {
      setEditing(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDeleteClick = (e) => {
    e.stopPropagation();

    setDeleteError("");
    setShowDeleteDialog(true);
  };

  const handleDeleteBook = async () => {
    setDeleteError("");
    setDeleting(true);

    try {
      await api.delete(`/books/${book.id}`);

      setBooks((currentBooks) =>
        currentBooks.filter((currentBook) => currentBook.id !== book.id),
      );

      setShowDeleteDialog(false);
    } catch (error) {
      console.error(
        "Error deleting book:",
        error.response?.data?.message || error.message,
      );

      setDeleteError(error.response?.data?.message || "Failed to delete book.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* =========================================
                BOOK CARD
            ========================================== */}

      <div className="book-card">
        {/* IMAGE / PLACEHOLDER */}

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

        {/* ACTIONS */}

        <div className="book-actions">
          {/* ADMIN ACTIONS */}

          {isAdmin && (
            <div className="admin-book-actions">
              <button
                type="button"
                className="edit-book-button"
                onClick={handleEditClick}
                aria-label="Edit book"
              >
                <Pencil size={18} />
              </button>

              <button
                type="button"
                className="delete-book-button"
                onClick={handleDeleteClick}
                aria-label="Delete book"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          {/* USER ACTIONS */}

          {!isAdmin && (
            <>
              <button
                type="button"
                className="wishlist-button"
                onClick={handleWishlist}
                aria-label={
                  inWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  size={22}
                  fill={inWishlist ? "red" : "transparent"}
                  color={inWishlist ? "red" : "currentColor"}
                />
              </button>

              <button
                type="button"
                className="reserve-button"
                onClick={handleReserveClick}
                disabled={availableCount <= 0}
              >
                {availableCount > 0 ? "Reserve" : "Unavailable"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================================
                RESERVATION DIALOG
            ========================================== */}

      {showReserveDialog && (
        <div className="reservation-overlay" onClick={handleCloseDialog}>
          <div
            className="reservation-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reservation-header">
              <div>
                <h2>Reserve Book</h2>

                <p>{book.title}</p>
              </div>

              <button
                type="button"
                className="close-dialog-button"
                onClick={handleCloseDialog}
                disabled={reserving}
              >
                <X size={22} />
              </button>
            </div>

            <div className="reservation-info">
              <p>
                <strong>Available:</strong> {availableCount}
              </p>

              <p>
                You must collect this book from the library on the reservation
                date before the library closes.
              </p>
            </div>

            <form onSubmit={handleReserve} className="reservation-form">
              <label>Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />

              <label>Email</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

              <label>Mobile Number</label>

              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                required
              />

              <label>Address</label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="4"
                required
              />

              {reservationError && (
                <div className="error-message">{reservationError}</div>
              )}

              {reservationSuccess && (
                <div className="success-message">{reservationSuccess}</div>
              )}

              <div className="reservation-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseDialog}
                  disabled={reserving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={reserving || availableCount <= 0}
                >
                  {reserving ? "Reserving..." : "Confirm Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
                EDIT DIALOG
            ========================================== */}

      {showEditDialog && (
        <div
          className="reservation-overlay"
          onClick={() => {
            if (!editing) {
              setShowEditDialog(false);
            }
          }}
        >
          <div
            className="reservation-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reservation-header">
              <div>
                <h2>Edit Book</h2>

                <p>Update book details</p>
              </div>

              <button
                type="button"
                className="close-dialog-button"
                onClick={() => setShowEditDialog(false)}
                disabled={editing}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateBook} className="reservation-form">
              <label>Title</label>

              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />

              <label>Author</label>

              <input
                type="text"
                name="author"
                value={editForm.author}
                onChange={handleEditChange}
                required
              />

              <label>Cover Image URL</label>

              <input
                type="url"
                name="cover_image"
                value={editForm.cover_image}
                onChange={handleEditChange}
                placeholder="Enter cover image URL"
              />

              <label>Category</label>

              <input
                type="text"
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                placeholder="Enter category"
              />

              <label>Description</label>

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Enter description"
                rows="4"
              />

              <label>Total Copies</label>

              <input
                type="number"
                name="total_count"
                value={editForm.total_count}
                onChange={handleEditChange}
                min="1"
                required
              />

              {editError && <div className="error-message">{editError}</div>}

              <div className="reservation-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditDialog(false)}
                  disabled={editing}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={editing}
                >
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
                DELETE CONFIRMATION
            ========================================== */}

      {showDeleteDialog && (
        <div
          className="reservation-overlay"
          onClick={() => {
            if (!deleting) {
              setShowDeleteDialog(false);
            }
          }}
        >
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">
              <Trash2 size={28} />
            </div>

            <h2>Delete Book?</h2>

            <p>
              Are you sure you want to delete <strong>{book.title}</strong>?
            </p>

            <p className="delete-warning">This action cannot be undone.</p>

            {deleteError && <div className="error-message">{deleteError}</div>}

            <div className="reservation-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-confirm-button"
                onClick={handleDeleteBook}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
