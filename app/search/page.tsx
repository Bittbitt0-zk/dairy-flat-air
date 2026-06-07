"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { AIRPORTS, AIRCRAFT } from "@/lib/flightData";
import type { FlightSearchResult, BookingConfirmation } from "@/types";

const AIRPORT_OPTIONS = Object.values(AIRPORTS);

// ── helpers ────────────────────────────────────────────────────────────────
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

function duration(dep: string, arr: string) {
  const d = DateTime.fromISO(dep);
  const a = DateTime.fromISO(arr);
  const diff = a.diff(d, ["hours", "minutes"]);
  return `${diff.hours}h ${diff.minutes}m`;
}

function seatsBadgeClass(available: number, capacity: number) {
  if (available === 0) return "seats-badge full";
  if (available / capacity <= 0.5) return "seats-badge limited";
  return "seats-badge available";
}

// ── Booking modal ─────────────────────────────────────────────────────────
function BookingModal({
  flight,
  onClose,
  onSuccess,
}: {
  flight: FlightSearchResult;
  onClose: () => void;
  onSuccess: (conf: BookingConfirmation) => void;
}) {
  const [form, setForm] = useState({
    title: "Mr",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId: flight._id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      onSuccess(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13,27,42,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: "480px", position: "relative" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.5rem",
            marginBottom: "0.25rem",
          }}
        >
          Book Flight {flight.flightNumber}
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          {AIRPORTS[flight.origin].city} → {AIRPORTS[flight.destination].city} ·{" "}
          {formatLocalDate(flight.departureUTC, flight.origin)} · NZD{" "}
          {flight.price.toLocaleString()}
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label>Title</label>
            <select
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            >
              {["Mr", "Mrs", "Ms", "Miss", "Dr", "Prof"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              placeholder="Jane"
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>Last Name</label>
          <input
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Smith"
          />
        </div>

        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane.smith@example.com"
          />
        </div>

        <button
          className="btn btn-gold"
          style={{ width: "100%", marginTop: "1.5rem", padding: "1rem" }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing…" : `Confirm Booking · NZD ${flight.price.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

// ── Invoice / confirmation ─────────────────────────────────────────────────
function InvoicePage({
  conf,
  onReset,
}: {
  conf: BookingConfirmation;
  onReset: () => void;
}) {
  return (
    <div className="page-container">
      <div className="alert alert-success" style={{ marginBottom: "2rem" }}>
        ✓ Booking confirmed! Your reference is{" "}
        <strong>{conf.bookingRef}</strong>
      </div>

      <div className="invoice">
        <div className="invoice-header">
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.6,
                marginBottom: "0.4rem",
              }}
            >
              Booking Reference
            </div>
            <div className="invoice-ref">{conf.bookingRef}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                color: "var(--gold)",
              }}
            >
              ✈ Dairy Flat Air
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.25rem" }}>
              Boarding Pass / Receipt
            </div>
          </div>
        </div>

        <div className="invoice-body">
          <div className="invoice-row">
            <span className="invoice-label">Passenger</span>
            <span className="invoice-value">{conf.passengerName}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Email</span>
            <span className="invoice-value">{conf.passengerEmail}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Flight</span>
            <span className="invoice-value">{conf.flightNumber}</span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Route</span>
            <span className="invoice-value">
              {AIRPORTS[conf.origin]?.city} ({conf.origin}) →{" "}
              {AIRPORTS[conf.destination]?.city} ({conf.destination})
            </span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Departure</span>
            <span className="invoice-value">
              {formatLocalDate(conf.departureUTC, conf.origin)} at{" "}
              {formatLocalTime(conf.departureUTC, conf.origin)}{" "}
              {AIRPORTS[conf.origin]?.offsetLabel}
            </span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Arrival</span>
            <span className="invoice-value">
              {formatLocalDate(conf.arrivalUTC, conf.destination)} at{" "}
              {formatLocalTime(conf.arrivalUTC, conf.destination)}{" "}
              {AIRPORTS[conf.destination]?.offsetLabel}
            </span>
          </div>
          <div className="invoice-row">
            <span className="invoice-label">Duration</span>
            <span className="invoice-value">
              {duration(conf.departureUTC, conf.arrivalUTC)}
            </span>
          </div>
          <hr className="divider" />
          <div className="invoice-row">
            <span className="invoice-label" style={{ fontSize: "1rem" }}>
              Total Paid
            </span>
            <span className="invoice-total">
              NZD {conf.price.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        <button className="btn btn-primary" onClick={onReset}>
          ← Search Again
        </button>
        <a className="btn btn-outline" href="/my-flights">
          View My Bookings
        </a>
      </div>
    </div>
  );
}

// ── Main search page ───────────────────────────────────────────────────────
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const today = DateTime.now().toFormat("yyyy-MM-dd");
  const twoWeeksLater = DateTime.now().plus({ weeks: 2 }).toFormat("yyyy-MM-dd");

  const [orig, setOrig] = useState(searchParams.get("orig") ?? "NZNE");
  const [dest, setDest] = useState(searchParams.get("dest") ?? "YSSY");
  const [date1, setDate1] = useState(today);
  const [date2, setDate2] = useState(twoWeeksLater);

  const [results, setResults] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [bookingFlight, setBookingFlight] = useState<FlightSearchResult | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  const search = async () => {
    if (orig === dest) { setError("Origin and destination must be different."); return; }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const res = await fetch(
        `/api/schedules?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if query params provided
  useEffect(() => {
    if (searchParams.get("orig") && searchParams.get("dest")) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (confirmation) {
    return (
      <InvoicePage
        conf={confirmation}
        onReset={() => {
          setConfirmation(null);
          setResults([]);
          setSearched(false);
        }}
      />
    );
  }

  return (
    <>
      {/* Search bar */}
      <section
        style={{
          background: "var(--navy)",
          padding: "2.5rem 1.5rem",
        }}
      >
        <div className="search-form">
          <div className="form-group">
            <label>From</label>
            <select value={orig} onChange={(e) => setOrig(e.target.value)}>
              {AIRPORT_OPTIONS.map((a) => (
                <option key={a.icao} value={a.icao}>
                  {a.icao} – {a.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>To</label>
            <select value={dest} onChange={(e) => setDest(e.target.value)}>
              {AIRPORT_OPTIONS.map((a) => (
                <option key={a.icao} value={a.icao}>
                  {a.icao} – {a.city}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              value={date1}
              min={today}
              onChange={(e) => setDate1(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              value={date2}
              min={date1}
              onChange={(e) => setDate2(e.target.value)}
            />
          </div>

          <button
            className="btn btn-gold"
            onClick={search}
            disabled={loading}
            style={{ padding: "0.75rem 2rem", whiteSpace: "nowrap" }}
          >
            {loading ? "Searching…" : "Search ✈"}
          </button>
        </div>
      </section>

      {/* Results */}
      <div className="page-container">
        {error && <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>{error}</div>}

        {loading && <div className="spinner" />}

        {!loading && searched && results.length === 0 && !error && (
          <div className="alert alert-info">
            No flights found for this route and date range. Try widening your dates
            or check our{" "}
            <a href="/" style={{ color: "inherit", fontWeight: 600 }}>
              route schedule
            </a>
            .
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                marginBottom: "1.25rem",
                color: "var(--navy)",
              }}
            >
              {results.length} flight{results.length !== 1 ? "s" : ""} found ·{" "}
              {AIRPORTS[orig]?.city} → {AIRPORTS[dest]?.city}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {results.map((f) => (
                <div
                  key={f._id}
                  className={`flight-card ${f.seatsAvailable === 0 ? "full" : ""}`}
                >
                  {/* Origin */}
                  <div>
                    <div className="airport-code">{f.origin}</div>
                    <div className="flight-time">
                      {formatLocalTime(f.departureUTC, f.origin)}
                    </div>
                    <div className="flight-date">
                      {formatLocalDate(f.departureUTC, f.origin)}
                    </div>
                    <div
                      style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}
                    >
                      {AIRPORTS[f.origin]?.offsetLabel}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flight-arrow">
                    <div className="arrow-line" />
                    <div className="flight-duration">{duration(f.departureUTC, f.arrivalUTC)}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {f.flightNumber}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {AIRCRAFT[f.aircraftId]?.name}
                    </div>
                  </div>

                  {/* Destination */}
                  <div>
                    <div className="airport-code">{f.destination}</div>
                    <div className="flight-time">
                      {formatLocalTime(f.arrivalUTC, f.destination)}
                    </div>
                    <div className="flight-date">
                      {formatLocalDate(f.arrivalUTC, f.destination)}
                    </div>
                    <div
                      style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}
                    >
                      {AIRPORTS[f.destination]?.offsetLabel}
                    </div>
                  </div>

                  {/* Book */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.75rem",
                    }}
                  >
                    <div className="flight-price">
                      NZD {f.price.toLocaleString()}
                    </div>
                    <div
                      className={seatsBadgeClass(f.seatsAvailable, f.capacity)}
                    >
                      {f.seatsAvailable === 0
                        ? "FULL"
                        : `${f.seatsAvailable} seat${f.seatsAvailable !== 1 ? "s" : ""} left`}
                    </div>
                    <button
                      className="btn btn-primary"
                      disabled={f.seatsAvailable === 0}
                      onClick={() => setBookingFlight(f)}
                      style={{ fontSize: "0.85rem", padding: "0.6rem 1.25rem" }}
                    >
                      {f.seatsAvailable === 0 ? "Full" : "Book Now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking modal */}
      {bookingFlight && (
        <BookingModal
          flight={bookingFlight}
          onClose={() => setBookingFlight(null)}
          onSuccess={(conf) => {
            setBookingFlight(null);
            setConfirmation(conf);
          }}
        />
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="spinner" style={{ marginTop: "4rem" }} />}>
      <SearchContent />
    </Suspense>
  );
}
