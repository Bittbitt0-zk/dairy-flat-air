/**
 * Seed script – run with:
 *   npm run seed
 *
 * Requires MONGODB_URI in .env.local
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
import { generateSchedules } from "../lib/scheduleGenerator";
import { DateTime } from "luxon";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env.local");

  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB ✓");

  const db = client.db("dairy-flat-air");
  const schedulesCol  = db.collection("schedules");
  const passengersCol = db.collection("passengers");

  // Drop and recreate
  await schedulesCol.drop().catch(() => {});
  await passengersCol.drop().catch(() => {});

  // Generate 12 weeks from the start of the current week
  const start = DateTime.now().startOf("week").toFormat("yyyy-MM-dd");
  const end   = DateTime.now().startOf("week").plus({ weeks: 12 }).toFormat("yyyy-MM-dd");

  console.log(`Generating schedules from ${start} to ${end}…`);
  const schedules = generateSchedules(start, end);
  console.log(`  → ${schedules.length} flight documents`);

  if (schedules.length === 0) {
    console.error("ERROR: 0 schedules generated — check dayOfWeek values in flightData.ts");
    await client.close();
    process.exit(1);
  }

  await schedulesCol.insertMany(schedules as any[]);

  // Indexes
  await schedulesCol.createIndex({ origin: 1, destination: 1, departureUTC: 1 });
  await schedulesCol.createIndex({ "bookings.bookingRef": 1 });
  await schedulesCol.createIndex({ "bookings.passengerEmail": 1 });

  await passengersCol.createIndex({ email: 1 }, { unique: true });

  console.log("Seed complete ✓");

  // Quick sanity check
  const sample = await schedulesCol.findOne({ origin: "NZNE", destination: "NZRO" });
  if (sample) {
    console.log(`Sample NZNE→NZRO: flight ${sample.flightNumber} departs ${sample.departureUTC}`);
  } else {
    console.warn("WARNING: No NZNE→NZRO flights found — re-check weekday mapping");
  }

  await client.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
