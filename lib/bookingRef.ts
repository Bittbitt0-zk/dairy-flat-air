/**
 * Generates a unique booking reference like "DF-A1B2C3D4"
 */
export function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let ref = "DF-";
  for (let i = 0; i < 7; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}
