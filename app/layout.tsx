import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dairy Flat Air – Private Jet Experience",
  description:
    "Book luxury point-to-point flights from Dairy Flat Airport across New Zealand and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="navbar-brand">
            ✈ Dairy Flat <span>Air</span>
          </Link>
          <ul className="navbar-links">
            <li>
              <Link href="/search">Search Flights</Link>
            </li>
            <li>
              <Link href="/my-flights">My Bookings</Link>
            </li>
          </ul>
        </nav>

        <main>{children}</main>

        <footer className="footer">
          © {new Date().getFullYear()} Dairy Flat Air Ltd · All rights reserved
        </footer>
      </body>
    </html>
  );
}
