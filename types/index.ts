// ─── Airport ────────────────────────────────────────────────────────────────
export interface Airport {
  icao: string;          // e.g. "NZNE"
  name: string;          // e.g. "Dairy Flat"
  city: string;
  timezone: string;      // IANA tz, e.g. "Pacific/Auckland"
  offsetLabel: string;   // e.g. "GMT+12"
}

// ─── Aircraft ────────────────────────────────────────────────────────────────
export interface Aircraft {
  id: string;            // e.g. "SJ30i"
  name: string;          // e.g. "SyberJet SJ30i"
  capacity: number;
}

// ─── Schedule (one concrete flight occurrence, stored in MongoDB) ────────────
export interface Schedule {
  _id?: string;
  flightNumber: string;     // e.g. "DF101"
  origin: string;           // ICAO
  destination: string;      // ICAO
  departureUTC: string;     // ISO 8601 UTC
  arrivalUTC: string;       // ISO 8601 UTC
  aircraftId: string;
  capacity: number;
  price: number;            // NZD
  bookings: Booking[];      // embedded
}

// ─── Booking (embedded inside Schedule) ─────────────────────────────────────
export interface Booking {
  bookingRef: string;       // unique 8-char ref, e.g. "DF-A1B2C3"
  passengerId: string;      // references Passenger._id
  passengerName: string;    // denormalised for quick display
  passengerEmail: string;
  bookedAt: string;         // ISO 8601
  status: "confirmed" | "cancelled";
}

// ─── Passenger ────────────────────────────────────────────────────────────────
export interface Passenger {
  _id?: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────
export interface FlightSearchResult {
  _id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  aircraftId: string;
  aircraftName: string;
  capacity: number;
  seatsAvailable: number;
  price: number;
}

export interface BookingConfirmation {
  bookingRef: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
  passengerName: string;
  passengerEmail: string;
}
