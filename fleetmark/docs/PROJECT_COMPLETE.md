---
# Fleetmark — Complete Project Documentation
Last updated: 2026-03-25

## What Is This

Fleetmark is a night shuttle seat reservation platform
for 1337 School, Ben Guerir, Morocco.

Students authenticate with 42 Intra OAuth, select their
home station once, and reserve seats on nightly buses
running from 21:00 to 06:00.

## The Team

| Name | Role | Responsibilities |
|-------|------|-----------------|
| Adil Bourji | Frontend | React, Vite, JSX, Design |
| Mohamed Lahrech | Backend | Django REST, API |
| Abderrahman Chakour | Backend/Auth | 42 OAuth, JWT |
| Ayoub El Haouti | Backend/QA | Testing, 86/86 |
| Aamir Tahtah | DevOps | Docker, Prometheus |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + JSX |
| Backend | Django 4 + Django REST Framework |
| Auth | 42 Intra OAuth2 + JWT (SimpleJWT) |
| Database | PostgreSQL |
| Styling | CSS Variables (Inter + JetBrains Mono) |
| DevOps | Docker Compose + Prometheus + Grafana |
| i18n | English + French + Arabic (RTL) |

## How To Run

### With Docker (recommended)
  docker-compose up --build
  Frontend → http://localhost
  Backend  → http://localhost:8000/api/v1/

### Development mode
  Terminal 1: cd backend && python manage.py runserver
  Terminal 2: cd frontend && npm install && npm run dev
  Frontend  → http://localhost:5174
  Backend   → http://localhost:8000

## User Roles

| Role | Access | Home Page |
|-------|--------|-------------|
| STUDENT | Book seats | /passenger |
| LOGISTICS_STAFF | Manage everything | /admin |
| DRIVER | Coming soon | /driver |

## All Pages

### Public
  / → Landing page with 42 OAuth login
  /auth/callback → OAuth callback handler

### Student (STUDENT role only)
  /onboarding → Pick home station (first login)
  /passenger → Dashboard: tonight's trip
  /passenger/reserve → Browse + reserve trips
  /passenger/history → Past + upcoming reservations
  /passenger/settings → Station + language + logout

### Admin (LOGISTICS_STAFF role only)
  /admin → Overview: stats + tonight's trips
  /admin/trips → Full CRUD trips management
  /admin/buses → Bus management
  /admin/routes → Route management
  /admin/drivers → Driver management
  /admin/reservations → Search reservations
  /admin/reports → Ridership reports
  /admin/settings → Platform settings

### Driver (DRIVER role only)
  /driver → Coming soon page

## API Reference

Base URL: http://localhost:8000/api/v1

### Auth
  GET  /auth/42/login/           → get OAuth URL
  GET  /auth/42/callback/?code=  → exchange code for tokens
  POST /auth/token/refresh/      → refresh access token
  GET  /auth/me/                 → get current user
  PATCH /auth/me/                → update station

### Student Endpoints
  GET  /trips/available/?station_id= → trips for station
  GET  /reservations/?user_id=       → active reservations
  GET  /reservations/history/        → past reservations
  POST /reservations/                → create reservation
  DELETE /reservations/{id}/         → cancel reservation
  GET  /stations/                    → all stations

### Admin Endpoints
  GET/POST/PUT/DELETE /trips/
  GET/POST/PUT/DELETE /buses/
  GET/POST/PUT/DELETE /routes/
  GET/POST/PUT/DELETE /drivers/
  GET /reservations/?user_id=
  GET /reports/

## Critical Field Names (Never Rename)

  station          → user home station UUID
  station_name     → resolved name
  plate            → bus license plate
  seat_capacity    → max seats
  departure_datetime → ISO datetime
  login_42         → 42 Intra username
  LOGISTICS_STAFF  → admin role value
  window           → peak | consolidated

## Environment Variables

  VITE_API_URL=http://localhost:8000/api/v1

## Score Estimate

  Target: 19/19 pts (125%)
  Bonus done: i18n AR (+2) · Prometheus (+2) · Health check (+1)
---

