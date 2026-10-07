const express = require("express");

const {
  getDashboardStats,
  getRecentReservations,
} = require("../controllers/dashboardController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get("/stats", protect, adminOnly, getDashboardStats);
router.get("/recent-reservations", protect, adminOnly, getRecentReservations);

module.exports = router;