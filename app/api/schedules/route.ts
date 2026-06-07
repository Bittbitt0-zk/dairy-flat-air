import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { AIRCRAFT } from "@/lib/flightData";

/**
 * GET /api/schedules?orig=NZNE&dest=YSSY&date1=2026-06-10&date2=2026-06-30
 *
 * date1 / date2 are LOCAL calendar dates (YYYY-MM-DD).
 * We search departureUTC between start-of-date1 UTC and end-of-date2 UTC.
 * Because NZ is UTC+12, a flight departing at 10:00 NZST on 13 Jun
 * is stored as 2026-06-12T22:00:00.000Z — still within the range.
 * We expand the window by ±1 day to be safe, then post-filter nothing
 * (the display will show local dates so user sees the right day).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orig  = searchParams.get("orig");
  const dest  = searchParams.get("dest");
  const date1 = searchParams.get("date1");
  const date2 = searchParams.get("date2");

  if (!orig || !dest || !date1 || !date2) {
    return NextResponse.json(
      { error: "Missing query parameters: orig, dest, date1, date2" },
      { status: 400 }
    );
  }

  try {
    const db = await getDb();

    // Expand the UTC window by 1 day each side to account for timezone offsets.
    // A NZ departure on "2026-06-13" sits at 2026-06-12T22:00Z in the DB.
    const fromUTC = new Date(date1);
    fromUTC.setDate(fromUTC.getDate() - 1);          // 1 day before
    const toUTC = new Date(date2);
    toUTC.setDate(toUTC.getDate() + 1);              // 1 day after
    toUTC.setHours(23, 59, 59, 999);

    const schedules = await db
      .collection("schedules")
      .find({
        origin:        orig,
        destination:   dest,
        departureUTC:  {
          $gte: fromUTC.toISOString(),
          $lte: toUTC.toISOString(),
        },
      })
      .sort({ departureUTC: 1 })
      .toArray();

    const results = schedules.map((s) => ({
      _id:            s._id.toString(),
      flightNumber:   s.flightNumber,
      origin:         s.origin,
      destination:    s.destination,
      departureUTC:   s.departureUTC,
      arrivalUTC:     s.arrivalUTC,
      aircraftId:     s.aircraftId,
      aircraftName:   AIRCRAFT[s.aircraftId]?.name ?? s.aircraftId,
      capacity:       s.capacity,
      seatsAvailable:
        s.capacity -
        (s.bookings ?? []).filter((b: any) => b.status === "confirmed").length,
      price:          s.price,
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
