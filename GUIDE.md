# 159.352 Assignment 2 – Complete Step-by-Step Guide
## Dairy Flat Air Online Booking System

---

## Project Structure Overview

```
dairy-flat-air/
├── app/
│   ├── api/
│   │   ├── schedules/
│   │   │   └── route.ts          ← GET: search flights
│   │   └── bookings/
│   │       ├── route.ts          ← GET: my bookings | POST: create booking
│   │       └── [ref]/
│   │           └── route.ts      ← DELETE: cancel booking
│   ├── search/
│   │   └── page.tsx              ← Flight search + booking UI
│   ├── my-flights/
│   │   └── page.tsx              ← View & cancel bookings
│   ├── globals.css               ← Design system
│   ├── layout.tsx                ← Navbar + root layout
│   └── page.tsx                  ← Landing page
├── lib/
│   ├── mongodb.ts                ← DB connection (singleton)
│   ├── flightData.ts             ← Airports, aircraft, weekly templates
│   ├── scheduleGenerator.ts      ← Template → real calendar dates
│   └── bookingRef.ts             ← Unique reference generator
├── scripts/
│   └── seed.ts                   ← Populate MongoDB (run once)
├── types/
│   └── index.ts                  ← TypeScript interfaces
├── .env.example                  ← Template for secrets
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Data Model

### MongoDB Collections

#### `schedules` collection
Each document = one concrete flight occurrence on a real calendar date.
Bookings are **embedded** inside the schedule (one-to-few pattern).

```json
{
  "_id": "ObjectId",
  "flightNumber": "DF101",
  "origin": "NZNE",
  "destination": "YSSY",
  "departureUTC": "2026-06-13T22:00:00.000Z",
  "arrivalUTC": "2026-06-14T03:30:00.000Z",
  "aircraftId": "SJ30i",
  "capacity": 6,
  "price": 1850,
  "bookings": [
    {
      "bookingRef": "DF-A1B2C3D",
      "passengerId": "...",
      "passengerName": "Mr John Smith",
      "passengerEmail": "john@example.com",
      "bookedAt": "2026-06-01T10:30:00Z",
      "status": "confirmed"
    }
  ]
}
```

#### `passengers` collection
Stores passenger details, upserted (by email) on each booking.

```json
{
  "_id": "ObjectId",
  "title": "Mr",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com"
}
```

### Why this design?
- Schedules + embedded bookings = single document read for seat-availability check
- Atomic MongoDB `$push` prevents race conditions when booking last seat
- Passengers are separate to avoid data duplication across multiple bookings

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/schedules?orig=NZNE&dest=YSSY&date1=2026-06-10&date2=2026-06-30` | Search flights |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?email=jane@example.com` | Get all bookings for a passenger |
| DELETE | `/api/bookings/DF-A1B2C3D` | Cancel a booking |

---

## Flight Schedule

| Flight | Route | Days | Departure (local) | Arrival (local) | Aircraft | Price (NZD) |
|--------|-------|------|-------------------|-----------------|----------|-------------|
| DF101 | NZNE → YSSY | Friday | 10:00 NZST | 13:30 AEST | SyberJet SJ30i | 1,850 |
| DF102 | YSSY → NZNE | Sunday | 14:30 AEST | 21:30 NZST | SyberJet SJ30i | 1,850 |
| DF201 | NZNE → NZRO | Mon–Fri | 06:30 NZST | 07:15 NZST | Cirrus SF50-A | 220 |
| DF202 | NZRO → NZNE | Mon–Fri | 07:45 NZST | 08:30 NZST | Cirrus SF50-A | 220 |
| DF203 | NZNE → NZRO | Mon–Fri | 16:30 NZST | 17:15 NZST | Cirrus SF50-A | 220 |
| DF204 | NZRO → NZNE | Mon–Fri | 18:00 NZST | 18:45 NZST | Cirrus SF50-A | 220 |
| DF301 | NZNE → NZGB | Mon/Wed/Fri | 09:00 NZST | 09:40 NZST | Cirrus SF50-B | 195 |
| DF302 | NZGB → NZNE | Tue/Thu/Sat | 10:30 NZST | 11:10 NZST | Cirrus SF50-B | 195 |
| DF401 | NZNE → NZCI | Tue/Fri | 08:00 NZST | 10:45 CHAST | HondaJet A | 480 |
| DF402 | NZCI → NZNE | Wed/Sat | 11:30 CHAST | 13:45 NZST | HondaJet A | 480 |
| DF501 | NZNE → NZTL | Monday | 11:00 NZST | 13:00 NZST | HondaJet B | 360 |
| DF502 | NZTL → NZNE | Tuesday | 14:00 NZST | 16:00 NZST | HondaJet B | 360 |

---

## Step-by-Step Setup Instructions

### Step 1 – Create a new Next.js project

```bash
npx create-next-app@latest dairy-flat-air \
  --typescript --app --no-tailwind --eslint --src-dir=no --import-alias="@/*"
cd dairy-flat-air
```

Then **replace** the generated files with those provided in this scaffold.

### Step 2 – Install dependencies

```bash
npm install mongodb luxon dotenv
npm install --save-dev @types/luxon tsx
```

### Step 3 – Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account.
2. Create a **free M0 cluster** (e.g. in Sydney for low latency).
3. In **Database Access**, create a user (e.g. `dfair-admin`) with read/write access.
4. In **Network Access**, click **Add IP Address → Allow Access from Anywhere** (0.0.0.0/0).
5. Click **Connect → Drivers**, copy the connection string.

```bash
# Create .env.local (never commit this!)
cp .env.example .env.local
# Edit .env.local and paste your connection string
```

### Step 4 – Seed the database

```bash
npm run seed
```

This will:
- Drop any existing `schedules` and `passengers` collections
- Insert ~12 weeks of flight schedules (~500+ documents)
- Create MongoDB indexes for fast querying

### Step 5 – Run locally

```bash
npm run dev
# Open http://localhost:3000
```

Test the full flow:
1. Visit the landing page and click a route card
2. Search flights and book one
3. Use "My Bookings" with your email to view and cancel

### Step 6 – Deploy to Vercel

1. Push your code to a **GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit – Dairy Flat Air booking system"
   git remote add origin https://github.com/YOUR_USERNAME/dairy-flat-air.git
   git push -u origin main
   ```

2. Go to https://vercel.com → **Add New Project** → import your GitHub repo.

3. In **Environment Variables**, add:
   - `MONGODB_URI` = your full Atlas connection string

4. Click **Deploy**. Vercel will auto-detect Next.js and build it.

5. Your app will be live at `https://dairy-flat-air.vercel.app` (or similar).

---

## Marking Scheme Checklist

| Criterion | Implementation |
|-----------|---------------|
| ✅ Landing page entry point | `app/page.tsx` with route cards |
| ✅ Search for flights | `app/search/page.tsx` + `GET /api/schedules` |
| ✅ Select a flight & book | Booking modal in search page + `POST /api/bookings` |
| ✅ Cancel a booking | Cancel button in My Bookings + `DELETE /api/bookings/[ref]` |
| ✅ View all flights for a passenger | My Bookings page + `GET /api/bookings?email=` |
| ✅ Unique booking reference | `lib/bookingRef.ts` → e.g. `DF-A1B2C3D` |
| ✅ No overbooking | Atomic capacity check before inserting booking |
| ✅ Real calendar dates | Luxon-powered schedule generator |
| ✅ 12+ weeks of schedules | Seed script generates 12 weeks |
| ✅ Timezones (NZ/Chatham/Sydney) | Luxon with IANA timezone strings |
| ✅ Invoice/confirmation page | Full details shown after booking |
| ✅ Attractive UI | Navy/gold design system, Playfair Display typography |
| ✅ Deployed on Vercel | Follow Step 6 above |

---

## Key Design Decisions

**Why embed bookings inside schedules?**
MongoDB's document model lets us check capacity and write the new booking in a single
atomic operation using `$push`. This prevents two passengers accidentally getting the
last seat if they book simultaneously.

**Why store all times as UTC internally?**
UTC storage is timezone-unambiguous. The `luxon` library then converts to local display
times on the fly, correctly handling NZ Daylight Saving, Chatham Islands' unusual
GMT+12:45 offset, and Sydney AEST/AEDT.

**Why a seed script rather than on-demand generation?**
The assignment requires the database to be pre-loaded. A seed script also allows you to
easily re-run with different date ranges. For a production system you would add a cron
job to extend the schedule rolling-forward.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MONGODB_URI not set` | Check `.env.local` exists and has the correct variable name |
| Connection timeout | In Atlas → Network Access, ensure 0.0.0.0/0 is whitelisted |
| Seed shows 0 flights | Check luxon weekday mapping; re-run `npm run seed` |
| Build fails on Vercel | Ensure `MONGODB_URI` is set in Vercel project settings |
| `luxon` not found | Run `npm install luxon && npm install --save-dev @types/luxon` |
