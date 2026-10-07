import { useEffect, useState } from "react";

import api from "../services/api";

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const response = await api.get("/reservations/admin");

      setReservations(response.data.data || []);
    } catch (error) {
      console.error("Error loading reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  if (loading) {
    return <main className="page">Loading reservations...</main>;
  }

  const updateStatus = async (reservationId, status) => {
    try {
      await api.patch(`/reservations/admin/${reservationId}/status`, {
        status,
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status }
            : reservation,
        ),
      );
    } catch (error) {
      console.error("Error updating reservation status:", error);

      // Optional: reload if update failed
      loadReservations();
    }
  };

  return (
    <main className="page">
      <div className="page-header">
        <h1>Reservation Management</h1>

        <p>View all book reservations made by library users.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="empty">No reservations found.</div>
      ) : (
        <div className="orders">
          {reservations.map((reservation) => (
            <div className="order-card" key={reservation.id}>
              <div className="order-header">
                <div>
                  <h3>{reservation.title}</h3>

                  <p>Author: {reservation.author}</p>

                  <p>Reservation date: {reservation.reservation_date}</p>
                </div>

                <div className="reservation-status-actions">
                  {reservation.status === "cancelled" ||
                  reservation.status === "collected" ? (
                    <span className={`status ${reservation.status}`}>
                      {reservation.status.charAt(0).toUpperCase() +
                        reservation.status.slice(1)}
                    </span>
                  ) : (
                    <select
                      value={reservation.status}
                      onChange={(e) =>
                        updateStatus(reservation.id, e.target.value)
                      }
                      className={`reservation-status-select ${reservation.status}`}
                    >
                      <option value="request">Request</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="rejected">Rejected</option>
                      <option value="collected">Collected</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="order-items">
                <div className="order-item">
                  <span>User</span>

                  <span>{reservation.name}</span>
                </div>

                <div className="order-item">
                  <span>Email</span>

                  <span>{reservation.email}</span>
                </div>

                <div className="order-item">
                  <span>Mobile</span>

                  <span>{reservation.mobile}</span>
                </div>

                <div className="order-item">
                  <span>Address</span>

                  <span>{reservation.address}</span>
                </div>

                <div className="order-item">
                  <span>Expires</span>

                  <span>
                    {new Date(reservation.expires_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}