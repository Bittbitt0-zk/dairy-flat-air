import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { generateBookingRef } from "@/lib/bookingRef";

/**
 * POST /api/bookings
 * Body: { scheduleId, title, firstName, lastName, email }
 */
export async function POST(req: NextRequest) {
  try {
    const { scheduleId, title, firstName, lastName, email } = await req.json();

    if (!scheduleId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const schedulesCol = db.collection("schedules");

    // Fetch schedule and lock-check atomically
    const schedule = await schedulesCol.findOne({
      _id: new ObjectId(scheduleId),
    });

    if (!schedule) {
      return NextResponse.json({ error: "Flight not found" }, { status: 404 });
    }

    const confirmedBookings = (schedule.bookings ?? []).filter(
      (b: any) => b.status === "confirmed"
    );
    if (confirmedBookings.length >= schedule.capacity) {
      return NextResponse.json(
        { error: "Sorry, this flight is full" },
        { status: 409 }
      );
    }

    // Upsert passenger
    const passengersCol = db.collection("passengers");
    await passengersCol.updateOne(
      { email },
      { $set: { title, firstName, lastName, email } },
      { upsert: true }
    );
    const passenger = await passengersCol.findOne({ email });

    const bookingRef = generateBookingRef();
    const newBooking = {
      bookingRef,
      passengerId: passenger!._id.toString(),
      passengerName: `${title} ${firstName} ${lastName}`,
      passengerEmail: email,
      bookedAt: new Date().toISOString(),
      status: "confirmed",
    };

    await schedulesCol.updateOne(
      { _id: new ObjectId(scheduleId) },
      { $push: { bookings: newBooking } as any }
    );

    return NextResponse.json({
      bookingRef,
      flightNumber: schedule.flightNumber,
      origin: schedule.origin,
      destination: schedule.destination,
      departureUTC: schedule.departureUTC,
      arrivalUTC: schedule.arrivalUTC,
      price: schedule.price,
      passengerName: newBooking.passengerName,
      passengerEmail: email,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

/**
 * GET /api/bookings?email=someone@example.com
 * Returns all confirmed bookings for a passenger.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const schedules = await db
      .collection("schedules")
      .find({ "bookings.passengerEmail": email })
      .sort({ departureUTC: 1 })
      .toArray();

    const result = schedules.flatMap((s) =>
      (s.bookings ?? [])
        .filter(
          (b: any) =>
            b.passengerEmail === email && b.status === "confirmed"
        )
        .map((b: any) => ({
          bookingRef: b.bookingRef,
          flightNumber: s.flightNumber,
          origin: s.origin,
          destination: s.destination,
          departureUTC: s.departureUTC,
          arrivalUTC: s.arrivalUTC,
          price: s.price,
          passengerName: b.passengerName,
          status: b.status,
          bookedAt: b.bookedAt,
          scheduleId: s._id.toString(),
        }))
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
