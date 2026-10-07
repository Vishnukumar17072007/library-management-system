const express = require("express");

const { getAllBooks, addBook, updateBook, deleteBook } = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Anyone can view books
router.get("/", getAllBooks);
// Only admin can add books
router.post("/", protect, adminOnly, addBook);
// Only admin can update books
router.put("/:id", protect, adminOnly, updateBook);
// Only admin can delete books
router.delete("/:id", protect, adminOnly, deleteBook);

module.exports = router;