import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * DELETE /api/bookings/[ref]
 * Cancels (soft-deletes) a booking by reference code.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;

  try {
    const db = await getDb();
    const result = await db.collection("schedules").updateOne(
      { "bookings.bookingRef": ref },
      {
        $set: { "bookings.$.status": "cancelled" },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
