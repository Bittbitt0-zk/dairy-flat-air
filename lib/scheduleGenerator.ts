import { DateTime } from "luxon";
import { AIRPORTS, AIRCRAFT, FLIGHT_TEMPLATES } from "./flightData";
import type { Schedule } from "@/types";

/**
 * Convert a local date + time at a given airport to a UTC ISO string.
 */
function toUTC(dateStr: string, timeStr: string, icao: string): string {
  const tz = AIRPORTS[icao].timezone;
  const dt = DateTime.fromFormat(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", {
    zone: tz,
  });
  return dt.toUTC().toISO()!;
}

/**
 * Generate all schedule documents for [startDate, endDate] (YYYY-MM-DD inclusive).
 *
 * Day-of-week convention (matches Luxon):
 *   1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday,
 *   5 = Friday,  6 = Saturday, 7 = Sunday
 *
 * All FLIGHT_TEMPLATES must use this convention in dayOfWeek / weekdays.
 */
export function generateSchedules(
  startDate?: string,
  endDate?: string
): Schedule[] {
  const start = startDate
    ? DateTime.fromISO(startDate)
    : DateTime.now().startOf("week");            // Monday
  const end = endDate
    ? DateTime.fromISO(endDate)
    : start.plus({ weeks: 12 });

  const schedules: Schedule[] = [];
  let current = start;

  while (current <= end) {
    const dateStr = current.toFormat("yyyy-MM-dd");
    const luxonDow = current.weekday; // 1=Mon … 7=Sun

    for (const tmpl of FLIGHT_TEMPLATES) {
      const weekdays: number[] | undefined = (tmpl as any).weekdays;

      // Build list of target Luxon weekdays for this template
      const targetDays: number[] = weekdays
        ? weekdays
        : tmpl.dayOfWeek > 0
        ? [tmpl.dayOfWeek]
        : [];

      if (!targetDays.includes(luxonDow)) continue;

      const aircraft = AIRCRAFT[tmpl.aircraftId];
      const departureUTC = toUTC(dateStr, tmpl.departureLocal, tmpl.origin);
      const arrivalUTC   = toUTC(dateStr, tmpl.arrivalLocal,   tmpl.destination);

      schedules.push({
        flightNumber:  tmpl.flightNumber,
        origin:        tmpl.origin,
        destination:   tmpl.destination,
        departureUTC,
        arrivalUTC,
        aircraftId:    tmpl.aircraftId,
        capacity:      aircraft.capacity,
        price:         tmpl.price,
        bookings:      [],
      });
    }

    current = current.plus({ days: 1 });
  }

  return schedules;
}
