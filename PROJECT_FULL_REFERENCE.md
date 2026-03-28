# SSBS — Smart School Bus System: Complete Project Reference

> **Purpose of this file:** Give this entire document to any AI assistant so it can answer detailed questions about every part of this project and help you edit, debug, or extend it.

---

## TABLE OF CONTENTS

1. [What This Project Is](#1-what-this-project-is)
2. [Tech Stack](#2-tech-stack)
3. [How to Run It](#3-how-to-run-it)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Models (Backend)](#5-database-models-backend)
6. [Backend API — All Endpoints](#6-backend-api--all-endpoints)
7. [Authentication System (42 OAuth + JWT)](#7-authentication-system-42-oauth--jwt)
8. [Permissions & Roles](#8-permissions--roles)
9. [Frontend — File Structure](#9-frontend--file-structure)
10. [Frontend — Routing & Pages](#10-frontend--routing--pages)
11. [Student (Passenger) Side — Every Page](#11-student-passenger-side--every-page)
12. [Admin (Logistics Staff) Side — Every Page](#12-admin-logistics-staff-side--every-page)
13. [Shared Frontend Components](#13-shared-frontend-components)
14. [Frontend Services Layer (api.js)](#14-frontend-services-layer-apijs)
15. [Context Providers](#15-context-providers)
16. [Auto-Archiving System (Cron)](#16-auto-archiving-system-cron)
17. [Trip Scheduling Logic (Night Shift)](#17-trip-scheduling-logic-night-shift)
18. [Infrastructure & Docker Services](#18-infrastructure--docker-services)
19. [Security: WAF, Vault, JWT](#19-security-waf-vault-jwt)
20. [Known Incomplete / Roadmap Items](#20-known-incomplete--roadmap-items)
21. [Common Tasks Cheatsheet](#21-common-tasks-cheatsheet)

---

## 1. What This Project Is

**SSBS (Smart School Bus System)** is the official night shuttle booking platform for **1337 School** (a 42-network school in Ben Guerir, Morocco).

- Students (1337 school members) sign in with their **42 Intra** account, pick a home bus stop (station), then reserve a seat on tonight's bus.
- Admins (logistics staff) manage the fleet: buses, drivers, routes, trips, and can review all reservations and incident reports.
- The system only shows trips during the **night shift window: 8:00 PM → 6:00 AM**. Outside that window, no trips are shown.
- There are **two route types**:
  - **Peak** routes (21:00 → midnight) — two buses on separate routes.
  - **Consolidated** routes (late night 3:00 AM → 6:00 AM) — one bus covering all stops.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend framework | Django | 4.2 |
| Backend API | Django REST Framework (DRF) | latest |
| Auth tokens | djangorestframework-simplejwt | latest |
| OAuth | 42 Intra OAuth2 | — |
| Database | PostgreSQL | 15 |
| Secrets management | HashiCorp Vault (AppRole) | — |
| Frontend framework | React | 19 |
| Frontend build tool | Vite | 7 |
| Frontend routing | React Router | 7 |
| Drag & drop (route builder) | @dnd-kit | latest |
| Reverse proxy / WAF | NGINX + ModSecurity CRS | — |
| Logging/observability | ELK Stack (Elasticsearch 9.2, Logstash, Kibana) | — |
| Containerization | Docker + Docker Compose | — |
| Language support | English, French, Arabic (UI strings) | — |

---

## 3. How to Run It

### Start Everything (Docker)

```bash
make up          # Start all services (detached)
make up-build    # Rebuild images and start
make down        # Stop everything
make migrate     # Run Django DB migrations
make seed        # Seed demo data
make logs        # Tail all container logs
```

### Access URLs

| What | URL | Notes |
|---|---|---|
| **Frontend (main app)** | http://localhost:5174 | React dev server (Vite) |
| **Full stack via WAF** | https://localhost:8443 | Accept self-signed cert warning |
| **Backend API direct** | http://localhost:8000 | Bypasses WAF |
| **Django Admin panel** | http://localhost:8000/admin | Superuser only |
| **Kibana (logs)** | https://localhost:5601 | ELK stack |

### Running Docker Services

All services are defined in `docker-compose.yml` at the project root. Key containers:

| Container | Purpose |
|---|---|
| `ssbs-backend` | Django app |
| `ssbs-frontend` | Vite dev server (React) |
| `ssbs-db` | PostgreSQL 15 database |
| `ssbs-vault` | HashiCorp Vault |
| `ssbs-waf` | NGINX + ModSecurity WAF (port 8443) |
| `ssbs-cron` | Runs `archive_trips` command every 60 seconds |

---

## 4. Architecture Overview

```
Browser
  │
  ▼
[WAF - NGINX + ModSecurity]  :8443 (HTTPS)
  │
  ├──► /api/v1/*  ──────────► [Django Backend]  :8000
  │                                │
  │                                ├── PostgreSQL DB  :5433
  │                                └── HashiCorp Vault (secrets)
  │
  └──► /*  ─────────────────► [React Frontend (Vite)]  :5174
                                     │
                                     └── Calls /api/v1/* (via WAF or direct)
```

**JWT Auth Flow:**
1. Frontend redirects user to 42 Intra OAuth URL.
2. 42 redirects back to `/api/v1/auth/42/callback/?code=...`.
3. Backend exchanges the code for a 42 access token, fetches the user profile.
4. Backend creates/updates the local `User` record, issues a JWT pair (access + refresh).
5. Frontend stores tokens in `localStorage` under keys `fleetmark_access` and `fleetmark_refresh`.
6. Every API request sends `Authorization: Bearer <access_token>`.
7. On 401, the frontend automatically tries to refresh using the refresh token.

---

## 5. Database Models (Backend)

All models live in `fleetmark/backend/apps/`. All primary keys are **UUIDs**.

### User (`apps/users/models.py`)

```python
class User(AbstractBaseUser, PermissionsMixin):
    id          # UUID (PK)
    login_42    # string, unique — the 42 Intra username (e.g. "astudent")
    email       # string, unique
    role        # choices: 'STUDENT', 'LOGISTICS_STAFF', 'DRIVER'
    station     # FK → Station (null/blank) — the student's home bus stop
    is_active   # bool, default True
    is_staff    # bool, default False (Django admin access)
    created_at  # datetime
```

- Authentication uses `email` as the `USERNAME_FIELD`.
- A user gets `LOGISTICS_STAFF` role automatically if their `login_42` matches the `ADMIN_42_LOGIN` env var.

---

### Station (`apps/stations/models.py`)

```python
class Station(models.Model):
    id          # UUID (PK)
    name        # string, unique — the stop name (e.g. "Ben Guerir Centre")
    created_at  # datetime
```

Stations are bus stops. A student sets one as their **home station**. The trip feed is filtered to only show trips whose route includes that station.

---

### Bus (`apps/buses/models.py`)

```python
class Bus(models.Model):
    id             # UUID (PK)
    name           # string — friendly name (e.g. "Bus Alpha")
    plate          # string, unique — license plate
    seat_capacity  # positive integer — max seats
    created_at     # datetime
```

---

### Driver (`apps/drivers/models.py`)

```python
class Driver(models.Model):
    id             # UUID (PK)
    name           # string
    username       # string, unique
    password       # string (hashed)
    status         # choices: 'active', 'inactive'
    default_bus    # FK → Bus (null/blank) — this driver's usual bus
    default_routes # ManyToMany → Route — this driver's usual routes
    created_at     # datetime
```

Note: Drivers are stored separately from Users. They have their own login system (not yet fully wired in the frontend — the driver portal shows "Coming Soon").

---

### Route (`apps/routes/models.py`)

```python
class Route(models.Model):
    id      # UUID (PK)
    name    # string, unique
    window  # choices: 'peak', 'consolidated'
    created_at

class RouteStation(models.Model):
    route   # FK → Route
    station # FK → Station
    order   # positive integer — the stop order along the route
    # unique_together: (route, order) and (route, station)
```

A Route is an ordered list of Stations. The `window` field tells if this route runs during peak hours or consolidated (late night).

---

### Trip (`apps/trips/models.py`)

```python
class Trip(models.Model):
    id                  # UUID (PK)
    route               # FK → Route
    bus                 # FK → Bus
    driver              # FK → Driver
    departure_datetime  # datetime — when the bus leaves
    archived_at         # datetime or null — set when trip is auto-archived
    created_at          # datetime

    @property
    def seats_left(self):
        return self.bus.seat_capacity - self.reservations.count()
```

- An **active** trip has `archived_at = null`.
- An **archived** trip has `archived_at` set (it happened in the past).
- `seats_left` is computed live; it is never stored in the DB.

---

### Reservation (`apps/reservations/models.py`)

```python
class Reservation(models.Model):
    id         # UUID (PK)
    trip       # FK → Trip (CASCADE delete)
    student    # FK → User (CASCADE delete)
    created_at # datetime
    # unique_together: (trip, student) — one reservation per student per trip
```

---

### IncidentReport (`apps/reports/models.py`)

```python
class IncidentReport(models.Model):
    id          # UUID (PK)
    reporter    # FK → User
    trip        # FK → Trip (nullable) — the trip the incident is about
    category    # choices: 'late', 'no_show', 'full', 'accident', 'other'
    description # text (optional)
    status      # choices: 'pending', 'resolved'
    created_at  # datetime
```

Students submit reports about issues with specific trips. Admins review and resolve them.

---

## 6. Backend API — All Endpoints

Base URL: `http://localhost:8000/api/v1/`

### Auth Endpoints (`/api/v1/auth/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `auth/42/login/` | None | Anyone | Returns the 42 OAuth authorization URL |
| GET | `auth/42/callback/?code=<code>` | None | Anyone | Exchanges code for JWT tokens; creates user if new |
| POST | `auth/token/refresh/` | None | Anyone | Refresh expired access token using refresh token |
| GET | `auth/me/` | JWT | Any user | Get current user's profile |
| PATCH | `auth/me/` | JWT | Any user | Update profile (only `station` field for students) |
| GET | `auth/users/` | JWT | LOGISTICS_STAFF only | List all users |
| GET | `auth/users/<id>/` | JWT | LOGISTICS_STAFF only | Get a specific user |
| PATCH | `auth/users/<id>/` | JWT | LOGISTICS_STAFF only | Edit user role, station, is_active |
| DELETE | `auth/users/<id>/` | JWT | LOGISTICS_STAFF only | Delete a user |

---

### Stations (`/api/v1/stations/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `stations/` | JWT | Any user | List all stations |
| POST | `stations/` | JWT | LOGISTICS_STAFF | Create a station |
| GET | `stations/<id>/` | JWT | Any user | Get a station |
| PUT | `stations/<id>/` | JWT | LOGISTICS_STAFF | Update a station |
| DELETE | `stations/<id>/` | JWT | LOGISTICS_STAFF | Delete a station |

---

### Buses (`/api/v1/buses/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `buses/` | JWT | Any user | List all buses |
| POST | `buses/` | JWT | LOGISTICS_STAFF | Create a bus |
| GET | `buses/<id>/` | JWT | Any user | Get a bus |
| PUT | `buses/<id>/` | JWT | LOGISTICS_STAFF | Update a bus |
| DELETE | `buses/<id>/` | JWT | LOGISTICS_STAFF | Delete a bus |

---

### Drivers (`/api/v1/drivers/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `drivers/` | JWT | LOGISTICS_STAFF | List all drivers |
| POST | `drivers/` | JWT | LOGISTICS_STAFF | Create a driver |
| GET | `drivers/<id>/` | JWT | LOGISTICS_STAFF | Get a driver |
| PUT | `drivers/<id>/` | JWT | LOGISTICS_STAFF | Update a driver |
| DELETE | `drivers/<id>/` | JWT | LOGISTICS_STAFF | Delete a driver |

---

### Routes (`/api/v1/routes/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `routes/` | JWT | Any user | List all routes (with their ordered stations) |
| POST | `routes/` | JWT | LOGISTICS_STAFF | Create a route |
| GET | `routes/<id>/` | JWT | Any user | Get a route |
| PUT | `routes/<id>/` | JWT | LOGISTICS_STAFF | Update a route |
| DELETE | `routes/<id>/` | JWT | LOGISTICS_STAFF | Delete a route |

---

### Trips (`/api/v1/trips/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `trips/` | JWT | LOGISTICS_STAFF | List ALL trips (active + archived) |
| POST | `trips/` | JWT | LOGISTICS_STAFF | Schedule a new trip |
| GET | `trips/<id>/` | JWT | LOGISTICS_STAFF | Get a trip |
| PUT | `trips/<id>/` | JWT | LOGISTICS_STAFF | Edit a trip |
| DELETE | `trips/<id>/` | JWT | LOGISTICS_STAFF | Delete a trip |
| GET | `trips/available/?station_id=<id>` | JWT | Any user | List active trips for tonight that serve the given station, with seats left |

**Important**: `trips/available/` returns an **empty list** if the current time is between 06:00 and 20:00. It only returns data during the night-shift window (20:00–06:00).

---

### Reservations (`/api/v1/reservations/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `reservations/` | JWT | Student → own; Staff → all | List active (non-archived) reservations |
| POST | `reservations/` | JWT | Any | Create a reservation. Body: `{ "trip": "<trip_id>", "user_id": "<user_id>" }` |
| DELETE | `reservations/<id>/` | JWT | Owner or Staff | Cancel a reservation |
| GET | `reservations/history/` | JWT | Student → own; Staff → all | List past (archived trip) reservations |

**Business rules for POST reservations:**
- The trip must not be archived.
- The bus must have `seats_left > 0`.
- A student can only have one reservation per trip (unique constraint).
- Uses `SELECT FOR UPDATE` (database lock) to prevent race conditions on the last seat.

---

### Reports (`/api/v1/reports/`)

| Method | URL | Auth | Who | Description |
|---|---|---|---|---|
| GET | `reports/` | JWT | Student → own; Staff → all | List incident reports |
| POST | `reports/` | JWT | Any | Submit an incident report |
| PATCH | `reports/<id>/` | JWT | LOGISTICS_STAFF | Update status (e.g. mark as resolved) |

---

## 7. Authentication System (42 OAuth + JWT)

### Login Flow (Step by Step)

1. User clicks "Sign in with 42" on the Landing page.
2. Frontend calls `GET /api/v1/auth/42/login/` → gets back the 42 OAuth URL.
3. Browser is redirected to `https://api.intra.42.fr/oauth/authorize?...`.
4. User approves on 42's website.
5. 42 redirects back to `/api/v1/auth/42/callback/?code=<auth_code>`.
6. Backend:
   - Exchanges the code for a 42 access token.
   - Calls `https://api.intra.42.fr/v2/me` to get the user's profile.
   - Checks if `login_42` matches `ADMIN_42_LOGIN` env var → assigns `LOGISTICS_STAFF` role.
   - Creates a local `User` record if they don't exist yet.
   - Issues JWT access token (60 minutes) and refresh token (7 days).
   - Redirects browser to `<FRONTEND_URL>/auth/callback#access=<token>&refresh=<token>&role=<role>&login=<login>`.
7. Frontend `AuthCallback` page reads tokens from the URL hash, stores in `localStorage`.
8. If the user has no station set yet (first login as student), redirect to `/onboarding`.
9. Otherwise, redirect to `/passenger` (student) or `/admin` (logistics staff).

### Token Storage (Frontend)

| Key | Value |
|---|---|
| `fleetmark_access` | JWT access token (60 min lifetime) |
| `fleetmark_refresh` | JWT refresh token (7 day lifetime) |
| `fleetmark_user` | JSON object: `{ id, email, login_42, role, station }` |
| `fleetmark_lang` | UI language: `'en'`, `'fr'`, or `'ar'` |

### Auto-Refresh Logic

When an API call returns `401 Unauthorized`:
1. The `api.js` service tries `POST /api/v1/auth/token/refresh/` with the stored refresh token.
2. If successful, the new access token is stored and the original request is retried.
3. If refresh fails → all tokens are cleared and the user is sent back to `/` (login page).

---

## 8. Permissions & Roles

There are **3 user roles**:

| Role | Access |
|---|---|
| `STUDENT` | Can view trips available for their station, make/cancel reservations, submit reports, update their home station |
| `LOGISTICS_STAFF` | Full admin access: manage buses, drivers, routes, trips, view all reservations and reports, manage users |
| `DRIVER` | Role exists in the model but the driver portal is not yet built (shows "Coming Soon" page) |

### Backend Permission Classes (`apps/users/permissions.py`)

- `IsLogisticsStaff` — only users with `role == 'LOGISTICS_STAFF'`
- `IsStudent` — only users with `role == 'STUDENT'`
- `IsDriver` — only users with `role == 'DRIVER'`
- `HasAPIKey` — internal service calls using `X-API-Key` header (from `SSBS_API_KEY` env var)
- `IsLogisticsStaffOrReadOnly` — anyone can GET; only staff can write

### Frontend Route Guards (`ProtectedRoute.jsx`)

The `<ProtectedRoute role="STUDENT">` or `<ProtectedRoute role="LOGISTICS_STAFF">` wrapper around any route will:
- Redirect unauthenticated users to `/` (landing/login page).
- Redirect users with the wrong role to their appropriate dashboard.

---

## 9. Frontend — File Structure

```
fleetmark/frontend/src/
├── App.jsx                      # Root component, all routes defined here
├── main.jsx                     # React entry point, wraps app in providers
├── context/
│   ├── AuthContext.jsx           # User auth state (user object, logout)
│   ├── ThemeContext.jsx          # Dark/light mode
│   └── TranslationContext.jsx   # i18n: EN / FR / AR translations
├── services/
│   └── api.js                   # All API calls (auth, buses, trips, etc.)
├── pages/
│   ├── Landing.jsx              # Public landing page (before login)
│   ├── AuthCallback.jsx         # Handles 42 OAuth redirect, stores tokens
│   ├── NotFound.jsx             # 404 page
│   ├── student/
│   │   └── Onboarding.jsx       # First-login: pick your home station
│   ├── passenger/               # STUDENT role pages
│   │   ├── PassengerOverview.jsx  # Dashboard: tonight's trip, seat count
│   │   ├── ReserveASeat.jsx       # Browse and book available trips
│   │   ├── MyReservations.jsx     # View/cancel reservations + history
│   │   └── ProfileSettings.jsx    # Change home station, language, logout
│   ├── admin/                   # LOGISTICS_STAFF role pages
│   │   ├── Overview.jsx           # Admin dashboard: KPIs, active trips table
│   │   ├── Trips.jsx              # Schedule/edit/delete/archive trips
│   │   ├── BusManagement.jsx      # CRUD for buses
│   │   ├── Routes.jsx             # Build routes with drag-and-drop stops
│   │   ├── Drivers.jsx            # CRUD for drivers
│   │   ├── Reservations.jsx       # View all reservations (active + history)
│   │   ├── Reports.jsx            # View incident reports, mark resolved
│   │   └── Settings.jsx           # Roadmap / coming-soon items
│   └── driver/
│       └── ComingSoon.jsx         # Placeholder for driver portal
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx        # Sidebar + header for admin pages
│   │   ├── StudentLayout.jsx      # Sidebar + header for student pages
│   │   └── ProtectedRoute.jsx     # Role-based route guard
│   ├── shared/
│   │   ├── LanguageSwitcher.jsx   # EN / FR / AR toggle
│   │   └── StopPicker.jsx         # Dropdown to pick a station
│   └── ui/                      # Reusable UI components
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── DarkModeToggle.jsx
│       ├── DataTable.jsx
│       ├── EmptyState.jsx
│       ├── ErrorBoundary.jsx
│       ├── FleetmarkLogo.jsx
│       ├── FleetmarkLogoAnimation.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── PageHeader.jsx
│       ├── Select.jsx
│       ├── SkeletonCard.jsx       # Loading skeleton for cards
│       ├── SkeletonTable.jsx      # Loading skeleton for tables
│       ├── Spinner.jsx
│       ├── Toggle.jsx
│       └── UserIdentity.jsx
└── styles/
    ├── globals.css               # Global CSS reset + base styles
    ├── tokens.css                # CSS variables (colors, spacing, typography)
    └── components.css            # Shared component styles
```

---

## 10. Frontend — Routing & Pages

All routes are defined in `App.jsx`. Summary:

| URL | Component | Role Required | Description |
|---|---|---|---|
| `/` | `Landing` | None | Public landing page |
| `/auth/callback` | `AuthCallback` | None | OAuth token handler |
| `/onboarding` | `Onboarding` | STUDENT | Pick home station (first login) |
| `/passenger` | `PassengerOverview` | STUDENT | Dashboard |
| `/passenger/live-map` | `PassengerOverview` | STUDENT | (same as overview, live map section) |
| `/passenger/reserve` | `ReserveASeat` | STUDENT | Book a trip |
| `/passenger/history` | `MyReservations` | STUDENT | View/cancel reservations |
| `/passenger/settings` | `ProfileSettings` | STUDENT | Account settings |
| `/admin` | `AdminOverview` | LOGISTICS_STAFF | Admin dashboard |
| `/admin/trips` | `AdminTrips` | LOGISTICS_STAFF | Manage trips |
| `/admin/buses` | `BusManagement` | LOGISTICS_STAFF | Manage buses |
| `/admin/routes` | `AdminRoutesPage` | LOGISTICS_STAFF | Manage routes |
| `/admin/drivers` | `Drivers` | LOGISTICS_STAFF | Manage drivers |
| `/admin/reservations` | `AdminReservations` | LOGISTICS_STAFF | View all reservations |
| `/admin/reports` | `Reports` | LOGISTICS_STAFF | View incident reports |
| `/admin/settings` | `AdminSettings` | LOGISTICS_STAFF | Settings roadmap |
| `*` | `NotFound` | — | 404 page |

---

## 11. Student (Passenger) Side — Every Page

### Landing Page (`/`) — `pages/Landing.jsx`

- **Public** — no login required.
- Shows the app's marketing/info content: hero section, "How it works" steps, schedule overview, team section.
- Has a "Sign in with 42 →" button that calls `GET /api/v1/auth/42/login/` and redirects to 42 OAuth.
- Supports **3 languages** (EN/FR/AR) via a `LanguageSwitcher`.
- Has a `DarkModeToggle`.
- Shows schedule info: Peak (21:00–midnight), Transition (midnight–1AM), Late Night (3AM–6AM).

---

### Auth Callback (`/auth/callback`) — `pages/AuthCallback.jsx`

- Not a visible page — it's a handler.
- Reads `access`, `refresh`, `role`, `login` from the URL hash fragment.
- Stores them in `localStorage`.
- Fetches the full user profile from `GET /api/v1/auth/me/`.
- If student with no station → redirect to `/onboarding`.
- If student with station → redirect to `/passenger`.
- If logistics staff → redirect to `/admin`.

---

### Onboarding (`/onboarding`) — `pages/student/Onboarding.jsx`

- Shown **once** on first login for students who have no home station set.
- Displays a `StopPicker` (dropdown of all stations from the API).
- On save: calls `PATCH /api/v1/auth/me/` with `{ station: "<station_id>" }`.
- Updates `fleetmark_user` in localStorage.
- Redirects to `/passenger`.

---

### Passenger Dashboard (`/passenger`) — `pages/passenger/PassengerOverview.jsx`

**Data loaded:**
- `GET /api/v1/trips/available/?station_id=<user.station>` — tonight's active trips serving user's stop.
- `GET /api/v1/reservations/?user_id=<user.id>` — user's current reservations.
- `GET /api/v1/buses/` — bus info (for seat capacity).

**What it shows:**
- A hero card showing the next trip: route name, departure time, seats left/total, whether the student has reserved.
- Rides this month count.
- A "Reserve a seat" quick link if the student hasn't booked tonight's first trip.
- Listens for `fleetmark:refresh` browser event (fired by the header refresh button) to reload data.

---

### Reserve a Seat (`/passenger/reserve`) — `pages/passenger/ReserveASeat.jsx`

**Data loaded:** Same as Overview (available trips, reservations, buses).

**What it shows:**
- A list of tonight's available trips (filtered to the student's station).
- For each trip: route name, departure time, seats left, whether already reserved.
- "Reserve" button on each trip (disabled if already reserved or no seats left).
- Clicking "Reserve" calls `POST /api/v1/reservations/` with `{ trip, user_id }`.
- Toast notification on success/failure.
- Shows an empty state if no trips are available (outside night-shift window).

---

### My Reservations (`/passenger/history`) — `pages/passenger/MyReservations.jsx`

**Data loaded:**
- `GET /api/v1/reservations/?user_id=<id>` — upcoming (active trip) reservations.
- `GET /api/v1/reservations/history/?user_id=<id>` — past (archived trip) reservations.

**What it shows:**
- Two tabs: **Upcoming** and **Past**.
- Upcoming: each reservation card shows route name, departure time, bus name. A "Cancel" button (with confirmation dialog) calls `DELETE /api/v1/reservations/<id>/`.
- Past: read-only list of past rides.

---

### Profile Settings (`/passenger/settings`) — `pages/passenger/ProfileSettings.jsx`

**What it shows:**
- **Account section**: displays login_42, email, role (read-only).
- **Home station section**: `StopPicker` dropdown to change station; "Save station" button calls `PATCH /api/v1/auth/me/`.
- **Language section**: `LanguageSwitcher` (EN/FR/AR) — saves to `localStorage`.
- **Sign Out** button — clears all localStorage keys and redirects to `/`.

---

### Incident Report Form — `components/StudentReportForm.jsx`

This is a **modal/overlay component** (not a standalone page). It can be triggered from various places.

**Fields:**
- `category`: dropdown — "Bus is Late", "Bus Did Not Show Up", "Bus was Full", "Accident / Breakdown", "Other"
- `description`: optional text area

Calls `POST /api/v1/reports/` with `{ trip: trip.id, category, description }`.

---

## 12. Admin (Logistics Staff) Side — Every Page

### Admin Dashboard (`/admin`) — `pages/admin/Overview.jsx`

**Data loaded:**
- `GET /api/v1/trips/` — all trips.
- `GET /api/v1/buses/` — all buses.
- `GET /api/v1/routes/` — all routes.

**What it shows:**
- **3 KPI cards**: Total active trips, total reservations across active trips, number of routes.
- **Active trips table**: columns — Route, Bus, Departure, Seats Left (color-coded: green/amber/red), Status.
- Listens for `fleetmark:refresh` event.

---

### Trip Management (`/admin/trips`) — `pages/admin/Trips.jsx`

**Data loaded:** trips, routes, buses, drivers.

**Features:**
- **Filter bar**: by status (all / active / archived) and by route.
- **Trip table**: shows route, bus, driver, departure datetime, seats left, status (active/archived).
- **Create trip** button (also triggerable from the header's "New Trip" button): opens a modal form with fields — Route (dropdown), Bus (dropdown), Driver (dropdown), Departure datetime.
- **Edit trip**: click edit icon → same modal pre-filled.
- **Archive trip**: marks `archived_at` on the trip.
- **Delete trip**: permanent delete (with confirmation dialog).
- The "New Trip" button in the admin header dispatches `fleetmark:new-trip` custom event — if already on `/admin/trips`, opens the form directly; otherwise navigates there with `state: { openTripForm: true }`.

---

### Bus Management (`/admin/buses`) — `pages/admin/BusManagement.jsx`

**Features:**
- Table of all buses: name, plate, seat capacity.
- Create/edit bus form (modal): name, plate, seat_capacity.
- Delete bus (with confirmation).

---

### Routes (`/admin/routes`) — `pages/admin/Routes.jsx`

**Features:**
- List of all routes with their stop names listed in order.
- Create/edit route form:
  - Route name.
  - Window type: `peak` or `consolidated`.
  - **Drag-and-drop station order** (using `@dnd-kit`): add stations from a list, drag to reorder.
- Delete route.

---

### Drivers (`/admin/drivers`) — `pages/admin/Drivers.jsx`

**Features:**
- Table of all drivers: name, username, status (active/inactive), default bus.
- Create/edit driver form: name, username, password, status, default_bus, default_routes.
- Delete driver.

---

### Reservations (`/admin/reservations`) — `pages/admin/Reservations.jsx`

**Features:**
- Two tabs: **Active** and **History**.
- Active: all reservations for non-archived trips (from all students).
- History: all reservations for archived (past) trips.
- Table columns: student email/login, route, departure time, bus.
- Admin can cancel (delete) any reservation.

---

### Reports (`/admin/reports`) — `pages/admin/Reports.jsx`

**Data loaded:** `GET /api/v1/reports/` — all incident reports.

**What it shows:**
- **3 KPI cards**: Total reports, Pending, Resolved.
- **Category breakdown**: bar chart showing count per category (late, no_show, full, accident, other).
- **Reports table**: reporter, category, description, trip info, status, date.
- Admin can change status: click "Resolve" button → `PATCH /api/v1/reports/<id>/` with `{ status: "resolved" }`.

---

### Admin Settings (`/admin/settings`) — `pages/admin/Settings.jsx`

This page shows **planned features** that are **not yet implemented**:

- Trip notifications (push notifications when trip status changes).
- Student self-service station changes (let students update home stop without admin).
- Maintenance mode banner.

These are shown as a transparent roadmap — no functional controls yet.

---

### User Management — `components/UserManager.jsx`

A component (used inside the admin area) for:
- Listing all users.
- Changing a user's role or station.
- Deactivating/activating users.
- Deleting users.

---

## 13. Shared Frontend Components

### Layout Components

**`AdminLayout.jsx`** — The shell for all admin pages:
- Left sidebar with navigation links: Dashboard, Trips, Buses, Routes, Drivers, History, Reports, Settings.
- Top header with: page title, "New Trip" button, refresh button, user identity, language switcher, dark mode toggle, logout.

**`StudentLayout.jsx`** — The shell for all student pages:
- Left sidebar with navigation: Dashboard, Reserve Seat, My Reservations, Settings.
- Top header with: page title, refresh button, user identity, logout.

**`ProtectedRoute.jsx`** — Wraps routes that require authentication:
- If no user in localStorage → redirect to `/`.
- If user has wrong role → redirect to their dashboard (`/passenger` for students, `/admin` for staff).

---

### Shared Components

**`StopPicker.jsx`** — A station selection dropdown:
- Calls `GET /api/v1/stations/` on mount.
- Shows a `<select>` with all station names.
- Used in Onboarding and ProfileSettings.

**`LanguageSwitcher.jsx`** — A toggle between EN / FR / AR:
- Saves selection to `localStorage` under `fleetmark_lang`.
- Sets `data-lang` attribute on `<html>` element so CSS can apply RTL styles for Arabic.

---

### UI Components

| Component | Description |
|---|---|
| `Badge` | Colored label (status chip) |
| `Button` | Styled button (variants: primary, secondary, danger) |
| `Card` | Bordered container card |
| `DarkModeToggle` | Sun/moon toggle, reads/writes `ThemeContext` |
| `DataTable` | Generic sortable table with column definitions |
| `EmptyState` | Icon + title + subtitle for empty/error states |
| `ErrorBoundary` | React error boundary to catch render errors |
| `FleetmarkLogo` | Static logo SVG |
| `FleetmarkLogoAnimation` | Animated logo (used on landing page) |
| `Input` | Styled text input |
| `Modal` | Full-screen overlay modal with close button |
| `PageHeader` | Section title + optional subtitle + action slot |
| `Select` | Styled `<select>` element |
| `SkeletonCard` | Animated loading placeholder for cards |
| `SkeletonTable` | Animated loading placeholder for tables |
| `Spinner` | Centered loading spinner with optional text |
| `Toggle` | Boolean on/off toggle switch |
| `UserIdentity` | Shows user's 42 login + role chip |

---

## 14. Frontend Services Layer (api.js)

File: `fleetmark/frontend/src/services/api.js`

**Base URL:** `VITE_API_URL` env var (default: `http://localhost:8000/api/v1`). Set to `https://localhost:8443/api/v1` when running through the WAF.

**Key exports:**

```js
auth.getLoginUrl()            // GET auth/42/login/
auth.handleCallback(code)     // GET auth/42/callback/?code=...
auth.getProfile()             // GET auth/me/
auth.updateProfile(data)      // PATCH auth/me/
auth.getUsers()               // GET auth/users/

stations.list()               // GET stations/
stations.create(data)         // POST stations/
stations.update(id, data)     // PUT stations/<id>/
stations.delete(id)           // DELETE stations/<id>/

buses.list()                  // GET buses/
buses.create(data)            // POST buses/
buses.update(id, data)        // PUT buses/<id>/
buses.delete(id)              // DELETE buses/<id>/

drivers.list()                // GET drivers/
drivers.create(data)          // POST drivers/
drivers.update(id, data)      // PUT drivers/<id>/
drivers.delete(id)            // DELETE drivers/<id>/

trips.list()                  // GET trips/
trips.available(stationId)    // GET trips/available/?station_id=...
trips.create(data)            // POST trips/
trips.update(id, data)        // PUT trips/<id>/
trips.delete(id)              // DELETE trips/<id>/

reservations.list(userId)     // GET reservations/
reservations.history(userId)  // GET reservations/history/
reservations.create(data)     // POST reservations/
reservations.delete(id)       // DELETE reservations/<id>/

routes.list()                 // GET routes/
routes.get(id)                // GET routes/<id>/
routes.create(data)           // POST routes/
routes.update(id, data)       // PUT routes/<id>/
routes.delete(id)             // DELETE routes/<id>/

reports.list()                // GET reports/
reports.create(data)          // POST reports/
reports.update(id, data)      // PATCH reports/<id>/

users.list()                  // GET auth/users/
users.get(id)                 // GET auth/users/<id>/
users.update(id, data)        // PATCH auth/users/<id>/
users.delete(id)              // DELETE auth/users/<id>/

getUser()                     // Returns parsed user object from localStorage
isAuthenticated()             // Returns true if access token exists
```

**Auto-refresh behavior:** Any 401 response triggers a token refresh attempt. If refresh fails, the user is forced to log out.

---

## 15. Context Providers

### `AuthContext` (`context/AuthContext.jsx`)

Provides: `user` (object or null), `setUser(nextUser)`, `logout()`.

`user` object shape: `{ id, email, login_42, role, station, is_active, created_at }`.

Persisted in `localStorage['fleetmark_user']`.

---

### `ThemeContext` (`context/ThemeContext.jsx`)

Provides: `theme` (`'light'` or `'dark'`), `toggleTheme()`.

Applies `data-theme="dark"` or `data-theme="light"` to `<html>`. CSS variables in `tokens.css` respond to this.

---

### `TranslationContext` (`context/TranslationContext.jsx`)

Provides: `t` (object of translated strings), `lang` (`'en'`/`'fr'`/`'ar'`), `setLang(lang)`.

Current translation keys:
```
navDashboard, navTrips, navBuses, navRoutes, navDrivers,
navHistory, navReports, navSettings, navLiveMap, navBookings,
navReserve, navLogout, navNewTrip, navNewBooking
```

For Arabic (`ar`), the UI should be RTL. This is handled by setting `data-lang="ar"` on `<html>`.

---

## 16. Auto-Archiving System (Cron)

File: `fleetmark/backend/apps/trips/management/commands/archive_trips.py`

The `ssbs-cron` Docker container runs this command **every 60 seconds**:

```bash
python manage.py archive_trips
```

**Logic:**
- Finds all trips where:
  - `departure_datetime` is more than **25 minutes in the past**.
  - `archived_at` is null (not yet archived).
  - Has **at least 1 reservation** (empty trips are not archived).
- Sets `archived_at = now()` on all matching trips.

**Effect on the system:**
- Archived trips no longer appear in `trips/available/` (student view).
- Archived trips move to "history" in reservations.
- Admins can still see them in the trips list (filtered as "archived").

---

## 17. Trip Scheduling Logic (Night Shift)

The `AvailableTripListView` (`GET /api/v1/trips/available/`) enforces the **night shift window**.

### Time Rules (timezone: `Africa/Casablanca`)

1. **Outside 8PM–6AM window:** If current time is between 06:00 and 20:00, returns an empty list immediately.
2. **Finding the logical shift:** The "shift date" is tricky for trips after midnight — a trip at 2:00 AM on Friday still belongs to Thursday's night shift.
   - If the trip's departure is before 06:00, `logical_start_date = trip_date - 1 day`.
   - Otherwise, `logical_start_date = trip_date`.
3. **Shift window:** `20:00 on logical_start_date` to `06:00 on logical_start_date + 1 day`.
4. Returns only trips within this window, for the given station, with seats remaining.

---

## 18. Infrastructure & Docker Services

All defined in `docker-compose.yml` (project root).

### Services Summary

| Service | Image | Port (host) | Key Config |
|---|---|---|---|
| `db` | postgres:15 | 5433 | DB data in named volume |
| `vault` | hashicorp/vault | (internal only) | AppRole auth, `fleetmark/` secret path |
| `vault-init` | (runs once) | — | Initializes Vault with secrets from .env |
| `backend` | ./fleetmark/backend | 8000 | Django, Gunicorn; reads secrets from Vault |
| `cron` | ./fleetmark/backend | (none) | Runs `archive_trips` every 60s in a loop |
| `frontend` | ./fleetmark/frontend | 5174 | Vite dev server |
| `waf` | ./waf | 8443 | NGINX + ModSecurity CRS, SSL termination |
| `elk-setup` | elasticsearch:9.2.3 | — | Sets up certs, users, Kibana config |
| `elasticsearch` | elasticsearch:9.2.3 | 9200 | Full-text search engine for logs |
| `logstash` | logstash:9.2.3 | 5044, 5001, 9600 | Log pipeline |
| `kibana` | kibana:9.2.3 | 5601 | Log visualization |

### Environment Variables (`.env` file at project root)

Key variables needed:
```
# Database
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

# Django
SECRET_KEY=
DEBUG=True
ALLOWED_HOSTS=*

# 42 OAuth
INTRA_42_CLIENT_ID=
INTRA_42_CLIENT_SECRET=
INTRA_42_REDIRECT_URI=http://localhost:8000/api/v1/auth/42/callback/
ADMIN_42_LOGIN=        # The 42 login that gets LOGISTICS_STAFF role
FRONTEND_URL=http://localhost:5174

# Vault
VAULT_ADDR=http://vault:8200
VAULT_ROLE_ID=
VAULT_SECRET_ID=

# ELK
ELASTIC_PASSWORD=
KIBANA_PASSWORD=
```

---

## 19. Security: WAF, Vault, JWT

### WAF (Web Application Firewall)

- **NGINX** + **ModSecurity** with **OWASP CRS (Core Rule Set)** v3.
- Configured at `waf/conf/`.
- **Paranoia level 2** — hardened ruleset.
- Anomaly scoring: inbound threshold 5, outbound threshold 4.
- All traffic enters on port **8443** (HTTPS). The WAF proxies to frontend and backend.
- Custom rules in `waf/conf/custom-rules.conf`.
- SSL certificates in `waf/ssl/`.

### HashiCorp Vault

- Backend reads secrets (DB password, Django secret key, 42 OAuth credentials) from Vault at startup.
- Uses **AppRole** authentication (`VAULT_ROLE_ID` + `VAULT_SECRET_ID`).
- Falls back to environment variables if Vault is unreachable.
- Vault code: `fleetmark/backend/ssbs/vault.py`.
- Policy: `vault/policies/ssbs-backend.hcl`.

### JWT Tokens

- Access token lifetime: **60 minutes**.
- Refresh token lifetime: **7 days**.
- Auth header format: `Authorization: Bearer <token>`.
- Backend uses `djangorestframework-simplejwt`.
- API rate limits: anonymous 100/hour, authenticated users 1000/hour.

---

## 20. Known Incomplete / Roadmap Items

| Feature | Current State | Where |
|---|---|---|
| Driver portal | "Coming Soon" page | `/pages/driver/ComingSoon.jsx` |
| Trip notifications | Listed in Settings roadmap, not built | `/admin/settings` |
| Student self-service station change (without admin) | Partially exists (ProfileSettings has it), but settings roadmap lists it as upcoming | — |
| Maintenance mode | Roadmap only | `/admin/settings` |
| Live map | Route exists (`/passenger/live-map`) but renders the same as Overview | `App.jsx` |
| Real-time seat updates | No WebSocket; students must click refresh manually | — |
| Report form in student UI | `StudentReportForm` component exists but not visibly linked from student pages | `components/StudentReportForm.jsx` |
| Kibana/ELK | The ELK stack runs but may require manual setup via `setup.sh` | `elk/` directory |

---

## 21. Common Tasks Cheatsheet

### Add a new station
1. Admin → Stations (there is no dedicated page yet — use the Django admin `http://localhost:8000/admin` or call the API directly).
2. `POST /api/v1/stations/` with `{ "name": "New Stop Name" }` and `Authorization: Bearer <admin_token>`.

### Schedule a new trip
1. Admin → Trips → "New Trip" button.
2. Select Route, Bus, Driver, Departure datetime.
3. Saves via `POST /api/v1/trips/`.

### Create a superuser (first-time setup)
```bash
docker compose exec backend python manage.py createsuperuser
```

### Run migrations
```bash
make migrate
# or:
docker compose exec backend python manage.py migrate
```

### Seed demo data
```bash
make seed
# or:
docker compose exec backend python manage.py seed_data
```

### View backend logs
```bash
make logs
# or:
docker compose logs -f backend
```

### Check WAF logs
```bash
docker compose logs waf
```

### Access Django Admin
URL: `http://localhost:8000/admin/`
Create superuser first (see above).

### Force-archive a trip manually
```bash
docker compose exec backend python manage.py archive_trips
```

### Add a new admin user
- Set their 42 login as `ADMIN_42_LOGIN` in `.env`, or
- Log in as any admin and use `PATCH /api/v1/auth/users/<id>/` with `{ "role": "LOGISTICS_STAFF" }`.

---

*This document was auto-generated on 2026-03-27 from the live codebase at `/home/adiLien/Desktop/fleet`. Paste it into any AI chat to ask questions or request edits about any part of the project.*
