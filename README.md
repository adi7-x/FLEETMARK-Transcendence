# 🚌 Fleetmark — Smart Transportation Platform

> **ft_transcendence** · 42 School Final Project
> A full-stack smart transportation management platform for schools, universities, and enterprises.

**Live:** [fleetmark.vercel.app](https://fleetmark.vercel.app/)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript 5.6 · Vite 6.4 · Tailwind CSS v4 |
| Backend | Django 4.2 · Django REST Framework 3.14 · SimpleJWT |
| Auth | JWT (access 1h / refresh 7d) · 42 OAuth 2.0 |
| Database | SQLite (dev) · PostgreSQL (prod) |
| Deployment | Vercel (frontend) · Railway (backend) |

---

## Team

| Name | Role |
|------|------|
| **Adil Bourji** | Frontend Developer |
| **Mohamed Lahrech** | Backend Developer |
| **Abderrahman Chakour** | Backend Developer |
| **Ayoub El Haouti** | Backend + Testing & Debugging |
| **Aamir Tahtah** | DevOps & Security |

---

## Modules

| # | Module | Category | Type | Points | Status |
|---|--------|----------|------|--------|--------|
| 1 | Frontend framework (React 18) | Web | Minor | 1pt | ✅ |
| 2 | Backend framework (Django DRF) | Web | Minor | 1pt | ✅ |
| 3 | Public API (secured, 10+ endpoints) | Web | Major | 2pts | ✅ |
| 4 | Notification system | Web | Minor | 1pt | ✅ |
| 5 | Standard user management | User Mgmt | Major | 2pts | ✅ |
| 6 | OAuth 2.0 (42 Intra) | User Mgmt | Minor | 1pt | 🔄 |
| 7 | Advanced permissions (3 roles) | User Mgmt | Major | 2pts | ✅ |
| 8 | Organization system | User Mgmt | Major | 2pts | ✅ |
| 9 | Advanced analytics dashboard | Data | Major | 2pts | ✅ |
| 10 | Prometheus + Grafana monitoring | DevOps | Major | 2pts | ⏳ |
| 11 | Health check + backups | DevOps | Minor | 1pt | ⏳ |
| 12 | Multi-language (AR + FR + EN) | i18n | Minor | 1pt | ⏳ |
| 13 | RTL support (Arabic) | i18n | Minor | 1pt | ⏳ |
| | **TOTAL** | | | **19pts** | |

**Mandatory: 14pts ✅ · Bonus: 5pts 🎯 · = 125%**

---

## Features

### 🎛️ Admin Dashboard
- Fleet management (buses, routes, schedules)
- User management with role-based access
- Reports & analytics (charts, stats, trends)
- Real-time notifications

### 🚌 Passenger Dashboard
- Seat reservation with auto bus assignment
- Browse routes & schedules (1337 night shuttle stops)
- Reservation history & cancellation
- Student onboarding flow

### 🚗 Driver Dashboard
- Today's assigned trips & routes
- Passenger manifest (who's on the bus)
- Trip lifecycle (start → end)
- Route map with stops

### 🔐 Authentication
- JWT-based login (access + refresh tokens)
- 42 Intra OAuth 2.0
- Role-based route protection (admin/driver/passenger)
- Auto token refresh on expiry

---

## Quick Start

```bash
# Frontend
npm install
npm run dev          # → http://localhost:5173

# Backend
cd backend1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver  # → http://127.0.0.1:8000
```

---

## Project Structure

```
Fleetmark/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # 22 components (landing, admin, passenger, driver, ui)
│   ├── pages/              # 21 pages (admin: 8, passenger: 7, driver: 6)
│   ├── services/           # 7 API service modules
│   ├── context/            # 4 context providers (Auth, Toast, Schedule, Reservation)
│   ├── hooks/              # 4 custom hooks
│   ├── lib/                # Axios client, error mapper
│   └── types/              # TypeScript API types
├── backend1/               # Backend (Django + DRF)
│   ├── accounts/           # User model, JWT, 42 OAuth, permissions
│   ├── buses/              # Bus model, CRUD, freeze guard
│   ├── routes/             # Route model, CRUD
│   ├── trips/              # Trip model, lifecycle state machine
│   ├── reservations/       # Reservation model, capacity checks
│   ├── organization/       # Organization model
│   └── core/               # Domain exceptions, exception handler
├── PROJECT_STATUS.md       # Full project status report
└── MERGE_TEST_REPORT.md    # Integration test results (39/42 pass)
```

---

<sub>Fleetmark · 2026 · 42 School ft_transcendence</sub>
