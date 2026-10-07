const pool = require("../config/db");

// GET /api/books
const getAllBooks = async (req, res) => {
  try {
    const [books] = await pool.query(
      "SELECT * FROM books WHERE is_active = TRUE ORDER BY id DESC",
    );

    res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Error fetching books:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
    });
  }
};

// POST /api/books
const addBook = async (req, res) => {
  try {
    console.log("Received book data:", req.body);

    const {
      title,
      author,
      isbn,
      category,
      description,
      cover_image,
      publication_year,
      quantity,
    } = req.body;

    if (!title || !author || !cover_image) {
      return res.status(400).json({
        success: false,
        message: "Title, author and cover image are required",
      });
    }

    const totalCount = Number(quantity) || 1;

    if (totalCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO books
    (
        title,
        author,
        isbn,
        category,
        description,
        cover_image,
        publication_year,
        quantity,
        total_count,
        available_count
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        author.trim(),
        isbn || null,
        category || null,
        description || null,
        cover_image.trim(),
        publication_year || null,
        totalCount,
        totalCount,
        totalCount,
      ],
    );

    const [newBook] = await pool.execute("SELECT * FROM books WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: newBook[0],
    });
  } catch (error) {
    console.error("Error adding book:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add book",
    });
  }
};

// PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, author, category, description, cover_image, total_count } =
      req.body;

    const [existingBook] = await pool.execute(
      "SELECT * FROM books WHERE id = ?",
      [id],
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = existingBook[0];

    const newTotalCount = Number(total_count);

    if (!Number.isInteger(newTotalCount) || newTotalCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Total book count must be at least 1",
      });
    }

    /*
     * Work out how many copies are currently lent/reserved.
     *
     * Example:
     * total_count = 5
     * available_count = 3
     *
     * 2 copies are currently unavailable.
     *
     * If admin changes total_count to 6:
     * available_count becomes 4.
     */

    const unavailableCount = book.total_count - book.available_count;

    if (newTotalCount < unavailableCount) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot reduce total copies below ${unavailableCount}. ` +
          "Some copies are currently reserved or lent.",
      });
    }

    const newAvailableCount = newTotalCount - unavailableCount;

    await pool.execute(
      `UPDATE books
         SET
            title = ?,
            author = ?,
            category = ?,
            description = ?,
            cover_image = ?,
            total_count = ?,
            available_count = ?
         WHERE id = ?`,
      [
        title?.trim(),
        author?.trim(),
        category || null,
        description || null,
        cover_image || null,
        newTotalCount,
        newAvailableCount,
        id,
      ],
    );

    const [updatedBook] = await pool.execute(
      "SELECT * FROM books WHERE id = ?",
      [id],
    );

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook[0],
    });
  } catch (error) {
    console.error("Error updating book:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update book",
    });
  }
};

// DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check whether the book exists
    const [existingBook] = await pool.execute(
      "SELECT * FROM books WHERE id = ?",
      [id],
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = existingBook[0];

    // Check whether the book is already inactive
    if (!book.is_active) {
      return res.status(400).json({
        success: false,
        message: "Book is already deleted",
      });
    }

    // Soft delete
    await pool.execute("UPDATE books SET is_active = FALSE WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete book",
    });
  }
};

module.exports = { getAllBooks, addBook, updateBook, deleteBook };