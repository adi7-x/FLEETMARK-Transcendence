# Fleetmark — Project Documentation
Last updated: 2026-03-23

## What Is This Project

Fleetmark is a night shuttle seat reservation platform
built for 1337 School, Ben Guerir, Morocco.

Students authenticate with their 42 Intra account,
select their home station once, and reserve seats on
nightly shuttle buses running from 21:00 to 06:00.

Staff manage buses, routes, trips, drivers, and view
reports through a separate admin dashboard.

This is a 42 School project built by a team of 5 students.

## The Team

Adil Bourji         → Frontend (React + Vite + JSX)
Mohamed Lahrech     → Backend (Django REST)
Abderrahman Chakour → Backend / Auth (42 OAuth + JWT)
Ayoub El Haouti     → Backend / QA (86/86 tests)
Aamir Tahtah        → DevOps (Docker + Prometheus)

## Tech Stack

Frontend:  React 18 + Vite + JSX + CSS Variables
Backend:   Django REST Framework
Auth:      42 Intra OAuth2 + JWT (SimpleJWT)
Database:  PostgreSQL
DevOps:    Docker Compose + Prometheus + Grafana
i18n:      English + French + Arabic (RTL)

## How To Run

docker-compose up --build
Frontend → http://localhost
Backend  → http://localhost:8000/api/v1/

Development:
  cd backend  && python manage.py runserver
  cd frontend && npm install && npm run dev
  Frontend → http://localhost:5173

## User Roles

STUDENT         → Books shuttle seats → /passenger/*
LOGISTICS_STAFF → Manages everything  → /admin/*
DRIVER          → Coming soon          → /driver

## Frontend Pages

Public:
  /              Landing page + 42 OAuth login
  /auth/callback OAuth callback + role redirect

Student:
  /onboarding         Pick home station (first login)
  /passenger          Tonight's trip + reserve CTA
  /passenger/reserve  Browse and reserve trips
  /passenger/history  Past and upcoming reservations
  /passenger/settings Station + language + sign out

Admin:
  /admin               Overview + stats + trips tonight
  /admin/trips         Full CRUD — create/edit/archive/delete
  /admin/buses         Bus management
  /admin/routes        Routes with ordered stops
  /admin/drivers       Driver management
  /admin/reservations  Search reservations by student
  /admin/reports       Ridership stats + chart
  /admin/settings      Platform settings

Driver:
  /driver    Coming soon page

## API Base URL

Development:  http://localhost:8000/api/v1
Docker:       http://backend:8000/api/v1

## Key API Endpoints Used

Auth:
  GET  /auth/42/login/              → get OAuth URL
  GET  /auth/42/callback/?code=     → exchange code for tokens
  GET  /auth/me/                    → get current user
  PATCH /auth/me/                   → update station

Student:
  GET  /trips/available/?station_id= → tonight's trips
  GET  /reservations/?user_id=       → active reservations
  GET  /reservations/history/        → past reservations
  POST /reservations/                → reserve a seat
  DELETE /reservations/{id}/         → cancel

Admin:
  GET/POST/PUT/DELETE /trips/
  GET/POST/PUT/DELETE /buses/
  GET/POST/PUT/DELETE /routes/
  GET/POST/PUT/DELETE /drivers/
  GET /reservations/?user_id=
  GET /reports/

## Field Names (Never Rename)

station         (user's home station UUID)
station_name    (resolved station name)
plate           (bus license plate)
seat_capacity   (max seats on bus)
departure_datetime  (ISO datetime)
login_42        (42 Intra username)
LOGISTICS_STAFF (admin role value)
window          (route type: peak | consolidated)

## What Was Done In This Session

✅ Full frontend rebuild from new-frontend/stitch-export.html design
✅ Design system: CSS variables + tokens + globals
✅ All UI components: Spinner, Badge, Toggle, EmptyState, Logo
✅ Contexts: AuthContext, ThemeContext
✅ Layouts: StudentLayout, AdminLayout
✅ All 18 pages rebuilt in JSX
✅ All routes wired in App.jsx with role protection
✅ All pages wired to real API — zero mock data
✅ i18n: EN + FR + AR with RTL support
✅ Dark mode toggle
✅ Dev server verified: localhost:5173
✅ Build verified: npm run build succeeds

## What Was NOT Changed

✗ backend/          → untouched, zero changes
✗ docker-compose.yml → untouched
✗ Any backend file  → not a single line changed

## Known Issues

### Task 1 — Visual parity (design HTML vs React) — 2026-03-23

Compared `new-frontend/stitch-export.html`, `student-dashboard`, and `admin-pages` to `Landing.jsx`, `StudentLayout` + `PassengerOverview`, and `AdminLayout` + `Trips.jsx`. Deltas addressed in code:

| Area | Was (delta) | Fix applied |
|------|-------------|-------------|
| Icons | Material Symbols not loaded → wrong/missing icon font | Added Google Material Symbols link in `index.html` + `.material-symbols-outlined` in `globals.css` |
| Landing nav | `sticky` vs design `fixed` | Nav `position: fixed`; main `paddingTop: 56` |
| Landing hero | Gradient used `--ink`→`--blue`; design white→primary | `linear-gradient` uses `--hero-gradient-start` + `--blue`; light text glow |
| Landing process | Empty right panel | Chrome-style window + `SYSTEM_READY` badge (no external image URL) |
| Landing schedule | Missing “Operational Windows” row, UTC blurb, card icons; Deep Orbit wrong color | Header grid + copy; `bolt` / `update` / `dark_mode`; `--orbit` token (purple parity) |
| Landing team | Plain cards vs layered image treatment | “Command Center” label; gradient overlay cards (no stock photos — intentional) |
| Landing CTA | Inverted dark card vs design white panel | `--inverse-surface` / `--on-inverse` card + primary CTA button |
| Tokens | Active nav `#191a1a`, purple orbit, light CTA surface | `--surface-active`, `--orbit`, `--inverse-surface`, `--on-inverse`, `--hero-gradient-start` in `tokens.css` |
| Student/Admin nav | Active row used `--surface2` | Active row uses `--surface-active` + `scale(0.98)` like stitch |
| Student top bar | Title size | `h1` → 24px to match `text-2xl` |
| Admin top bar | `sticky` + translucent vs design `fixed` + solid | Header `fixed` `left: 220px` `right: 0`, `background: var(--bg)` |
| Admin sidebar | Log out not pinned low | `marginTop: auto` on logout control |
| Admin Trips | Duplicate “New Trip” in filter row | Removed; header “New Trip” opens modal via `openTripForm` state or `fleetmark:new-trip` event |
| App routing | Layout titles | `pageTitle="Student Dashboard"`; admin titles from path (`Trips Management`, etc.) |
| Passenger hero | Seats / map / status | `left/cap` seats line; map panel gradient; pulsing dot + `fm-pulse` for “In Transit” |

**Remaining intentional / acceptable deltas**

- Team section: design uses real portrait images; React uses abstract gradients (no hardcoded stock URLs).
- Some copy differs slightly from stitch (i18n strings on Landing).
- Admin `Trips` table columns differ slightly from full admin-pages mock (e.g. no separate Countdown column) while keeping API-driven fields.

### Task 2 — Real login flow (manual QA)

**Not run end-to-end in this environment** (no interactive browser / DevTools here). You should still execute locally:

1. `docker-compose up` or backend `runserver` + `npm run dev` on `:5173`.
2. Landing loads from `/`.
3. **Automated check (2026-03-23):** `GET http://localhost:8000/api/v1/auth/42/login/` returned `200` with `authorization_url` beginning `https://api.intra.42.fr/oauth/authorize` — matches expected 42 OAuth start.
4. After Intra callback, frontend `AuthCallback.jsx` stores `fleetmark_access`, `fleetmark_refresh`, `fleetmark_user` and redirects: `LOGISTICS_STAFF` → `/admin`, `DRIVER` → `/driver`, `STUDENT` with no `station` → `/onboarding` (first-time), else → `/passenger`.
5. **You confirm:** browser Console has no errors; Network shows first authenticated API (e.g. `/auth/me/` on hash flow, or page fetch after redirect) returns `200`.

If login fails, capture the exact message from the UI, Network response body, and Console.

### Task 3 — Documentation

This section + Score Estimate below reflect the final pass above.

### Task 4 — Build

- `npm run build` (frontend) succeeds after parity changes.

## Score Estimate

**Subject-style requirements (frontend-facing) — status**

| Theme | Met in repo | Needs your / backend confirmation |
|-------|-------------|-------------------------------------|
| React app, routing, role-gated areas | ✅ `App.jsx`, `ProtectedRoute` | — |
| 42 OAuth entry + callback handling | ✅ `Landing` + `AuthCallback` | Full redirect + token exchange on real Intra app / callback URL |
| JWT / session storage | ✅ `fleetmark_*` keys | Refresh / expiry behavior from API |
| Student: station onboarding, reserve, history, settings | ✅ Wired to documented endpoints | Field shapes (`route_name`, `bus_seat_capacity`, etc.) |
| Staff: trips/buses/routes/drivers/reservations/reports | ✅ Pages + API calls | Same |
| UI rebuild vs `new-frontend` | ✅ Parity pass above | Pixel-perfect only if you visually re-check in browser |
| i18n EN/FR/AR + RTL | ✅ Landing + `data-lang` | Other pages mostly EN |
| No mock data in `src/` | ✅ (prior grep) | — |

**Rough grade band (informal):** frontend implementation and design alignment are in good shape; **full marks on auth/integration** depend on your manual OAuth run and backend contract tests.

**Bonuses (from team doc):** Prometheus · AR · health check — unchanged; confirm with backend/DevOps owner.
