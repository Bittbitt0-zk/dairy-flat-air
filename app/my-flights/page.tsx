"use client";

import { useState } from "react";
import { DateTime } from "luxon";
import { AIRPORTS } from "@/lib/flightData";

function formatLocalTime(utc: string, icao: string) {
  const tz = AIRPORTS[icao]?.timezone ?? "UTC";
  return DateTime.fromISO(utc, { zone: "utc" }).setZone(tz).toFormat("HH:mm");
}

function formatLocalDate(utc: string, icao: string) {
  const tz = AIRPORTS[icao]?.timezone ?? "UTC";
  return DateTime.fromISO(utc, { zone: "utc" })
    .setZone(tz)
    .toFormat("EEE d MMM yyyy");
}

interface BookingRecord {
  bookingRef: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
  passengerName: string;
  status: string;
  bookedAt: string;
}

export default function MyFlightsPage() {
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cancellingRef, setCancellingRef] = useState<string | null>(null);
  const [cancelMsg, setCancelMsg] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    setSearched(true);
    setCancelMsg("");
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (ref: string) => {
    setCancellingRef(ref);
    setCancelMsg("");
    try {
      const res = await fetch(`/api/bookings/${ref}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCancelMsg(`Booking ${ref} has been cancelled.`);
      // Refresh the list
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingRef === ref ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCancellingRef(null);
    }
  };

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="page-container">
      <h1 className="page-title">My Bookings</h1>

      {/* Email lookup */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--text-muted)", marginBottom: "1rem", fontSize: "0.95rem" }}>
          Enter the email address you used when booking to view your flights.
        </p>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@example.com"
              onKeyDown={(e) => e.key === "Enter" && fetchBookings()}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchBookings}
            disabled={loading}
          >
            {loading ? "Looking up…" : "Find Bookings"}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}
      {cancelMsg && <div className="alert alert-success" style={{ marginBottom: "1.5rem" }}>{cancelMsg}</div>}

      {loading && <div className="spinner" />}

      {!loading && searched && bookings.length === 0 && !error && (
        <div className="alert alert-info">
          No bookings found for <strong>{email}</strong>.
        </div>
      )}

      {!loading && confirmedBookings.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              marginBottom: "1rem",
              color: "var(--navy)",
            }}
          >
            Upcoming &amp; Confirmed
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {confirmedBookings.map((b) => (
              <div key={b.bookingRef} className="booking-item">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      color: "var(--gold)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {b.bookingRef}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    {b.flightNumber} · {AIRPORTS[b.origin]?.city} → {AIRPORTS[b.destination]?.city}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {formatLocalDate(b.departureUTC, b.origin)} at{" "}
                    {formatLocalTime(b.departureUTC, b.origin)}{" "}
                    {AIRPORTS[b.origin]?.offsetLabel} · Passenger: {b.passengerName}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--navy)",
                    }}
                  >
                    NZD {b.price.toLocaleString()}
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
                    disabled={cancellingRef === b.bookingRef}
                    onClick={() => {
                      setCancelTarget(b.bookingRef);
                      setShowCancelModal(true);
                    }}
                  >
                    {cancellingRef === b.bookingRef ? "Cancelling…" : "Cancel Booking"}
                  </button>
                </div>
              </div>
            ))}

          </div>

        </section>
      )}

      {!loading && cancelledBookings.length > 0 && (
        <section>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              marginBottom: "1rem",
              color: "var(--text-muted)",
            }}
          >
            Cancelled
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {cancelledBookings.map((b) => (
              <div key={b.bookingRef} className="booking-item cancelled">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.8rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {b.bookingRef}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {b.flightNumber} · {AIRPORTS[b.origin]?.city} → {AIRPORTS[b.destination]?.city}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    {formatLocalDate(b.departureUTC, b.origin)}
                  </div>
                </div>
                <span
                  style={{
                    background: "#f5f5f5",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.6rem",
                    borderRadius: "20px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  CANCELLED
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
            {showCancelModal && cancelTarget && (
              <div className="modal-overlay">
                <div className="cancel-modal">
                  <h3>Cancel Booking</h3>

                  <p>
                    Booking Reference
                  </p>

                  <div className="booking-ref-box">
                    {cancelTarget}
                  </div>

                  <p style={{ color: "var(--text-muted)" }}>
                    This action cannot be undone.
                  </p>

                  <div className="modal-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCancelModal(false);
                        setCancelTarget(null);
                      }}
                    >
                      Keep Booking
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        cancelBooking(cancelTarget);
                        setShowCancelModal(false);
                        setCancelTarget(null);
                      }}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}
