const pool = require("../config/db");

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        // Book statistics
        const [bookStats] = await pool.execute(`
            SELECT
                COUNT(*) AS total_books,
                COALESCE(SUM(total_count), 0) AS total_copies,
                COALESCE(SUM(available_count), 0) AS available_copies
            FROM books
            WHERE is_active = TRUE
        `);

        // User statistics
        const [userStats] = await pool.execute(`
            SELECT COUNT(*) AS total_users
            FROM users
        `);

        // Reservation statistics
        const [reservationStats] = await pool.execute(`
            SELECT
                COUNT(*) AS total_reservations,

                SUM(CASE
                    WHEN status = 'request'
                    THEN 1 ELSE 0
                END) AS pending_requests,

                SUM(CASE
                    WHEN status = 'confirmed'
                    THEN 1 ELSE 0
                END) AS confirmed_reservations,

                SUM(CASE
                    WHEN status = 'rejected'
                    THEN 1 ELSE 0
                END) AS rejected_reservations,

                SUM(CASE
                    WHEN status = 'collected'
                    THEN 1 ELSE 0
                END) AS collected_reservations,

                SUM(CASE
                    WHEN status = 'cancelled'
                    THEN 1 ELSE 0
                END) AS cancelled_reservations

            FROM reservations
        `);

        res.status(200).json({
            success: true,
            data: {
                books: {
                    total: Number(bookStats[0].total_books),
                    totalCopies: Number(bookStats[0].total_copies),
                    availableCopies: Number(bookStats[0].available_copies),
                },

                users: {
                    total: Number(userStats[0].total_users),
                },

                reservations: {
                    total: Number(reservationStats[0].total_reservations),
                    pending: Number(reservationStats[0].pending_requests),
                    confirmed: Number(
                        reservationStats[0].confirmed_reservations
                    ),
                    rejected: Number(
                        reservationStats[0].rejected_reservations
                    ),
                    collected: Number(
                        reservationStats[0].collected_reservations
                    ),
                    cancelled: Number(
                        reservationStats[0].cancelled_reservations
                    ),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching dashboard statistics:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
        });
    }
};

// GET /api/dashboard/recent-reservations
const getRecentReservations = async (req, res) => {
    try {
        const [reservations] = await pool.execute(`
            SELECT
                r.id,
                r.status,
                r.reservation_date,
                r.expires_at,
                r.name,
                r.email,
                b.title AS book_title,
                b.cover_image
            FROM reservations r
            INNER JOIN books b
                ON r.book_id = b.id
            ORDER BY r.id DESC
            LIMIT 10
        `);

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });
    } catch (error) {
        console.error(
            "Error fetching recent reservations:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch recent reservations",
        });
    }
};

module.exports = {
    getDashboardStats,
    getRecentReservations
};