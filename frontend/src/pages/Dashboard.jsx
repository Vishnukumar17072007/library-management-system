import { BookOpen, Users, Library, ClipboardList } from "lucide-react";

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { useDashboard } from "../context/DashboardContext";

export default function Dashboard() {
  const { stats, recentReservations, loading, error, fetchDashboardStats } =
    useDashboard();

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>Loading dashboard statistics...</p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------
  // ERROR
  // ---------------------------------------------

  if (error) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>

          <div className="error-message">{error}</div>

          <button
            type="button"
            className="primary-btn"
            onClick={fetchDashboardStats}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------
  // NO DATA
  // ---------------------------------------------

  if (!stats) {
    return (
      <main className="page">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>No dashboard data available.</p>
        </div>
      </main>
    );
  }

  const { books, users, reservations } = stats;

  // ---------------------------------------------
  // RESERVATION CHART DATA
  // ---------------------------------------------

  const reservationChartData = [
    {
      name: "Requests",
      value: reservations.pending,
      fill: "#f59e0b",
    },
    {
      name: "Confirmed",
      value: reservations.confirmed,
      fill: "#3b82f6",
    },
    {
      name: "Rejected",
      value: reservations.rejected,
      fill: "#ef4444",
    },
    {
      name: "Collected",
      value: reservations.collected,
      fill: "#22c55e",
    },
    {
      name: "Cancelled",
      value: reservations.cancelled,
      fill: "#9ca3af",
    },
  ];

  return (
    <main className="page dashboard-page">
      {/* =========================================
                PAGE HEADER
            ========================================== */}

      <div className="page-header">
        <h1>Admin Dashboard</h1>

        <p>Overview of your library and reservations.</p>
      </div>

      {/* =========================================
                STATISTICS CARDS
            ========================================== */}

      <section className="dashboard-stats">
        {/* TOTAL BOOKS */}

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <BookOpen size={24} />
          </div>

          <div>
            <p>Total Books</p>
            <h2>{books.total}</h2>
          </div>
        </div>

        {/* TOTAL COPIES */}

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <Library size={24} />
          </div>

          <div>
            <p>Total Copies</p>
            <h2>{books.totalCopies}</h2>
          </div>
        </div>

        {/* AVAILABLE COPIES */}

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <BookOpen size={24} />
          </div>

          <div>
            <p>Available Copies</p>
            <h2>{books.availableCopies}</h2>
          </div>
        </div>

        {/* TOTAL USERS */}

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <Users size={24} />
          </div>

          <div>
            <p>Total Users</p>
            <h2>{users.total}</h2>
          </div>
        </div>

        {/* TOTAL RESERVATIONS */}

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            <ClipboardList size={24} />
          </div>

          <div>
            <p>Total Reservations</p>
            <h2>{reservations.total}</h2>
          </div>
        </div>
      </section>

      {/* =========================================
                RESERVATION OVERVIEW
            ========================================== */}

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Reservation Overview</h2>
        </div>

        <div className="reservation-stats">
          <div className="reservation-stat">
            <span>Requests</span>
            <strong>{reservations.pending}</strong>
          </div>

          <div className="reservation-stat">
            <span>Confirmed</span>
            <strong>{reservations.confirmed}</strong>
          </div>

          <div className="reservation-stat">
            <span>Rejected</span>
            <strong>{reservations.rejected}</strong>
          </div>

          <div className="reservation-stat">
            <span>Collected</span>
            <strong>{reservations.collected}</strong>
          </div>

          <div className="reservation-stat">
            <span>Cancelled</span>
            <strong>{reservations.cancelled}</strong>
          </div>
        </div>
      </section>

      {/* =========================================
                RESERVATION STATUS CHART
            ========================================== */}

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Reservation Status</h2>
        </div>

        <div className="dashboard-chart">
          {reservations.total === 0 ? (
            <p>No reservation data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={reservationChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                />

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* =========================================
                RECENT RESERVATIONS
            ========================================== */}

      <section className="dashboard-section">
        <div className="section-header">
          <h2>Recent Reservations</h2>
        </div>

        {recentReservations.length === 0 ? (
          <p>No reservations found.</p>
        ) : (
          <div className="dashboard-reservations">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    {/* BOOK */}

                    <td>
                      <div className="dashboard-book">
                        {reservation.cover_image ? (
                          <img
                            src={reservation.cover_image}
                            alt={reservation.book_title}
                          />
                        ) : (
                          <div className="dashboard-book-placeholder">
                            No Image
                          </div>
                        )}

                        <span>{reservation.book_title}</span>
                      </div>
                    </td>

                    {/* USER */}

                    <td>
                      <div className="dashboard-user">
                        <strong>{reservation.name}</strong>

                        <small>{reservation.email}</small>
                      </div>
                    </td>

                    {/* DATE */}

                    <td>
                      {new Date(
                        reservation.reservation_date,
                      ).toLocaleDateString()}
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`reservation-status status-${reservation.status}`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
