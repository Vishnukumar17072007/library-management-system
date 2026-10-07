const pool = require("../config/db");

// GET /api/wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const [wishlist] = await pool.execute(
      `SELECT
                w.id AS wishlist_id,
                w.created_at,
                b.*
             FROM wishlist w
             JOIN books b ON w.book_id = b.id
             WHERE w.user_id = ?
             ORDER BY w.created_at DESC`,
      [userId],
    );

    res.status(200).json({
      success: true,
      count: wishlist.length,
      data: wishlist,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
    });
  }
};

// POST /api/wishlist/:bookId
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const [books] = await pool.execute("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const [existing] = await pool.execute(
      `SELECT id
             FROM wishlist
             WHERE user_id = ?
             AND book_id = ?`,
      [userId, bookId],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Book is already in your wishlist",
      });
    }

    await pool.execute(
      `INSERT INTO wishlist
             (user_id, book_id)
             VALUES (?, ?)`,
      [userId, bookId],
    );

    res.status(201).json({
      success: true,
      message: "Book added to wishlist",
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add book to wishlist",
    });
  }
};

// DELETE /api/wishlist/:bookId
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const [result] = await pool.execute(
      `DELETE FROM wishlist
             WHERE user_id = ?
             AND book_id = ?`,
      [userId, bookId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Book is not in your wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book removed from wishlist",
    });
  } catch (error) {
    console.error("Error removing from wishlist:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove book from wishlist",
    });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };