const pool = require("../config/db");

// Library closing time
// Change this when your library's actual closing time is known.
const LIBRARY_CLOSING_HOUR = 18; // 6:00 PM
const LIBRARY_CLOSING_MINUTE = 0;

// POST /api/reservations/:bookId
const createReservation = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const { name, email, mobile, address } = req.body;

    // Validate form data
    if (!name || !email || !mobile || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, email, mobile number and address are required",
      });
    }

    await connection.beginTransaction();

    // Lock the book row so two users cannot
    // reserve the last available copy simultaneously.
    const [books] = await connection.execute(
      `SELECT
            id,
            title,
            total_count,
            available_count
         FROM books
         WHERE id = ?
         FOR UPDATE`,
      [bookId],
    );

    if (books.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = books[0];

    // No available copies
    if (book.available_count <= 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "This book is currently unavailable",
      });
    }

    // Prevent the same user from having
    // multiple active reservations for the same book.
    const [existing] = await connection.execute(
      `SELECT id
         FROM reservations
         WHERE user_id = ?
         AND book_id = ?
         AND status = 'reserved'
         LIMIT 1`,
      [userId, bookId],
    );

    if (existing.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: "You already have an active reservation for this book",
      });
    }

    const now = new Date();

    // Reservation is for today.
    const reservationDate =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    // Reservation expires at library closing time today.
    const expiresAt = new Date(now);

    expiresAt.setHours(LIBRARY_CLOSING_HOUR, LIBRARY_CLOSING_MINUTE, 0, 0);

    // If the library is already closed,
    // don't allow a new reservation.
    if (now >= expiresAt) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "The library is closed. Reservations are no longer available today.",
      });
    }

    // Create reservation
    await connection.execute(
      `INSERT INTO reservations (
        user_id,
        book_id,
        name,
        email,
        mobile,
        address,
        reservation_date,
        expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        bookId,
        name,
        email,
        mobile,
        address,
        reservationDate,
        expiresAt,
      ],
    );

    // Decrease available copies
    await connection.execute(
      `UPDATE books
         SET available_count = available_count - 1
         WHERE id = ?
         AND available_count > 0`,
      [bookId],
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Book reserved successfully",
      data: {
        bookId: Number(bookId),
        bookTitle: book.title,
        reservationDate,
        expiresAt,
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error creating reservation:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reserve book",
    });
  } finally {
    connection.release();
  }
};

// GET /api/reservations
const getReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const [reservations] = await pool.execute(
      `SELECT
            r.id,
            r.book_id,
            r.name,
            r.email,
            r.mobile,
            r.address,
            r.reservation_date,
            r.expires_at,
            r.status,
            r.created_at,
            r.updated_at,

            b.title,
            b.author,
            b.cover_image

         FROM reservations r

         JOIN books b
            ON r.book_id = b.id

         WHERE r.user_id = ?

         ORDER BY r.created_at DESC`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
    });
  }
};

// DELETE /api/reservations/:reservationId
const cancelReservation = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { reservationId } = req.params;

    await connection.beginTransaction();

    // Find the user's active reservation
    const [reservations] = await connection.execute(
      `SELECT
                id,
                book_id,
                status,
                expires_at
             FROM reservations
             WHERE id = ?
             AND user_id = ?
             FOR UPDATE`,
      [reservationId, userId],
    );

    if (reservations.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const reservation = reservations[0];

    if (reservation.status !== "reserved") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This reservation cannot be cancelled",
      });
    }

    // Mark reservation as cancelled
    await connection.execute(
      `UPDATE reservations
         SET
            status = 'cancelled',
            cancelled_at = NOW()
         WHERE id = ?`,
      [reservationId],
    );

    // Return the copy to available inventory
    await connection.execute(
      `UPDATE books
         SET available_count =
             LEAST(
                 available_count + 1,
                 total_count
             )
         WHERE id = ?`,
      [reservation.book_id],
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Error cancelling reservation:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel reservation",
    });
  } finally {
    connection.release();
  }
};

// GET /api/reservations/admin
const getAllReservations = async (req, res) => {
  try {
    const [reservations] = await pool.execute(
      `SELECT
                r.id,
                r.user_id,
                r.book_id,
                r.name,
                r.email,
                r.mobile,
                r.address,
                r.reservation_date,
                r.expires_at,
                r.status,
                r.created_at,
                r.updated_at,

                b.title,
                b.author,
                b.cover_image

             FROM reservations r

             JOIN books b
                ON r.book_id = b.id

             ORDER BY r.created_at DESC`,
    );

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching all reservations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
    });
  }
};

const updateReservationStatus = async (req, res) => {
  const { reservationId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["request", "confirmed", "rejected", "collected"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid reservation status",
    });
  }

  try {
    const [reservations] = await pool.execute(
      `SELECT status
             FROM reservations
             WHERE id = ?`,
      [reservationId],
    );

    if (reservations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const currentStatus = reservations[0].status;

    // Cancelled reservations cannot be changed
    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled reservations cannot be changed",
      });
    }

    // Collected is the final status
    if (currentStatus === "collected") {
      return res.status(400).json({
        success: false,
        message: "Collected reservations cannot be changed",
      });
    }

    await pool.execute(
      `UPDATE reservations
             SET status = ?
             WHERE id = ?`,
      [status, reservationId],
    );

    return res.status(200).json({
      success: true,
      message: "Reservation status updated successfully",
    });
  } catch (error) {
    console.error("Error updating reservation status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reservation status",
    });
  }
};

module.exports = { createReservation, getReservations, cancelReservation, getAllReservations, updateReservationStatus };