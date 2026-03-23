# Fleetmark Frontend Audit Report

**Date:** 2026-03-23  
**Auditor:** Senior Frontend Engineer (joining mid-project)

---

## PART 2 — ANSWERS

---

### ABOUT THE PROJECT

**Q1. What does this app do?**

Fleetmark is a night shuttle seat reservation platform for 1337 School (Ben Guerir, Morocco). Students authenticate via 42 Intra OAuth, pick their home station, and reserve seats on nightly shuttle buses running 21:00–06:00; staff manage buses, routes, trips, drivers, and view reports through an admin dashboard.

**Q2. What are the 3 user roles and what can each one do?**

| Role | Dashboard | Capabilities |
|------|-----------|-------------|
| `STUDENT` | `/passenger/*` | Pick home station, browse available trips, reserve/cancel seats, view history, change settings |
| `LOGISTICS_STAFF` | `/admin/*` | CRUD trips, view buses/routes/drivers, search reservations, view reports, toggle admin settings |
| `DRIVER` | `/driver` | Coming soon — placeholder page only |

**Q3. What is the API base URL?**

- **Dev:** `http://localhost:8000/api/v1`
- **Docker:** `http://backend:8000/api/v1` (but `VITE_API_URL` env in docker-compose says `http://localhost:8000/api` — **missing `/v1`** suffix)

---

### ABOUT THE SUBJECT

**Q4. What does en.subject.pdf require?**

> [!WARNING]
> [en.subject.pdf](file:///home/phoenix/Desktop/aaaa/en.subject.pdf) is a binary PDF that cannot be read by the tooling. **I cannot list specific requirements or point values.** The project documentation ([FRONTEND_REBUILD.md](file:///home/phoenix/Desktop/aaaa/FRONTEND_REBUILD.md)) provides an informal score estimate, but the actual subject grading criteria are unverifiable from this audit.

**Q5–Q6. Which subject requirements are met / missing?**

Without the PDF, I can only assess based on what [FRONTEND_REBUILD.md](file:///home/phoenix/Desktop/aaaa/FRONTEND_REBUILD.md) lists as covered:

| Requirement (inferred) | Status |
|------------------------|--------|
| React SPA with routing + role-gated areas | ✅ Met |
| 42 OAuth login + callback | ✅ Met |
| JWT token storage | ✅ Met |
| Student: onboarding, reserve, history, settings | ✅ Met |
| Staff: trips/buses/routes/drivers/reservations/reports | ⚠️ Partial — read-only for buses, routes, drivers |
| i18n (EN/FR/AR + RTL) | ⚠️ Landing page only; dashboard pages are English-only |
| Design parity with new-frontend | ⚠️ Partial — see Q14–Q16 |
| No mock data | ⚠️ Partially false — see Q10 |

---

### ABOUT THE FRONTEND CODE

**Q7. Does `npm run build` succeed?**

✅ **Yes.**

```
> vite build
✓ 71 modules transformed.
dist/index.html                   0.65 kB │ gzip:  0.42 kB
dist/assets/index-enuXKHa9.css    2.77 kB │ gzip:  1.15 kB
dist/assets/index-BVpX6Anh.js   317.62 kB │ gzip: 92.10 kB
✓ built in 1.02s
```

**Q8. Are there any TypeScript or JSX errors?**

✅ No — the project uses pure JSX (no TypeScript). Vite builds successfully.

**Q9. Does every route render without a white screen?**

- `/` — ✅ renders [Landing.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/Landing.jsx) (public, no auth required)
- `/passenger` — ⚠️ **Protected**. Without a logged-in user, [ProtectedRoute](file:///home/phoenix/Desktop/aaaa/src/components/layout/ProtectedRoute.jsx#9-22) calls `window.location.replace("/")` causing an immediate redirect. With a valid `fleetmark_user` in localStorage, it should render.
- `/admin` — ⚠️ Same as above. Requires `LOGISTICS_STAFF` role.
- `/driver` — ⚠️ Same. Requires `DRIVER` role.

> [!NOTE]
> All protected routes will redirect to `/` if no user is in localStorage. This is correct behavior, not a white-screen bug. However, [ProtectedRoute](file:///home/phoenix/Desktop/aaaa/src/components/layout/ProtectedRoute.jsx#9-22) uses `window.location.replace()` instead of React Router's `<Navigate>`, which causes full page reloads.

**Q10. Is there any mock/fake data still in `src/`?**

`grep -r "mockData|fake|dummy" src/` returns **no matches**.

However, **there IS hardcoded fake data that doesn't match those patterns:**

| File | Line(s) | Fake data |
|------|---------|-----------|
| [Trips.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Trips.jsx#L312-L328) | 312–328 | `"Live Fleet Utilization" → "84.2%"`, `"System Uptime" → "99.99"` are hardcoded constants, not from API |
| [PassengerOverview.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/PassengerOverview.jsx#L99) | 99 | `"Downtown Express"` as fallback route name |
| [PassengerOverview.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/PassengerOverview.jsx#L139) | 139 | `"APOLLO-9"` as fallback bus name |
| [PassengerOverview.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/PassengerOverview.jsx#L145) | 145 | `"04"` as fallback stops count |
| [PassengerOverview.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/PassengerOverview.jsx#L178) | 178 | `"ZONE-B4"` as hardcoded zone label (not from API) |
| [Settings.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Settings.jsx) | all | Toggle flags are local state only — never persisted to any API |

**Q11. Does the login button on Landing.jsx call the real API?**

✅ **Yes.** The [login()](file:///home/phoenix/Desktop/aaaa/src/pages/Landing.jsx#234-244) function (line 234) calls `auth.getLoginUrl()` which hits `GET /api/v1/auth/42/login/`. On success it redirects to the `authorization_url` returned by the backend.

**Q12. Does AuthCallback.jsx redirect correctly by role?**

✅ **Yes.** The [redirectByRole()](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx#6-30) function (lines 6–29) handles:

| Role | Redirect |
|------|----------|
| `LOGISTICS_STAFF` | `/admin` ✅ |
| `DRIVER` | `/driver` ✅ |
| `STUDENT` (no `station`) | `/onboarding` ✅ |
| `STUDENT` (with `station`) | `/passenger` ✅ |

**Q13. Do all API calls use the correct field names?**

| Field | Required | Used in code? |
|-------|----------|--------------|
| `station` | ✅ | ✅ [Onboarding.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/student/Onboarding.jsx), [ProfileSettings.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/ProfileSettings.jsx) send `{ station: selectedStation }` |
| `plate` | ✅ | ✅ [BusManagement.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/BusManagement.jsx) displays `bus.plate`, [Trips.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Trips.jsx) form shows `bus.plate` |
| `seat_capacity` | ✅ | ✅ [BusManagement.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/BusManagement.jsx) displays `bus.seat_capacity`, [Overview.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Overview.jsx) sums `bus.seat_capacity` |
| `departure_datetime` | ✅ | ✅ Used throughout trips and reservations |
| `login_42` | ✅ | ✅ [AuthCallback.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx), [ProfileSettings.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/passenger/ProfileSettings.jsx), [Reservations.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Reservations.jsx) |
| `LOGISTICS_STAFF` | ✅ | ✅ [ProtectedRoute.jsx](file:///home/phoenix/Desktop/aaaa/src/components/layout/ProtectedRoute.jsx), [AuthCallback.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx), [App.jsx](file:///home/phoenix/Desktop/aaaa/src/App.jsx) |
| `window: peak\|consolidated` | ✅ | ✅ [Routes.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Routes.jsx) displays `selected?.window` |

✅ **No field names have been renamed.**

---

### ABOUT THE DESIGN

**Q14. Does Landing.jsx match [stitch-export.html](file:///home/phoenix/Desktop/aaaa/new-frontend/stitch-export.html)?**

| Section | Design (stitch-export.html) | React (Landing.jsx) | Difference |
|---------|---------------------------|---------------------|------------|
| Hero badge | `"42 ACTIVE NODES"` (blue/primary) | `"Now accepting reservations · 1337 School"` (green) | Different copy + color |
| Hero headline | Same | Same ✅ | |
| Hero subtext | Sci-fi themed ("Surgical precision for the high-stakes commute…") | Practical ("The official booking platform for 1337 School students…") | Different copy (intentional) |
| Hero buttons | "Book Now" / "View Logs" | "Sign in with 42 →" / "How it works →" | Different labels (functional improvement) |
| Hero stats | Not present in design | ✅ Added (400+ Students, 2 Routes, etc.) | Added element (acceptable) |
| How It Works titles | "The Neural Link." / "Initialize Protocol" etc. | "Three steps. One guaranteed seat." / "Sign in with 42 Intra" etc. | Copy differs (intentional) |
| How It Works right panel | Has stock image (`src="https://lh3..."`), `SYSTEM_READY_V2.0.4` badge | No image, `FLEETMARK · 1337` badge with gradient placeholder | **Missing stock image** |
| Schedule labels | "Peak Phase" / "Transition" / "Deep Orbit" with icons (bolt/update/dark_mode) | "PEAK HOURS" / "TRANSITION" / "LATE NIGHT" without icons | **Missing card icons**, different labels |
| Schedule times | 20:00–23:30 / 23:30–02:00 / 02:00–05:00 | 21:00–Midnight / 12:00 AM–1:00 AM / 3:00 AM–6:00 AM | **Times differ** |
| Schedule card hover | Has hover color change | No hover effect | **Missing hover state** |
| Team section | "Command Center" / "The Architects." with stock portrait photos, hover reveal animation | "THE TEAM" / "Built by 1337 students" with gradient overlays, no photos | **No team photos, different treatment** |
| Get Started section | "Establish Connection." with email input + "Continue" + "or" divider + Passkey button | "Your seat is waiting." with `42` icon card + direct "Sign in" button | **Fundamentally different layout** — design has form fields, React has simple card |
| Footer | "Nocturnal Logistics Systems." / "© 2024 FLEETMARK CORP." | "Night shuttle reservation · 1337 School Morocco" / "© 2026" | Copy differs |

**Q15. Does PassengerOverview.jsx match [student-dashboard](file:///home/phoenix/Desktop/aaaa/new-frontend/student-dashboard)?**

| Element | Design | React | Difference |
|---------|--------|-------|------------|
| Hero card layout | 8/4 grid cols, map image with bus icon | 2fr/1fr grid, empty gradient box | **Map image missing** |
| Hero "Reserve Now" button | Primary blue fill | Blue or green depending on state ✅ | Acceptable |
| Stat cards | "My Stop" shows station name + zone; "This Month" has "+12% vs last" trend; "Total Rides" has count + LIFETIME | Matches layout ✅ | "ZONE-B4" is hardcoded, not from API |
| Activity rows | Has bus icon+square (40×40), route name, date with bus code | No icon square, simpler layout | **Missing bus icon element** |
| Activity row 3 | "Auto-Refill: Monthly Pass" with $45.00 | Not present (no payment system) | Acceptable — payment not in scope |
| FAB button | Floating "+" button at bottom-right | Not present | **Missing FAB** |
| Student sidebar | Same nav items, "New Booking" CTA | ✅ Matches | |
| User avatar | User photo in top bar | Empty circle placeholder | **Missing user avatar** |

**Q16. Does AdminLayout + Trips.jsx match [admin-pages](file:///home/phoenix/Desktop/aaaa/new-frontend/admin-pages)?**

| Element | Design | React | Difference |
|---------|--------|-------|------------|
| Sidebar nav items | Dashboard, Trips, Buses, Routes, Drivers, History, Settings | ✅ Same | |
| Sidebar logout | Bottom-pinned, row with text + icon | ✅ Matches (`marginTop: auto`) | |
| Top bar | Fixed, `bg-black`, `left-[220px]` | ✅ Matches | |
| Sub-header | "System Registry" + "Active Transit Shuttles" | ✅ Matches | |
| Filter bar | All/Scheduled/Full/Completed + Route dropdown | All/Scheduled/Full/Near Full + Route dropdown | **"Completed" in design → "Near Full" in React** |
| Table columns | Departure, Countdown, Route, Bus/Driver, Capacity, Status, Actions | Departure, Route, Capacity, Status, Actions | **Missing "Countdown" column, missing "Bus/Driver" column** |
| Table actions | Edit/Archive/Delete (icons appear on hover) | Edit/Archive/Delete (always visible) | **Missing hover-reveal behavior** |
| Bottom stats | 4 cards (Fleet Util 84.2%, Pending 1,204, Driver Avail 18, Uptime 99.99) | 4 cards with same labels but values computed differently | **"84.2%" and "99.99" are hardcoded** |
| Admin Reports | No nav item for "Reports" in sidebar | [Reports](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Reports.jsx#6-80) nav item is **missing from AdminLayout sidebar** | **Reports page unreachable from nav** |

---

### ABOUT THE BACKEND CONTRACT

**Q17. Does api.js call the correct endpoints?**

| api.js function | Endpoint called | Backend URL | Match? |
|----------------|----------------|-------------|--------|
| `auth.getLoginUrl()` | `auth/42/login/` | `api/v1/auth/42/login/` | ✅ |
| `auth.getProfile()` | `auth/me/` | `api/v1/auth/me/` | ✅ |
| `auth.updateProfile()` | `PATCH auth/me/` | `api/v1/auth/me/` | ✅ |
| `auth.getUsers()` | `auth/users/` | `api/v1/auth/users/` | ✅ |
| `stations.list()` | `stations/` | `api/v1/stations/` | ✅ |
| `buses.list/create/update/delete` | `buses/`, `buses/{id}/` | `api/v1/buses/` | ✅ |
| `drivers.list/create/update/delete` | `drivers/`, `drivers/{id}/` | `api/v1/drivers/` | ✅ |
| `trips.list/create/update/delete` | `trips/`, `trips/{id}/` | `api/v1/trips/` | ✅ |
| `trips.available()` | `trips/available/?station_id=` | `api/v1/trips/available/` | ✅ |
| `reservations.list()` | `reservations/?user_id=` | `api/v1/reservations/` | ✅ |
| `reservations.history()` | `reservations/history/?user_id=` | `api/v1/reservations/history/` | ✅ |
| `reservations.create()` | `POST reservations/` | `api/v1/reservations/` | ✅ |
| `reservations.delete()` | `DELETE reservations/{id}/` | `api/v1/reservations/<uuid:pk>/` | ✅ |
| `routes.list/create/get/update/delete` | `routes/`, `routes/{id}/` | `api/v1/routes/` | ✅ |
| `reports.list/create/update` | `reports/`, `reports/{id}/` | `api/v1/reports/` (DRF ViewSet) | ✅ |
| `users.list/get/update/delete` | `auth/users/`, `auth/users/{id}/` | `api/v1/auth/users/`, `auth/users/<uuid>/` | ✅ |

> [!IMPORTANT]
> **Missing from api.js:** `auth/token/refresh/` endpoint exists in backend but there is no token refresh logic anywhere in the frontend. If the access token expires (typically 5–15 min with SimpleJWT), the user will be silently logged out.

> [!WARNING]
> **`auth/42/callback/` is NOT in api.js** — [AuthCallback.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx) calls it directly via `fetch()` (line 71). This is functional but inconsistent with the pattern of using [api.js](file:///home/phoenix/Desktop/aaaa/src/services/api.js) for all API calls.

---

## PART 3 — PRIORITIZED TASK LIST

---

### CRITICAL — Breaks the app or fails subject

**TASK 01 — Add JWT token refresh logic**
- Priority: CRITICAL
- Reason: Without token refresh, authenticated sessions expire silently (typically 5–15 min). Every API call after expiry returns 401 and the app breaks with no user feedback.
- File: [src/services/api.js](file:///home/phoenix/Desktop/aaaa/src/services/api.js)
- What: Add token refresh interceptor using `/api/v1/auth/token/refresh/` when a request gets 401.

**TASK 02 — Docker frontend path mismatch**
- Priority: CRITICAL
- Reason: [docker-compose.yml](file:///home/phoenix/Desktop/aaaa/docker-compose.yml) references `build: ./frontend` and `./frontend:/app`, but the frontend source is at the project root (`./src/`, [./package.json](file:///home/phoenix/Desktop/aaaa/package.json)). Docker build will fail.
- File: [docker-compose.yml](file:///home/phoenix/Desktop/aaaa/docker-compose.yml) (READ ONLY) + project structure
- What: Either move frontend source into a `frontend/` directory with its own [package.json](file:///home/phoenix/Desktop/aaaa/package.json), or update docker-compose paths. **Note:** docker-compose is marked as untouchable, so the frontend files likely need to be restructured.

**TASK 03 — `VITE_API_URL` in Docker is missing `/v1`**
- Priority: CRITICAL
- Reason: [docker-compose.yml](file:///home/phoenix/Desktop/aaaa/docker-compose.yml) line 89 sets `VITE_API_URL=http://localhost:8000/api` — missing the `/v1` path segment. All API calls would 404 in Docker deployment.
- File: [docker-compose.yml](file:///home/phoenix/Desktop/aaaa/docker-compose.yml) (READ ONLY — need to coordinate with DevOps)
- What: Value should be `http://localhost:8000/api/v1`. Since docker-compose is untouchable, coordinate with team to fix.

---

### HIGH — Wrong behavior or missing feature

**TASK 04 — Remove hardcoded fake stats from Trips.jsx**
- Priority: HIGH
- Reason: "Live Fleet Utilization: 84.2%", "System Uptime: 99.99" are hardcoded lies. "Pending Reservations" is computed as `trips.length * 3` (fabricated multiplier). This will fail code review and subject evaluation.
- File: [src/pages/admin/Trips.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Trips.jsx) (lines 312–328)
- What: Either compute real stats from API data, or remove the section entirely.

**TASK 05 — Admin sidebar missing "Reports" nav item**
- Priority: HIGH
- Reason: The Reports page exists at `/admin/reports` and is routed in [App.jsx](file:///home/phoenix/Desktop/aaaa/src/App.jsx), but there is no way to navigate to it from the admin sidebar. The page is unreachable.
- File: [src/components/layout/AdminLayout.jsx](file:///home/phoenix/Desktop/aaaa/src/components/layout/AdminLayout.jsx) (line 3–11)
- What: Add `{ id: "reports", label: "Reports", path: "/admin/reports", icon: "analytics" }` to `navItems`.

**TASK 06 — Admin pages (Buses, Drivers, Routes) are read-only — no CRUD**
- Priority: HIGH
- Reason: [api.js](file:///home/phoenix/Desktop/aaaa/src/services/api.js) defines `create/update/delete` for buses, drivers, and routes, but the page components only render lists. Staff cannot create or manage these entities from the UI.
- Files: [src/pages/admin/BusManagement.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/BusManagement.jsx), [src/pages/admin/Drivers.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Drivers.jsx), [src/pages/admin/Routes.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Routes.jsx)
- What: Add create/edit/delete modals and action buttons (similar to [Trips.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Trips.jsx) pattern).

**TASK 07 — Settings page toggles not persisted**
- Priority: HIGH
- Reason: [Settings.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Settings.jsx) toggles (notifications, self-service, maintenance) use local React state only. Changes are lost on page reload. No API call is made.
- File: [src/pages/admin/Settings.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/admin/Settings.jsx)
- What: Either wire toggles to a settings API endpoint (if backend supports it), or clearly mark them as "coming soon".

**TASK 08 — No light theme CSS tokens**
- Priority: HIGH
- Reason: [tokens.css](file:///home/phoenix/Desktop/aaaa/src/styles/tokens.css) has `[data-theme="dark"]` that is identical to `:root`. There are no light-mode color values. [ThemeContext.jsx](file:///home/phoenix/Desktop/aaaa/src/context/ThemeContext.jsx) supports toggling, but switching to light mode would show white text on white backgrounds.
- File: [src/styles/tokens.css](file:///home/phoenix/Desktop/aaaa/src/styles/tokens.css)
- What: Either add proper light theme tokens, or remove the theme toggle to avoid a broken UX.

**TASK 09 — [ProtectedRoute](file:///home/phoenix/Desktop/aaaa/src/components/layout/ProtectedRoute.jsx#9-22) uses `window.location.replace` instead of `<Navigate>`**
- Priority: HIGH
- Reason: Causes full page reloads on every protected route check (bypasses React Router). This breaks SPA navigation and causes unnecessary re-mounts of the entire app tree.
- File: [src/components/layout/ProtectedRoute.jsx](file:///home/phoenix/Desktop/aaaa/src/components/layout/ProtectedRoute.jsx)
- What: Replace `window.location.replace()` with `<Navigate to={...} replace />` from react-router-dom.

**TASK 10 — i18n only on Landing page**
- Priority: HIGH
- Reason: Dashboard pages, admin pages, and all inner pages have English-only hardcoded strings. FR/AR translations exist only in [Landing.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/Landing.jsx) copy object.
- Files: All pages under `src/pages/passenger/`, `src/pages/admin/`
- What: Either implement a proper i18n system (e.g., react-intl or a context-based dictionary) for all pages, or document this as a known limitation.

---

### MEDIUM — Visual or UX issues

**TASK 11 — Student dashboard missing map/image in hero card**
- Priority: MEDIUM
- Reason: Design shows a map image in the right panel of the hero card. React shows an empty gradient box.
- File: `src/pages/passenger/PassengerOverview.jsx` (lines 151–154)
- What: Add a map placeholder or static image.

**TASK 12 — Schedule section times don't match design**
- Priority: MEDIUM
- Reason: Design says 20:00–23:30 / 23:30–02:00 / 02:00–05:00. React says 21:00–Midnight / 12:00 AM–1:00 AM / 3:00 AM–6:00 AM. Neither may match the actual backend schedule.
- File: `src/pages/Landing.jsx` (lines 48–72)
- What: Confirm correct operational hours with backend team and update.

**TASK 13 — Schedule cards missing icons**
- Priority: MEDIUM
- Reason: Design has Material icons (`bolt`, `update`, `dark_mode`) in each schedule card header. React has no icons.
- File: `src/pages/Landing.jsx` (schedule block rendering)
- What: Add icon field to `schedBlocks` data and render `<span className="material-symbols-outlined">`.

**TASK 14 — Admin Trips table missing Countdown and Bus/Driver columns**
- Priority: MEDIUM
- Reason: Design shows 7 columns (Departure, Countdown, Route, Bus/Driver, Capacity, Status, Actions). React shows only 5 columns (no Countdown, no Bus/Driver).
- File: `src/pages/admin/Trips.jsx`
- What: Add Countdown column (computed from `departure_datetime`) and Bus/Driver column.

**TASK 15 — Activity rows missing bus icon squares**
- Priority: MEDIUM
- Reason: Design shows 40×40 icon squares with bus/payment icons in activity list. React uses text-only rows.
- File: `src/pages/passenger/PassengerOverview.jsx` (lines 203–220)
- What: Add icon element to each activity row.

**TASK 16 — Table action buttons missing hover-reveal behavior**
- Priority: MEDIUM
- Reason: Design shows action buttons only on row hover. React shows them always.
- File: `src/pages/admin/Trips.jsx` (line 290)
- What: Add CSS hover visibility toggle (opacity 0 → 1 on row hover).

**TASK 17 — "Pending Reservations" stat in Trips.jsx is fabricated**
- Priority: MEDIUM
- Reason: Computed as `trips.length * 3` — a completely made-up multiplier. Should use actual reservation count from API.
- File: `src/pages/admin/Trips.jsx` (line 314)
- What: Fetch real reservation count or remove.

**TASK 18 — PassengerOverview fallbacks show design mockup values**
- Priority: MEDIUM
- Reason: Fallback values like "Downtown Express", "APOLLO-9", "04" are from the design mockup and will appear when there's no trip data. They could confuse users.
- File: `src/pages/passenger/PassengerOverview.jsx`
- What: Replace with neutral fallbacks like "—" or "No trip".

---

### LOW — Minor improvements

**TASK 19 — StudentLayout nav has duplicate path for "Live Map" and "Bookings"**
- Priority: LOW
- Reason: Both "Live Map" and "Bookings" nav items point to `/passenger/reserve`. Only one should go there.
- File: `src/components/layout/StudentLayout.jsx` (lines 5–6)
- What: Either differentiate the paths or remove one of the duplicate items.

**TASK 20 — Missing user avatar in top bar**
- Priority: LOW
- Reason: Design shows user profile photo. React shows empty circle placeholder.
- Files: `src/components/layout/StudentLayout.jsx`, `AdminLayout.jsx`
- What: Display user's 42 avatar if available from auth, or initials.

**TASK 21 — Missing floating action button (FAB) on student dashboard**
- Priority: LOW
- Reason: Design has a "+" FAB at bottom-right. React doesn't have it.
- File: `src/pages/passenger/PassengerOverview.jsx`
- What: Add a FAB that navigates to `/passenger/reserve`.

**TASK 22 — `AuthCallback.jsx` doesn't use `api.js` for OAuth callback**
- Priority: LOW
- Reason: Line 71 uses raw `fetch()` instead of the `apiCall` wrapper. Inconsistent with the rest of the codebase.
- File: `src/pages/AuthCallback.jsx`
- What: Add `auth.handleCallback(code)` to `api.js` and use it.

**TASK 23 — Several pages duplicate `API_BASE` + `getUser()` utility functions**
- Priority: LOW
- Reason: `PassengerOverview.jsx`, `ReserveASeat.jsx`, `MyReservations.jsx`, `ProfileSettings.jsx` all define their own `API_BASE` and `getUser()`. Should use shared utilities.
- Files: Multiple passenger pages
- What: Reuse `api.js`'s `apiCall` and `AuthContext`'s `useAuth()` instead of manual fetch.

**TASK 24 — No error boundary or global error handling**
- Priority: LOW
- Reason: If any component throws, the entire app white-screens. No React error boundary wrapper.
- File: `src/App.jsx` or new `src/components/ErrorBoundary.jsx`
- What: Add a React ErrorBoundary component wrapping the app.

**TASK 25 — No responsive/mobile layout**
- Priority: LOW
- Reason: Sidebars are fixed 220px, grids use fixed columns. On mobile screens, content is clipped or overlaps. Design also didn't show mobile, so this may be acceptable.
- Files: `StudentLayout.jsx`, `AdminLayout.jsx`, all page components
- What: Add responsive breakpoints and a mobile sidebar toggle.
