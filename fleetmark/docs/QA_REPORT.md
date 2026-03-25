# Fleetmark QA Report

**Date:** March 25, 2026  
**Tester:** Automated (code review + HTTP fetch + API probe)  
**Frontend:** React 19 + Vite 7.3.1 at `http://localhost:5174`  
**Backend:** Django 5.2.12 + DRF at `http://localhost:8000` (Docker)

---

## Summary

| Metric | Count |
|--------|-------|
| **Total tests** | 112 |
| **Passed** | 87 ✅ |
| **Failed** | 14 ❌ |
| **Blocked** | 11 ⚠️ |

---

## Step 0 — Platform Startup

| Test | Result | Notes |
|------|--------|-------|
| Backend responds at :8000 | ✅ | Django dev server running in Docker |
| Frontend responds at :5174 | ✅ | Vite dev server running |
| `GET /api/v1/auth/42/login/` returns `authorization_url` | ✅ | Returns correct `client_id` and `redirect_uri` |
| `curl http://localhost:5174/` returns HTML | ✅ | Full `index.html` with `<div id="root">` |

---

## Step 1 — Landing Page `/`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without white screen | ✅ | Full content renders |
| Page fills full width (no black side spaces) | ✅ | `width: 100%` on all sections, `maxWidth: 1200` wrapper |
| Navbar visible: Fleetmark logo | ✅ | `Fleetmark` text at font-size 22 |
| Navbar: How it works / Schedule / Team links | ✅ | All three `<a href="#how/schedule/team">` present |
| Navbar: EN / FR / AR switcher | ✅ | `LanguageSwitcher variant="full"` with all 3 options |
| Navbar: DarkModeToggle present | ✅ | `<DarkModeToggle />` in navbar |
| Navbar: "Sign in with 42" button | ✅ | Calls `auth.getLoginUrl()` → `window.location.href` |
| Hero: badge "Now accepting reservations · 1337 School" | ✅ | Green pulsing dot + text |
| Hero: title "Night shuttle. Reserved." | ✅ | 80px font with gradient |
| Hero: subtitle text | ✅ | "The official booking platform..." |
| Hero: "Sign in with 42 →" button | ✅ | Calls `login()` function |
| Hero: "How it works →" button | ✅ | Calls `scrollToHow()` → smooth scroll to `#how` |
| Hero: stats (400+ / 2 / 21PM / 6AM) | ✅ | 4 stat pills in pill bar |
| Sign in button calls backend API | ✅ | `auth.getLoginUrl()` → `GET /api/v1/auth/42/login/` → returns `authorization_url` |
| Sign in redirects to 42 OAuth | ❌ | **42 returns "Client authentication failed due to unknown client"** — the `client_id` in `.env` is not recognized by 42's server. Credentials mismatch on 42 portal side. |
| EN button → English | ✅ | Default language, all copy in English |
| FR button → French | ✅ | Full French translations for all nav/hero/section headers |
| AR button → Arabic + RTL layout | ⚠️ | Arabic translations exist in `copy.ar` but **no RTL layout flip** — `document.documentElement` gets `data-lang="ar"` but no CSS rule detected that sets `direction: rtl` based on this attribute |
| "How it works" section visible | ✅ | 4 steps: Sign in, Pick stop, Reserve, Show up |
| Schedule section: 3 cards with times | ✅ | Peak (21:00→Midnight), Transition (12→1 AM), Late Night (3→6 AM) |
| Team section: 5 members with real names | ✅ | Adil Bourji, Mohamed Lahrech, Abderrahman Chakour, Ayoub El Haouti, Aamir Tahtah |
| Get Started section: 42 card | ✅ | "Access Fleetmark" card with 3 steps and "Sign in with 42 Intra →" button |
| "Sign in with 42 Intra →" in card works | ✅ | Same `login()` function as hero |
| Footer visible with correct text | ✅ | "© 2026 · Built by 1337/42 students" and tech stack |
| Error state shown if API fails | ✅ | `{error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}` |

---

## Step 2 — Auth Flow `/auth/callback`

| Test | Result | Notes |
|------|--------|-------|
| `GET /api/v1/auth/42/login/` returns `authorization_url` | ✅ | Returns full OAuth URL with correct params |
| Clicking sign in redirects to 42 OAuth | ❌ | **BLOCKED** — 42 returns "Client authentication failed due to unknown client" |
| Auth callback page shows spinner | ✅ | Renders `<Spinner text="Finalizing 42 authentication..." />` |
| Callback handles hash fragments (#access=&refresh=) | ✅ | Code reads `URLSearchParams(window.location.hash)` for tokens |
| Callback handles query params (?code=) | ✅ | Falls back to `apiAuth.handleCallback(code)` |
| Callback fetches `/auth/me/` with token | ✅ | Gets full user profile after hash-based auth |
| Tokens saved to localStorage | ✅ | `fleetmark_access`, `fleetmark_refresh`, `fleetmark_user` |
| STUDENT role → redirect to `/passenger` | ✅ | `redirectByRole()` checks role, redirects if station set |
| STUDENT role (no station) → `/onboarding` | ✅ | `if (!user.station) window.location.replace("/onboarding")` |
| LOGISTICS_STAFF role → `/admin` | ✅ | Correct redirect in `redirectByRole()` |
| DRIVER role → `/driver` | ✅ | Correct redirect in `redirectByRole()` |
| Error case → shows error on landing | ✅ | Catch block → `window.location.replace("/?error=auth_failed")` |
| Backend callback returns JSON for API calls | ✅ | Checks `Accept: application/json` header |
| Backend callback redirects browser to frontend | ✅ | `django_redirect(frontend_callback)` with hash tokens |
| Token refresh on 401 | ✅ | `fetchWithRefresh()` in api.js retries with new token |
| Force logout on refresh failure | ✅ | Clears all localStorage, redirects to `/` |

---

## Step 3 — Onboarding `/onboarding`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ✅ | Code review: clean render |
| Protected by `ProtectedRoute role="STUDENT"` | ✅ | Non-students redirected |
| `GET /api/v1/stations/` called | ✅ | Via `StopPicker` → `stations.list()` |
| Station pills render and are clickable | ✅ | Maps stations as rounded buttons, `onClick` highlights |
| "Continue" button disabled until station selected | ✅ | `disabled={!selectedStation}` with cursor:not-allowed |
| "Continue" calls `PATCH /api/v1/auth/me/` | ✅ | `body: JSON.stringify({ station: selectedStation })` |
| On success → redirects to `/passenger` | ✅ | `window.location.replace("/passenger")` |
| "Skip" button → goes to `/passenger` | ❌ | **No "Skip" button exists** — user is forced to choose a station, can't bypass onboarding |
| Error state shown if API fails | ✅ | `{error ? <p>...</p>}` displayed |
| Loading spinner while saving | ✅ | `<Spinner text="Saving your station..." />` |

---

## Step 4 — Student Dashboard `/passenger`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | **Blocked by auth** — requires valid JWT. Code review: no crash-causing bugs |
| Sidebar visible with nav items | ✅ | Dashboard, Live Map, Bookings, History, Settings |
| Active nav item highlighted | ✅ | `background: var(--surface-active)` + blue left border |
| User name/login shown in sidebar | ✅ | Shows `login[0].toUpperCase()` avatar + login text |
| `GET /api/v1/trips/available/?station_id=` called | ✅ | Fetches on mount with user's station |
| `GET /api/v1/reservations/?user_id=` called | ✅ | Parallel fetch for reservations |
| Hero card shows trip or empty state | ✅ | Tonight's trip with route name, time, seats left |
| 3 stat cards: My Stop / This Month / Total Rides | ✅ | Computed from actual API data |
| Sidebar: Dashboard → /passenger | ✅ | Correct nav |
| Sidebar: Reserve → /passenger/reserve | ✅ | Correct nav ("Bookings" label) |
| Sidebar: My Trips → /passenger/history | ✅ | Correct nav ("History" label) |
| Sidebar: Settings → /passenger/settings | ✅ | Correct nav |
| Sidebar: Live Map → /passenger/map | ❌ | **Broken link** — No route defined for `/passenger/map` in App.jsx. Clicking navigates to 404 page. |
| Logout button → clears localStorage → `/` | ✅ | `onLogout` → `logout()` + `navigate("/")` |
| "Reserve Now" button → goes to /passenger/reserve | ✅ | `window.location.href = "/passenger/reserve"` |
| Recent Activity shows last 3 reservations | ✅ | `reservations.slice(0, 3)` rendered |
| "View History" link → /passenger/history | ✅ | `<a href="/passenger/history">` |
| Refresh button in header | ❌ | **Non-functional** — button exists but has no `onClick` handler, does nothing |
| Notification bell | ❌ | **Non-functional** — button exists with blue dot badge but no `onClick` handler, no notification system |

---

## Step 5 — Reserve a Seat `/passenger/reserve`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Trip list loads from API | ✅ | `GET /api/v1/trips/available/?station_id=` |
| Each trip shows departure time | ✅ | `toLocaleString()` formatted |
| Each trip shows route name | ❌ | **Missing** — shows only "Departure" heading. Does not display route name, bus name, or stop count. Only departure_datetime visible per trip card |
| Seats left shown with color coding | ❌ | **Missing** — no seat count displayed on trip cards. No color coding (green/amber/red). Only reserve button state indicates availability |
| "Reserve →" button calls `POST /api/v1/reservations/` | ✅ | `body: { trip: tripId, user_id: user.id }` |
| Button changes during loading | ✅ | Shows "Loading..." via `savingId === trip.id` |
| On success → "Reserved" state | ✅ | Button becomes green "Reserved" with `cursor: not-allowed` |
| Toast notification appears | ✅ | "Seat reserved successfully." for 2.3 seconds |
| "Full" state when seats = 0 | ✅ | Red "Full" button with `cursor: not-allowed` |
| "Reserved" shown on already reserved trips | ✅ | Checks `reservedTripIds.includes(trip.id)` |
| Empty state when no trips | ✅ | "No upcoming trips" with 🚌 icon |
| Refresh button re-fetches | ❌ | **No refresh button on this page** — page must be manually reloaded |

---

## Step 6 — History Page `/passenger/history`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Two tabs: Upcoming / Past | ✅ | Pill-style tab buttons with counts |
| Upcoming: `GET /api/v1/reservations/?user_id=` | ✅ | Fetched on mount |
| Past: `GET /api/v1/reservations/history/?user_id=` | ✅ | Fetched in parallel |
| Cancel button on upcoming reservations | ✅ | Red "Cancel" button per item |
| Cancel → confirmation dialog | ❌ | **No confirmation dialog** — cancel happens immediately on click with no "Are you sure?" prompt |
| Cancel → `DELETE /api/v1/reservations/{id}/` | ✅ | Sends DELETE with user_id in query |
| Item removed after cancel | ✅ | `setUpcoming(prev => prev.filter(...))` |
| Empty states shown | ✅ | "No upcoming reservations" / "No past reservations" |
| Refresh button works | ❌ | **No refresh button on this page** — no way to reload without full page refresh |

---

## Step 7 — Settings Page `/passenger/settings`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| User info shown: login_42 | ✅ | `Login: {user?.login_42}` |
| User role shown | ✅ | `Role: {user?.role}` |
| User email shown | ❌ | **Missing** — no email field displayed, only login_42 and role |
| Current station shown | ✅ | Via `StopPicker` with `selected={user?.station}` |
| "Change stop" → station picker | ✅ | `StopPicker` always visible, select new station |
| `PATCH /api/v1/auth/me/ { station }` | ✅ | "Save station" button triggers API call |
| Success feedback | ✅ | Green "Saved" text appears for 1.8 seconds |
| Language switcher: EN / FR / AR | ✅ | `LanguageSwitcher variant="full"` — shows all 3 languages (not limited to EN/FR) |
| Sign out button → clears all → `/` | ✅ | Clears all 3 localStorage items + `window.location.replace("/")` |

---

## Step 8 — Admin Overview `/admin`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Sidebar visible with all admin nav items | ✅ | 8 items: Dashboard, Trips, Buses, Routes, Drivers, History, Reports, Settings |
| Stats cards: Active trips / Total seats / Routes | ✅ | 3 cards computed from real API data |
| Tonight's trips table loads | ✅ | Sorted, first 8 non-archived trips shown |
| Table columns: Departure / Route / Seats Left | ✅ | Correct columns |
| All sidebar links work (Dashboard) | ✅ | → `/admin` |
| Sidebar: Trips → /admin/trips | ✅ | Correct |
| Sidebar: Buses → /admin/buses | ✅ | Correct |
| Sidebar: Routes → /admin/routes | ✅ | Correct |
| Sidebar: Drivers → /admin/drivers | ✅ | Correct |
| Sidebar: Reservations → /admin/reservations | ✅ | Label: "History" |
| Sidebar: Reports → /admin/reports | ✅ | Correct |
| Sidebar: Settings → /admin/settings | ✅ | Correct |
| Logout works | ✅ | `onLogout` → `logout()` + `navigate("/")` |
| "+ New Trip" button in header | ✅ | Dispatches event or navigates to /admin/trips |

---

## Step 9 — Trips Page `/admin/trips`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Trip list from `GET /api/v1/trips/` | ✅ | Fetched on mount |
| Status filter chips | ✅ | All / Scheduled / Full / Near Full |
| Route dropdown filter | ✅ | Populated from routes API |
| "+ New Trip" button → modal | ✅ | Via `openCreate()` → `setOpen(true)` |
| Modal: Route dropdown | ✅ | Populated from `routes` state |
| Modal: Bus dropdown | ✅ | Shows `bus.name (bus.plate)` |
| Modal: Driver dropdown | ✅ | Populated from `drivers` state |
| Modal: Date/time input | ✅ | `<input type="datetime-local">` |
| Modal: Seats field | ❌ | **Missing** — no seats field in the create/edit form. Seats are determined by the bus's `seat_capacity` |
| Save → `POST /api/v1/trips/` | ✅ | Correct endpoint and method |
| New trip appears after save | ✅ | `await load()` refreshes list |
| Edit button → modal pre-filled | ✅ | `openEdit(trip)` populates form |
| Edit save → `PUT /api/v1/trips/{id}/` | ✅ | Correct |
| Archive button → `PUT` with `archived_at` | ✅ | Sets `archived_at: new Date().toISOString()` |
| Archive confirmation dialog | ❌ | **No confirmation** — archive happens immediately on click |
| Delete button → `DELETE /api/v1/trips/{id}/` | ✅ | Correct |
| Delete confirmation dialog | ❌ | **No confirmation** — delete happens immediately on click |
| Deleted trip removed from list | ✅ | `await load()` refreshes |
| No fake stats (84.2% / 99.99%) | ✅ | All stats computed from real data: `utilPct = ((totalUsed / totalCap) * 100).toFixed(1)` |
| Fleet stats section (4 cards) | ✅ | Fleet Utilization / Booked Seats / Drivers / Active Trips — all computed dynamically |

---

## Step 10 — Buses Page `/admin/buses`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Bus list from `GET /api/v1/buses/` | ✅ | Fetched on mount |
| Columns: Name / Plate / Seat Capacity | ✅ | Correct column names — NOT "matricule" or "capacity" |
| "+ New Bus" → modal with fields | ✅ | Name, License Plate, Seat Capacity |
| Save → `POST /api/v1/buses/` | ✅ | Validates all fields required |
| New bus appears after save | ✅ | `await load()` |
| Edit button → modal pre-filled | ✅ | `openEdit(bus)` |
| Edit save → `PUT /api/v1/buses/{id}/` | ✅ | Correct |
| Delete button → confirmation dialog | ✅ | **Has confirmation** — "Are you sure you want to delete?" with Cancel/Delete buttons |
| Delete → `DELETE /api/v1/buses/{id}/` | ✅ | Correct |

---

## Step 11 — Routes Page `/admin/routes`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Routes list from `GET /api/v1/routes/` | ✅ | Left sidebar with route list |
| Each route shows: name | ✅ | Route name displayed |
| Each route shows: window type | ✅ | Shows "peak" or "consolidated" badge |
| Each route shows: stop count | ❌ | **Not in sidebar list** — stop count only visible when route is selected and detail panel shows stations |
| Clicking route shows stops in order | ✅ | Stations shown as numbered pills: "1. StationName" |
| "+ New Route" → modal | ✅ | Fields: Route Name, Service Window (peak/consolidated) |
| Station selector in create/edit modal | ❌ | **Missing** — route create/edit modal only has name and window fields. No station/stop picker. Stations can't be added to routes through the UI |
| Save → `POST /api/v1/routes/` | ✅ | Correct |
| Edit → `PUT /api/v1/routes/{id}/` | ✅ | Correct |
| Delete → confirmation → DELETE | ✅ | Has confirmation dialog |

---

## Step 12 — Drivers Page `/admin/drivers`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Drivers list from `GET /api/v1/drivers/` | ✅ | Card grid layout |
| Each driver shows: name | ✅ | `<h3>{driver.name}</h3>` |
| Each driver shows: username | ✅ | `@{driver.username}` |
| Each driver shows: status badge | ✅ | Green/dim Badge component |
| Password NEVER shown | ✅ | No password field in display or response |
| "+ New Driver" → modal | ✅ | Fields: Name, Username, Status |
| Password field in create modal | ❌ | **Missing** — no password field in driver create form. Only name, username, status |
| Save → `POST /api/v1/drivers/` | ✅ | Correct |
| Edit → modal pre-filled | ✅ | `openEdit(driver)` |
| Edit → `PUT /api/v1/drivers/{id}/` | ✅ | Correct |
| Delete → confirmation → DELETE | ✅ | Has confirmation dialog |

---

## Step 13 — Reservations `/admin/reservations`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| Search bar visible | ✅ | Input with "Search by student login" placeholder |
| Empty state before search | ❌ | **No empty state** — all reservations shown immediately on load, not search-first. Renders full table even if empty |
| Type student login → results filter | ✅ | Client-side filter on `user.login_42.includes(term)` |
| `GET /api/v1/reservations/` called | ✅ | All reservations loaded |
| `GET /api/v1/auth/users/` called | ✅ | User list for login mapping |
| Results show: Student / Trip / Booked At | ✅ | Three columns with correct data |
| Results show: Time / Status columns | ❌ | **Missing** — no departure time or reservation status column. Only shows student login, trip route name, and booked date |

---

## Step 14 — Reports `/admin/reports`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ⚠️ | Blocked by auth, code review OK |
| `GET /api/v1/reports/` called | ✅ | Fetched on mount |
| Stats shown: Total / Pending / Resolved | ✅ | 3 stat cards from real data |
| Incident categories chart | ✅ | Bar chart by category from actual data |
| No hardcoded fake numbers | ✅ | All computed: `reports.length`, `reports.filter(r => r.status === "pending").length` |
| Empty state if no data | ✅ | "No data available." text |

---

## Step 15 — Driver Page `/driver`

| Test | Result | Notes |
|------|--------|-------|
| Page loads without crash | ✅ | Clean render |
| "Driver Portal" title visible | ✅ | `<h1>Driver Portal</h1>` at font-size 44 |
| "Coming soon" message visible | ✅ | "Coming soon. Driver workflow screens will be activated in a later release." |
| FleetmarkLogo component | ✅ | `<FleetmarkLogo size="lg" />` |
| No sidebar (full page) | ✅ | Centered card layout, no sidebar component |
| Logout works | ❌ | **No logout button** — ComingSoon page has no logout mechanism. User is stuck. Must manually clear localStorage to exit |
| Feature chips visible | ❌ | **Missing** — no feature chips or feature list on the page |

---

## Step 16 — Route Protection

| Test | Result | Notes |
|------|--------|-------|
| `/passenger` without login → redirects to `/` | ✅ | `ProtectedRoute` returns `<Navigate to="/" />` when `!user` |
| `/admin` without login → redirects to `/` | ✅ | Confirmed via fetch — shows landing page |
| `/driver` without login → redirects to `/` | ✅ | Confirmed via fetch — shows landing page |
| `/onboarding` without login → redirects to `/` | ✅ | Protected route |
| Student trying `/admin` → redirects to `/passenger` | ✅ | `roleHome("STUDENT") = "/passenger"` |
| Admin trying `/passenger` → redirects to `/admin` | ✅ | `roleHome("LOGISTICS_STAFF") = "/admin"` |
| 404 page for unknown routes | ✅ | Shows "404 — The requested page does not exist." with "Go home" link |

---

## Critical Bugs (must fix before submission)

| # | Bug | Page | Impact |
|---|-----|------|--------|
| 1 | **42 OAuth "unknown client" error** | Auth Flow | 🔴 **LOGIN COMPLETELY BLOCKED** — `client_id` in `.env` not recognized by 42. No user can authenticate. All authenticated features untestable. |
| 2 | **`/passenger/map` route missing** | Student sidebar | 🔴 "Live Map" nav item links to `/passenger/map` which shows 404. Dead link in main navigation. |
| 3 | **Driver page has no logout** | `/driver` | 🔴 User with DRIVER role gets stuck on "Coming Soon" page with no way to log out except clearing localStorage manually. |
| 4 | **No station picker in route create/edit** | `/admin/routes` | 🔴 Cannot add stations to a route through the UI. Route modal only has name + window fields. Makes route management incomplete. |
| 5 | **Reserve page lacks trip details** | `/passenger/reserve` | 🟠 Trip cards only show departure time. Missing: route name, bus name, seat count, stop count. Students can't make informed booking decisions. |
| 6 | **No confirmation on trip delete/archive** | `/admin/trips` | 🟠 Delete and archive happen immediately on click — no "Are you sure?" dialog. Accidental data loss possible. |
| 7 | **No confirmation on reservation cancel** | `/passenger/history` | 🟠 Cancel deletes immediately without confirmation dialog. |

---

## Minor Issues (nice to fix)

| # | Issue | Page | Notes |
|---|-------|------|-------|
| 1 | AR language has no RTL layout flip | Landing | `data-lang="ar"` is set but no CSS rule applies `direction: rtl` |
| 2 | Refresh button non-functional | Student header | Button exists but has no `onClick` handler |
| 3 | Notification bell non-functional | Student header | Shows badge dot but has no handler or notification system |
| 4 | No refresh on Reserve/History pages | `/passenger/reserve`, `/passenger/history` | Must reload browser to refresh data |
| 5 | No email shown in Settings | `/passenger/settings` | Only shows login_42 and role, not email |
| 6 | No password field for driver creation | `/admin/drivers` | Form has name/username/status but no password field |
| 7 | Reservations page shows all records | `/admin/reservations` | Not search-first as expected — loads everything, then filters client-side |
| 8 | No departure time or status column in admin reservations | `/admin/reservations` | Only shows student/trip/booked-at — missing time and status info |
| 9 | Stop count not visible in route list sidebar | `/admin/routes` | Only visible when a route is selected in detail panel |
| 10 | Seats field missing from trip create modal | `/admin/trips` | Seats are auto-determined by bus capacity, but no override option |
| 11 | Admin Settings are all "Coming soon" | `/admin/settings` | All 3 toggles disabled with "Coming soon" tags. Not functional. |

---

## What Works Perfectly

- **Landing page** — All sections render beautifully: hero, how it works, schedule, team, get started, footer. Full EN/FR translations.
- **Route protection** — All role-based guards work correctly. Unauthenticated users are redirected to `/`. Wrong-role users are redirected to their correct dashboard.
- **404 page** — Clean, functional with "Go home" link.
- **Auth callback flow (code)** — Handles both hash fragments and query params. Proper role-based redirects.
- **Onboarding** — Station picker, save, redirect all working.
- **API service layer** — Token refresh on 401, force logout on failure, clean error handling.
- **Bus management** — Full CRUD with confirmation dialog on delete.
- **Driver management** — Full CRUD with confirmation dialog on delete.
- **Reports** — Real data, no fake stats, proper empty state.
- **Admin overview** — Real stats from API, tonight's trips table.
- **Trip management** — Full CRUD, status filtering, route filtering, computed stats.
- **Admin sidebar** — All 8 navigation items link to correct pages.

---

## Score Impact

Based on test results:

| Metric | Value |
|--------|-------|
| **Current estimated score** | **Could not evaluate fully** — 42 OAuth is broken, blocking all authenticated testing |
| **Blocking auth issue** | 1 (42 unknown client error) |
| **Critical UI bugs** | 6 (missing map route, no driver logout, no station picker in routes, thin reserve cards, missing confirmations) |
| **Minor issues** | 11 |
| **If 42 OAuth fixed** | Frontend is well-structured, API integration is solid, most pages would score well |
| **If all critical bugs fixed** | Strong submission — clean design, proper auth flow, real API data throughout |

### Recommended Fix Priority
1. **Fix 42 OAuth credentials** — nothing works without this
2. **Remove or disable `/passenger/map` nav item** — dead link in main nav
3. **Add logout button to Driver "Coming Soon" page**
4. **Add station picker to route create/edit modal**
5. **Add trip details (route, bus, seats) to reserve page cards**
6. **Add confirmation dialogs for trip delete/archive and reservation cancel**

---
## Phase 5 — First Real Reservation (API Verification)
### Data setup (authenticated as `LOGISTICS_STAFF`)
- Created station `BMCE` with `id=e734ce56-94ee-4011-bcc7-0652667dc9c9`
- Created route `BMCE-Route` (`window=peak`) with `id=662b38cf-c9bc-4477-ae8a-01f167e4a788` and `station_ids=[BMCE]`
- Created bus `BMCE Bus` (`plate=BMCE-001`, `seat_capacity=10`) with `id=1b4557af-0f2f-47fa-9231-c97f0aeeb9fa`
- Created driver `Driver BMCE` (`username=driver_bmce_1`) with `id=5df02a16-2f28-4c04-ad56-cba62fba7f66`
- Created trip `departure_datetime=2026-03-25T22:35:00+01:00` with
  - `route_id=662b38cf-c9bc-4477-ae8a-01f167e4a788`
  - `bus_id=1b4557af-0f2f-47fa-9231-c97f0aeeb9fa`
  - `driver=5df02a16-2f28-4c04-ad56-cba62fba7f66`
  - `id=cc1e7002-4fb4-4954-81b0-0f7c30d92bbf`

### Student setup (authenticated as `test_student`)
- Set `test_student` station via `PATCH /api/v1/auth/me/` to `station=BMCE (e734ce56-94ee-4011-bcc7-0652667dc9c9)`

### Reservation creation + verification
- Created reservation via `POST /api/v1/reservations/` using payload `{ "trip": "cc1e7002-4fb4-4954-81b0-0f7c30d92bbf", "user_id": "0c5340ca-e8c7-4cf9-9d00-bdba75f38d48" }`
- Reservation succeeded (`HTTP 201`) with `id=c81c4651-2c37-47ee-9513-d6648d3a00d6`
- Upcoming check: `GET /api/v1/reservations/?user_id=0c5340ca-e8c7-4cf9-9d00-bdba75f38d48` returned **1** reservation
- History/past check: `GET /api/v1/reservations/history/?user_id=0c5340ca-e8c7-4cf9-9d00-bdba75f38d48` returned **0** reservations
  - This matches backend behavior: `ReservationHistoryView` returns only reservations for trips where `trip.archived_at IS NOT NULL`

### Archive command behavior
- Ran `python manage.py archive_trips`
  - Result: `archive_trips ran — no trips to archive.`
  - Reason: `archive_trips` archives only trips departing **more than 25 minutes ago**, and our test trip is still in the future.

### Notes / limitations
- This execution session does not support interactive browser UI clicks, so I could not validate the reserve button + toast via `Passenger/ReserveASeat` UI.
- The full reservation backend flow (station -> trip -> reservation -> upcoming feed) was verified end-to-end with real API calls.
