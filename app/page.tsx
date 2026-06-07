"use client";
import Link from "next/link";
import { AIRPORTS } from "@/lib/flightData";

const ROUTES = [
  {
    from: "NZNE",
    to: "YSSY",
    label: "Dairy Flat → Sydney",
    freq: "Weekly · Fridays",
    price: "from NZD 1,850",
    icon: "🛫",
  },
  {
    from: "NZNE",
    to: "NZRO",
    label: "Dairy Flat → Rotorua",
    freq: "Daily shuttle · Mon–Fri",
    price: "from NZD 220",
    icon: "🌋",
  },
  {
    from: "NZNE",
    to: "NZGB",
    label: "Dairy Flat → Great Barrier Island",
    freq: "3× weekly",
    price: "from NZD 195",
    icon: "🏝️",
  },
  {
    from: "NZNE",
    to: "NZCI",
    label: "Dairy Flat → Chatham Islands",
    freq: "2× weekly",
    price: "from NZD 480",
    icon: "🌊",
  },
  {
    from: "NZNE",
    to: "NZTL",
    label: "Dairy Flat → Lake Tekapo",
    freq: "Weekly · Mondays",
    price: "from NZD 360",
    icon: "⛰️",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <p className="hero-eyebrow">Private Jet Experience · New Zealand &amp; Beyond</p>
        <h1>
          Fly the way it was{" "}
          <em>meant to be</em>
        </h1>
        <p>
          Luxury point-to-point service from Dairy Flat Airport — no crowds,
          no queues, just you and the sky.
        </p>
        <Link href="/search" className="btn btn-gold" style={{ fontSize: "1.05rem", padding: "1rem 2.5rem" }}>
          Search Flights →
        </Link>
      </section>

      {/* Route cards */}
      <section className="page-container">
        <h2 className="page-title">Our Routes</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {ROUTES.map((r) => (
            <Link
              key={r.label}
              href={`/search?orig=${r.from}&dest=${r.to}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card"
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  border: "2px solid var(--cream-dark)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "var(--shadow-lg)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--gold)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "var(--shadow)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "var(--cream-dark)";
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
                  {r.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    marginBottom: "0.4rem",
                    color: "var(--navy)",
                  }}
                >
                  {r.label}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                  {r.freq}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.1rem",
                    color: "var(--gold)",
                    fontWeight: 700,
                  }}
                >
                  {r.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Fleet info */}
        <div style={{ marginTop: "4rem" }}>
          <h2 className="page-title">The Fleet</h2>
          <div className="card" style={{ border: "2px solid var(--cream-dark)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--cream-dark)" }}>
                  {["Aircraft", "Capacity", "Routes"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "0.75rem 1rem",
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text-muted)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "SyberJet SJ30i", cap: 6, routes: "Sydney prestige service" },
                  { name: "Cirrus SF50 (×2)", cap: 4, routes: "Rotorua shuttle & Great Barrier Island" },
                  { name: "HondaJet Elite (×2)", cap: 5, routes: "Chatham Islands & Lake Tekapo" },
                ].map((row) => (
                  <tr
                    key={row.name}
                    style={{ borderBottom: "1px solid var(--cream-dark)" }}
                  >
                    <td style={{ padding: "0.9rem 1rem", fontWeight: 600 }}>
                      {row.name}
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "var(--text-muted)" }}>
                      {row.cap} passengers
                    </td>
                    <td style={{ padding: "0.9rem 1rem", color: "var(--text-muted)" }}>
                      {row.routes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
