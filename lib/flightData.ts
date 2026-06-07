import type { Airport, Aircraft } from "@/types";

export const AIRPORTS: Record<string, Airport> = {
  NZNE: { icao: "NZNE", name: "Dairy Flat Airport",              city: "Dairy Flat",       timezone: "Pacific/Auckland", offsetLabel: "GMT+12"    },
  YSSY: { icao: "YSSY", name: "Sydney Kingsford Smith Airport",  city: "Sydney",           timezone: "Australia/Sydney", offsetLabel: "GMT+10"    },
  NZRO: { icao: "NZRO", name: "Rotorua Airport",                 city: "Rotorua",          timezone: "Pacific/Auckland", offsetLabel: "GMT+12"    },
  NZCI: { icao: "NZCI", name: "Tuuta Airport",                   city: "Chatham Islands",  timezone: "Pacific/Chatham",  offsetLabel: "GMT+12:45" },
  NZGB: { icao: "NZGB", name: "Claris Airport",                  city: "Great Barrier Island", timezone: "Pacific/Auckland", offsetLabel: "GMT+12" },
  NZTL: { icao: "NZTL", name: "Lake Tekapo Airport",             city: "Lake Tekapo",      timezone: "Pacific/Auckland", offsetLabel: "GMT+12"    },
};

export const AIRCRAFT: Record<string, Aircraft> = {
  "SJ30i":  { id: "SJ30i",  name: "SyberJet SJ30i",    capacity: 6 },
  "SF50-1": { id: "SF50-1", name: "Cirrus SF50 (A)",    capacity: 4 },
  "SF50-2": { id: "SF50-2", name: "Cirrus SF50 (B)",    capacity: 4 },
  "HJ-1":   { id: "HJ-1",   name: "HondaJet Elite (A)", capacity: 5 },
  "HJ-2":   { id: "HJ-2",   name: "HondaJet Elite (B)", capacity: 5 },
};

/**
 * Weekly recurring flight templates.
 *
 * dayOfWeek / weekdays use LUXON convention:
 *   1=Mon  2=Tue  3=Wed  4=Thu  5=Fri  6=Sat  7=Sun
 *
 * departureLocal = local time at origin airport  (HH:mm)
 * arrivalLocal   = local time at destination airport (HH:mm)
 */
export const FLIGHT_TEMPLATES = [

  // ── Sydney prestige service ────────────────────────────────────────────────
  {
    flightNumber:   "DF101",
    origin:         "NZNE",
    destination:    "YSSY",
    dayOfWeek:      5,          // Friday (Luxon 5)
    departureLocal: "10:00",    // 10:00 NZST → UTC-2 = 22:00 Thu UTC
    arrivalLocal:   "13:30",    // 13:30 AEST  (3h30 westbound)
    aircraftId:     "SJ30i",
    price:          1850,
  },
  {
    flightNumber:   "DF102",
    origin:         "YSSY",
    destination:    "NZNE",
    dayOfWeek:      7,          // Sunday (Luxon 7, NOT 0!)
    departureLocal: "14:30",    // 14:30 AEST
    arrivalLocal:   "21:30",    // 21:30 NZST (5h eastbound)
    aircraftId:     "SJ30i",
    price:          1850,
  },

  // ── Rotorua shuttle – first rotation (Mon–Fri) ────────────────────────────
  {
    flightNumber:   "DF201",
    origin:         "NZNE",
    destination:    "NZRO",
    dayOfWeek:      -1,
    weekdays:       [1, 2, 3, 4, 5],   // Mon–Fri (Luxon 1–5)
    departureLocal: "06:30",
    arrivalLocal:   "07:15",
    aircraftId:     "SF50-1",
    price:          220,
  },
  {
    flightNumber:   "DF202",
    origin:         "NZRO",
    destination:    "NZNE",
    dayOfWeek:      -1,
    weekdays:       [1, 2, 3, 4, 5],
    departureLocal: "07:45",
    arrivalLocal:   "08:30",
    aircraftId:     "SF50-1",
    price:          220,
  },

  // ── Rotorua shuttle – second rotation (Mon–Fri) ───────────────────────────
  {
    flightNumber:   "DF203",
    origin:         "NZNE",
    destination:    "NZRO",
    dayOfWeek:      -1,
    weekdays:       [1, 2, 3, 4, 5],
    departureLocal: "16:30",
    arrivalLocal:   "17:15",
    aircraftId:     "SF50-1",
    price:          220,
  },
  {
    flightNumber:   "DF204",
    origin:         "NZRO",
    destination:    "NZNE",
    dayOfWeek:      -1,
    weekdays:       [1, 2, 3, 4, 5],
    departureLocal: "18:00",
    arrivalLocal:   "18:45",
    aircraftId:     "SF50-1",
    price:          220,
  },

  // ── Great Barrier Island – 3× weekly ──────────────────────────────────────
  // Outbound: Mon/Wed/Fri (Luxon 1/3/5)
  {
    flightNumber:   "DF301",
    origin:         "NZNE",
    destination:    "NZGB",
    dayOfWeek:      -1,
    weekdays:       [1, 3, 5],
    departureLocal: "09:00",
    arrivalLocal:   "09:40",
    aircraftId:     "SF50-2",
    price:          195,
  },
  // Inbound: Tue/Thu/Sat (Luxon 2/4/6)
  {
    flightNumber:   "DF302",
    origin:         "NZGB",
    destination:    "NZNE",
    dayOfWeek:      -1,
    weekdays:       [2, 4, 6],
    departureLocal: "10:30",
    arrivalLocal:   "11:10",
    aircraftId:     "SF50-2",
    price:          195,
  },

  // ── Chatham Islands – 2× weekly ───────────────────────────────────────────
  // Outbound: Tue/Fri (Luxon 2/5)
  {
    flightNumber:   "DF401",
    origin:         "NZNE",
    destination:    "NZCI",
    dayOfWeek:      -1,
    weekdays:       [2, 5],
    departureLocal: "08:00",
    arrivalLocal:   "10:45",   // +2h45 inc. timezone crossing
    aircraftId:     "HJ-1",
    price:          480,
  },
  // Inbound: Wed/Sat (Luxon 3/6)
  {
    flightNumber:   "DF402",
    origin:         "NZCI",
    destination:    "NZNE",
    dayOfWeek:      -1,
    weekdays:       [3, 6],
    departureLocal: "11:30",
    arrivalLocal:   "13:45",
    aircraftId:     "HJ-1",
    price:          480,
  },

  // ── Lake Tekapo – weekly ───────────────────────────────────────────────────
  {
    flightNumber:   "DF501",
    origin:         "NZNE",
    destination:    "NZTL",
    dayOfWeek:      1,          // Monday (Luxon 1)
    departureLocal: "11:00",
    arrivalLocal:   "13:00",
    aircraftId:     "HJ-2",
    price:          360,
  },
  {
    flightNumber:   "DF502",
    origin:         "NZTL",
    destination:    "NZNE",
    dayOfWeek:      2,          // Tuesday (Luxon 2)
    departureLocal: "14:00",
    arrivalLocal:   "16:00",
    aircraftId:     "HJ-2",
    price:          360,
  },
];
