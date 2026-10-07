const express = require("express");

const { createReservation, getReservations, cancelReservation, getAllReservations, updateReservationStatus } = require("../controllers/reservationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a reservation for a book
router.post("/:bookId", protect, createReservation);
// Get the logged-in user's reservations
router.get("/", protect, getReservations);
// Cancel a reservation
router.delete("/:reservationId", protect, cancelReservation);
// Admin: Get all users' reservations
router.get("/admin", protect, adminOnly, getAllReservations);
router.patch( "/admin/:reservationId/status", protect, adminOnly, updateReservationStatus );

module.exports = router;