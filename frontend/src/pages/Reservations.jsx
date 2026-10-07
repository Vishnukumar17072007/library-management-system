import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      const response = await api.get("/reservations");

      setReservations(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const cancelReservation = async (id) => {
    const confirmed = window.confirm("Cancel this reservation?");

    if (!confirmed) return;

    try {
      await api.delete(`/reservations/${id}`);

      await loadReservations();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to cancel reservation");
    }
  };

  if (loading) {
    return <main className="page">Loading reservations...</main>;
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1>My Reservations</h1>
        <p>Manage your reserved books.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="empty">You have no reservations.</div>
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

                <span className={`status ${reservation.status}`}>
                  {reservation.status.charAt(0).toUpperCase() +
                    reservation.status.slice(1)}
                </span>
              </div>

              <div className="order-items">
                <div className="order-item">
                  <span>Reserved for</span>

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
              </div>

              <div className="order-actions">
                {reservation.status === "reserved" && (
                  <button
                    className="danger-btn"
                    onClick={() => cancelReservation(reservation.id)}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}