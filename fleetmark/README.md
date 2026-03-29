# Fleetmark — Smart School Bus System (SSBS)

> **Night shuttle reservation platform for 1337 School, Ben Guerir, Morocco.**

Fleetmark lets students log in with their 42 Intra credentials, choose a home station, and reserve seats on night-time shuttle buses that run from **21:00 to 06:00** every night.

Built as a [42 School](https://42.fr) `ft_transcendence`-scope project by five 1337 students.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Night Shift Logic](#night-shift-logic)
- [Internationalization (i18n)](#internationalization-i18n)
- [Infrastructure](#infrastructure)
- [The Team](#the-team)
- [License](#license)

---

## Features

### Student Portal
- **42 OAuth SSO** — One-click login using 42 Intra credentials
- **Home station selection** — Onboarding wizard to pick a pickup stop
- **Seat reservation** — Browse tonight's trips and reserve a seat with one tap
- **Live bus tracker** — Simulated real-time bus position on a route map
- **Reservation history** — Tabbed view of upcoming and past rides
- **Notification center** — Urgent, info, and all announcement categories
- **Profile settings** — Update nickname, language, and home station

### Admin Dashboard
- **Fleet overview** — KPI cards for active trips, total seats, and routes
- **Trip management** — Full CRUD with weekly trip generation
- **Bus management** — Register buses with plate and capacity
- **Station management** — Define pickup and drop-off points
- **Route management** — Drag-and-drop station ordering with DND Kit
- **Driver management** — Create and manage driver accounts
- **Reservation search** — Look up any student's booking history
- **Reports & analytics** — Ridership charts using Recharts
- **Announcements** — Broadcast urgent or informational messages
- **Settings** — Global configuration panel

### Cross-Cutting
- **Dark / Light theme** — Toggle via CSS design tokens
- **Full i18n** — English, French, Arabic with automatic RTL layout shift
- **Responsive design** — Mobile-first with bottom navigation for students
- **Error boundaries** — Graceful error recovery throughout the app
- **Privacy & Terms** — Legal compliance pages with footer links

---

## Architecture

```
Browser
  ↓
[WAF — NGINX + ModSecurity] :8443 HTTPS
  ├── /api/v1/* → Django Backend :8000
  │                ├── PostgreSQL :5433
  │                └── HashiCorp Vault (secrets)
  └── /*         → React Frontend (Vite) :5174
```

**JWT Auth Flow:**
1. Frontend redirects to 42 Intra OAuth URL
2. 42 redirects to `/api/v1/auth/42/callback/?code=`
3. Backend validates code, creates/updates user, issues JWT tokens
4. Frontend stores: `fleetmark_access`, `fleetmark_refresh`, `fleetmark_user`
5. All API requests include `Authorization: Bearer <token>`
6. On 401: automatic token refresh using the refresh token

---

## Tech Stack

| Layer          | Technology                                             |
|----------------|--------------------------------------------------------|
| **Frontend**   | React 19, Vite 7, React Router 7                      |
| **Styling**    | Vanilla CSS, CSS custom properties, tokens.css         |
| **Backend**    | Django 4.2+, Django REST Framework, SimpleJWT           |
| **Database**   | PostgreSQL 15                                          |
| **Auth**       | 42 Intra OAuth 2.0 + JWT (access/refresh tokens)      |
| **Drag & Drop**| @dnd-kit/core, @dnd-kit/sortable                       |
| **Charts**     | Recharts 3                                             |
| **PDF Export** | html2canvas + jsPDF                                    |
| **Secrets**    | HashiCorp Vault                                        |
| **WAF**        | NGINX + ModSecurity                                    |
| **Monitoring** | Prometheus + Grafana                                   |
| **Logging**    | ELK Stack (Elasticsearch + Logstash + Kibana)          |
| **Deploy**     | Docker Compose                                         |

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- A registered [42 API application](https://profile.intra.42.fr/oauth/applications) (for OAuth)

### Quick Start (Docker — recommended)

```bash
# Clone and enter the project
git clone <your-repo-url>
cd fleetmark

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your 42 API credentials

# Start all services
make up

# Access the app
# Frontend → https://localhost:8443
# Backend API → https://localhost:8443/api/v1/
```

### Development Mode (no Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # → http://localhost:8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                         # → http://localhost:5174
```

### Useful Commands

```bash
make up              # Start all Docker services
make down            # Stop all services
make migrate         # Run database migrations
make seed            # Seed demo data
make logs            # View all container logs

# Force-archive trips
docker compose exec backend python manage.py archive_trips

# Run backend tests
docker compose exec backend python manage.py test
```

---

## Project Structure

```
fleetmark/
├── backend/                        # Django REST API
│   ├── apps/
│   │   ├── authentication/         # 42 OAuth, JWT, user management
│   │   ├── buses/                  # Bus CRUD
│   │   ├── drivers/                # Driver management
│   │   ├── reports/                # Ridership analytics
│   │   ├── reservations/           # Seat booking logic
│   │   ├── routes/                 # Route + station ordering
│   │   ├── stations/               # Bus stop management
│   │   └── trips/                  # Trip scheduling + auto-archive
│   └── ssbs/                       # Django project settings
├── frontend/                       # React + Vite SPA
│   └── src/
│       ├── components/
│       │   ├── layout/             # StudentLayout, AdminLayout, ProtectedRoute
│       │   ├── shared/             # LanguageSwitcher, etc.
│       │   └── ui/                 # Button, Badge, DataTable, ErrorBoundary…
│       ├── context/                # AuthContext, ThemeContext, TranslationContext
│       ├── hooks/                  # useCountUp, useInView
│       ├── pages/
│       │   ├── admin/              # All admin views
│       │   ├── driver/             # ComingSoon placeholder
│       │   ├── legal/              # PrivacyPolicy, TermsOfService
│       │   ├── passenger/          # Student dashboard + booking pages
│       │   └── student/            # Onboarding wizard
│       ├── services/               # api.js — centralized API client
│       └── styles/                 # tokens.css, globals.css, components.css
├── scripts/                        # Deployment helpers
├── design/                         # Design assets
└── docs/                           # Documentation
```

---

## User Roles

| Role              | Code Value       | Home Page   | Capabilities                                  |
|-------------------|------------------|-------------|-----------------------------------------------|
| **Student**       | `STUDENT`        | `/passenger`| View trips, reserve/cancel, history, settings |
| **Admin**         | `LOGISTICS_STAFF`| `/admin`    | Full CRUD on all resources                    |
| **Driver**        | `DRIVER`         | `/driver`   | Coming soon                                   |

> **Note:** A user automatically receives `LOGISTICS_STAFF` if their `login_42` matches the `ADMIN_42_LOGIN` environment variable.

---

## API Endpoints

Base URL: `https://localhost:8443/api/v1`

| Method | Endpoint                                   | Description                              |
|--------|--------------------------------------------|------------------------------------------|
| GET    | `/auth/42/login/`                          | Get 42 OAuth authorization URL           |
| GET    | `/auth/42/callback/?code=`                 | Exchange code for JWT tokens             |
| POST   | `/auth/token/refresh/`                     | Refresh access token                     |
| GET    | `/auth/me/`                                | Get current user profile                 |
| PATCH  | `/auth/me/`                                | Update user profile (station)            |
| GET    | `/auth/users/`                             | List all users (admin)                   |
| CRUD   | `/stations/`                               | Bus stop management                      |
| CRUD   | `/buses/`                                  | Fleet vehicle management                 |
| CRUD   | `/routes/`                                 | Route management (with nested stations)  |
| CRUD   | `/trips/`                                  | Trip scheduling (admin)                  |
| GET    | `/trips/available/?station_id={uuid}`      | Available trips for student              |
| GET    | `/reservations/?user_id={uuid}`            | Active reservations                      |
| GET    | `/reservations/history/?user_id={uuid}`    | Past reservations                        |
| POST   | `/reservations/`                           | Create reservation                       |
| DELETE | `/reservations/{id}/?user_id={uuid}`       | Cancel reservation                       |
| CRUD   | `/drivers/`                                | Driver management                        |
| GET    | `/reports/`                                | Ridership statistics                     |

---

## Night Shift Logic

- **Operating hours:** 20:00 — 06:00
- **Route windows:**
  - `peak` — 21:00 to midnight (two buses, split routes)
  - `consolidated` — 03:00 to 06:00 (one bus, all stops)
- **Auto-archive:** Trips are automatically archived 25 minutes after departure via a cron container running every 60 seconds
- Outside of operating hours, students see an empty state — not an error

---

## Internationalization (i18n)

Fleetmark supports three languages:

| Language | Code | Direction |
|----------|------|-----------|
| English  | `en` | LTR       |
| French   | `fr` | LTR       |
| Arabic   | `ar` | RTL       |

Translation is managed through `TranslationContext` which provides a `t(key)` function. When Arabic is selected, the `data-lang="ar"` attribute triggers RTL CSS rules across the entire layout.

---

## Infrastructure

### Docker Compose Services

| Service        | Purpose                                      |
|----------------|----------------------------------------------|
| `db`           | PostgreSQL 15 database                       |
| `vault`        | HashiCorp Vault (secrets management)         |
| `vault-init`   | Vault bootstrapping                          |
| `backend`      | Django API server                            |
| `cron`         | Trip auto-archive management commands        |
| `frontend`     | Vite / React dev server                      |
| `waf`          | NGINX + ModSecurity reverse proxy (port 8443)|
| `elasticsearch`| ELK Stack — search engine                    |
| `logstash`     | ELK Stack — log pipeline                     |
| `kibana`       | ELK Stack — visualization                    |
| `elk-setup`    | ELK Stack — initialization                   |

### Environment Variables

```bash
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
SECRET_KEY=
INTRA_42_CLIENT_ID=
INTRA_42_CLIENT_SECRET=
INTRA_42_REDIRECT_URI=https://localhost:8443/api/v1/auth/42/callback/
ADMIN_42_LOGIN=           # login_42 that gets auto-promoted to admin
FRONTEND_URL=https://localhost:8443
VITE_API_URL=https://localhost:8443/api/v1
```

---

## The Team

| Name                   | Role               | Contribution                                |
|------------------------|--------------------|--------------------------------------------|
| **Adil Bourji**        | Frontend Developer | React app, design system, all UI pages     |
| **Mohamed Lahrech**    | Backend Developer  | Core API, trips, reservations              |
| **Abderrahman Chakour**| Backend / Auth     | 42 OAuth, JWT, security, permissions       |
| **Ayoub El Haouti**    | Backend / QA       | Testing framework (86/86 tests passing)    |
| **Aamir Tahtah**       | DevOps             | Docker, WAF, ELK, Prometheus, Grafana      |

---

## License

This project was built as part of the [42 School](https://42.fr) curriculum. All rights reserved by the respective authors.
