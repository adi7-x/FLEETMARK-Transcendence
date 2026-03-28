---

# Fleetmark / SSBS — AI Context File
> Paste this file into any AI chat to get instant help
> with this project. Updated: 2026-03-28

---

## WHAT IS THIS PROJECT

SSBS (Smart School Bus System) is the official night shuttle
reservation platform for 1337 School, Ben Guerir, Morocco.

Built by 5 students as a 42 School project (ft_transcendence rules).

**What it does:**
- Students log in with 42 Intra OAuth
- They pick their home bus stop once
- They reserve a seat on tonight's night shuttle
- Buses run from 21:00 to 06:00

**Scoring target:** 19/19 points (125%)

---

## THE TEAM

| Name | Role | What they built |
|------|------|-----------------|
| Adil Bourji | Frontend | React app, design system, all pages |
| Mohamed Lahrech | Backend | Core API, trips, reservations |
| Abderrahman Chakour | Backend/Auth | 42 OAuth, JWT, permissions |
| Ayoub El Haouti | Backend/QA | Testing (86/86 passing) |
| Aamir Tahtah | DevOps | Docker, WAF, ELK, Prometheus |

---

## TECH STACK

**Frontend:**
- @dnd-kit/core: ^6.3.1
- @dnd-kit/sortable: ^10.0.0
- @dnd-kit/utilities: ^3.2.2
- glob: ^13.0.6
- html2canvas: ^1.4.1
- jspdf: ^4.2.1
- prop-types: ^15.8.1
- react: ^19.2.0
- react-dom: ^19.2.0
- react-router-dom: ^7.13.1
- recharts: ^3.8.1
- vite-plugin-pwa: ^1.2.0
- vite: ^7.3.1

**Backend:**
- Django>=4.2
- djangorestframework>=3.14
- djangorestframework-simplejwt>=5.3
- django-cors-headers>=4.3
- psycopg2-binary>=2.9
- python-dotenv>=1.0
- requests>=2.31
- hvac>=2.1.0

**Infrastructure:**
- Docker Compose with these services: 
  - `db` (PostgreSQL 15)
  - `vault` & `vault-init` (HashiCorp Vault)
  - `backend` (Django)
  - `cron` (Django management commands)
  - `frontend` (Vite / React)
  - `waf` (Nginx + ModSecurity)
  - `elasticsearch` (Elastic Stack)
  - `logstash` (Elastic Stack)
  - `kibana` (Elastic Stack)
  - `elk-setup` (Init script)
- PostgreSQL 15
- HashiCorp Vault (secrets management)
- NGINX + ModSecurity WAF (port 8443)
- ELK Stack: Elasticsearch + Logstash + Kibana

---

## HOW TO RUN
```bash
# Full stack with Docker (recommended)
make up
# Frontend → https://localhost:8443
# Backend API → https://localhost:8443/api/v1/

# Development mode
cd backend && python manage.py runserver   # port 8000
cd frontend && npm run dev                 # port 5174
```

---

## ARCHITECTURE
Browser
↓
[WAF - NGINX + ModSecurity] :8443 HTTPS
├── /api/v1/* → Django Backend :8000
│               ├── PostgreSQL :5433
│               └── HashiCorp Vault (secrets)
└── /* → React Frontend (Vite) :5174

**JWT Auth Flow:**
1. Frontend redirects to 42 Intra OAuth URL
2. 42 redirects to /api/v1/auth/42/callback/?code=
3. Backend creates user + issues JWT access + refresh tokens
4. Frontend stores in localStorage: fleetmark_access · fleetmark_refresh · fleetmark_user
5. Every API request: Authorization: Bearer <token>
6. On 401: auto-refresh using refresh token

---

## USER ROLES

| Role | Value | Home Page | What they can do |
|------|-------|-----------|------------------|
| Student | STUDENT | /passenger | View trips, reserve, cancel, history |
| Admin | LOGISTICS_STAFF | /admin | Manage everything |
| Driver | DRIVER | /driver | Coming soon |

**Important:** A user gets LOGISTICS_STAFF automatically if their
login_42 matches the ADMIN_42_LOGIN env variable.

---

## ALL PAGES

### Public
| Route | File | Description |
|-------|------|-------------|
| / | Landing.jsx | Landing page + 42 OAuth login button |
| /auth/callback | AuthCallback.jsx | Handles OAuth code → JWT → redirect |

### Student (STUDENT role)
| Route | File | Description |
|-------|------|-------------|
| /onboarding | Onboarding.jsx | First login home station wizard |
| /passenger | PassengerOverview.jsx | Dashboard with stats + tonight's trip |
| /passenger/live-map | TripTracker.jsx | Live tracking view (simulated) |
| /passenger/reserve | ReserveASeat.jsx | Browse and book upcoming trips |
| /passenger/history | MyReservations.jsx | Tabbed history of upcoming/past rides |
| /passenger/settings | ProfileSettings.jsx | Update nickname, language, station |
| /passenger/notifications | Notifications.jsx | All/Unread/Urgent system alerts |

### Admin (LOGISTICS_STAFF role)
| Route | File | Description |
|-------|------|-------------|
| /admin | Overview.jsx | High-level metrics + active trips |
| /admin/trips | Trips.jsx | CRUD overlay for night shuttles |
| /admin/buses | BusManagement.jsx | CRUD for the fleet |
| /admin/stations | Stations.jsx | Edit bus stops |
| /admin/routes | Routes.jsx | Path management |
| /admin/drivers | Drivers.jsx | Manage driver accounts |
| /admin/reservations | Reservations.jsx | Search student tickets |
| /admin/reports | Reports.jsx | Ridership charts & reports |
| /admin/announcements | Announcements.jsx | Send urgent/info broadcasts |
| /admin/settings | Settings.jsx | Global configuration |

### Driver (DRIVER role)
| Route | File | Description |
|-------|------|-------------|
| /driver | ComingSoon.jsx | Placeholder for future app |
| /* | NotFound.jsx | 404 handler |

---

## DATABASE MODELS

### User
id            UUID (PK)
login_42      string unique — 42 Intra username
email         string unique
role          STUDENT | LOGISTICS_STAFF | DRIVER
station       FK → Station (nullable) — home stop
is_active     bool
created_at    datetime

### Station
id          UUID (PK)
name        string unique — stop name (e.g. "BMCE")
created_at  datetime

### Bus
id             UUID (PK)
name           string — friendly name
plate          string unique — license plate
seat_capacity  integer — max seats
created_at     datetime

### Driver
id             UUID (PK)
name           string
username       string unique
password       string (hashed, NEVER expose)
status         active | inactive
default_bus    FK → Bus (nullable)
default_routes ManyToMany → Route
created_at     datetime

### Route
id      UUID (PK)
name    string unique
window  peak | consolidated
created_at datetime

### RouteStation (Route → Station mapping)
route    FK → Route
station  FK → Station
order    integer — stop order on the route

### Trip
id                  UUID (PK)
route               FK → Route
bus                 FK → Bus
driver              FK → Driver
departure_datetime  datetime — when bus leaves
archived_at         datetime or null
created_at          datetime
seats_left = seat_capacity - confirmed reservations count

### Reservation
id          UUID (PK)
trip        FK → Trip
student     FK → User
created_at  datetime

---

## FIELD NAMES — NEVER RENAME THESE

These are the exact field names used in the backend.
The frontend must always use these exact names:
station          → user's home stop UUID
station_name     → resolved station name string
plate            → bus license plate
seat_capacity    → max seats on bus
departure_datetime → ISO datetime string
login_42         → 42 Intra username
LOGISTICS_STAFF  → admin role value (not ADMIN, not STAFF)
window           → route type: "peak" or "consolidated"
archived_at      → null = active trip, datetime = archived

---

## ALL API ENDPOINTS

Base URL: https://localhost:8443/api/v1 (in Docker) or http://localhost:8000/api/v1 (local dev)

### Authentication
GET  /auth/42/login/                    → { authorization_url }
GET  /auth/42/callback/?code=           → { access, refresh, user }
POST /auth/token/refresh/               → { access }
GET  /auth/me/                          → User object
PATCH /auth/me/                         → Update { station }
GET  /auth/users/                       → List all users [ADMIN]
PATCH /auth/users/{id}/                 → Update user role [ADMIN]

### Stations
GET    /stations/        → List all stations
POST   /stations/        → Create { name }
GET    /stations/{id}/   → Get one
PUT    /stations/{id}/   → Update { name }
DELETE /stations/{id}/   → Delete

### Buses
GET    /buses/        → List all
POST   /buses/        → Create { name, plate, seat_capacity }
GET    /buses/{id}/   → Get one
PUT    /buses/{id}/   → Update
DELETE /buses/{id}/   → Delete

### Routes
GET    /routes/        → List all (with nested stations)
POST   /routes/        → Create { name, window, station_ids[] }
GET    /routes/{id}/   → Get one
PUT    /routes/{id}/   → Update
DELETE /routes/{id}/   → Delete

### Trips
GET    /trips/                              → List all [ADMIN]
POST   /trips/                              → Create trip [ADMIN]
GET    /trips/{id}/                         → Get one
PUT    /trips/{id}/                         → Update [ADMIN]
DELETE /trips/{id}/                         → Delete [ADMIN]
GET    /trips/available/?station_id={uuid}  → Trips for student

### Reservations
GET    /reservations/?user_id={uuid}        → Active reservations
GET    /reservations/history/?user_id={uuid}→ Past reservations
POST   /reservations/                       → { trip, user_id }
DELETE /reservations/{id}/?user_id={uuid}   → Cancel

### Reports
GET /reports/  → Ridership stats

### Drivers
GET    /drivers/        → List all
POST   /drivers/        → Create { name, username, password, status }
PUT    /drivers/{id}/   → Update
DELETE /drivers/{id}/   → Delete

---

## FRONTEND SERVICES (api.js)

The frontend uses these functions from src/services/api.js.
When asking AI to add a new feature, use these:
```javascript
// Auth
auth.getLoginUrl()                      // GET /auth/42/login/
auth.handleCallback(code)              // GET /auth/42/callback/
auth.getMe()                           // GET /auth/me/
auth.patchMe({ station })              // PATCH /auth/me/

// Stations
stations.list()                        // GET /stations/
stations.create({ name })             // POST /stations/
stations.update(id, { name })         // PUT /stations/{id}/
stations.delete(id)                   // DELETE /stations/{id}/

// Buses
buses.list()                          // GET /buses/
buses.create({ name, plate, seat_capacity })
buses.update(id, data)
buses.delete(id)

// Routes
routes.list()                         // GET /routes/ (with stations)
routes.create({ name, window, station_ids })
routes.update(id, data)
routes.delete(id)

// Trips
trips.list()                          // GET /trips/
trips.available(stationId)            // GET /trips/available/
trips.create(data)                    // POST /trips/
trips.update(id, data)               // PUT /trips/{id}/
trips.delete(id)                      // DELETE /trips/{id}/

// Reservations
reservations.list(userId)             // GET /reservations/
reservations.history(userId)          // GET /reservations/history/
reservations.create(tripId, userId)   // POST /reservations/
reservations.cancel(id, userId)       // DELETE /reservations/{id}/
```

---

## CONTEXT PROVIDERS
```javascript
// AuthContext — user state
const { user, setUser, logout } = useAuth()
// user shape: { id, login_42, email, role, station, station_name }

// ThemeContext — dark/light mode
const { theme, toggleTheme } = useTheme()
// applies data-theme="dark|light" to <html>

// TranslationContext — i18n
const { t, lang, setLang } = useTranslation()
// lang: 'en' | 'fr' | 'ar'
// AR triggers RTL: data-lang="ar" on <html>
```

---

## DESIGN SYSTEM

Fonts: Inter (UI) + JetBrains Mono (times, IDs, numbers)
CSS variables in src/styles/tokens.css:
```css
--bg        /* page background */
--surface   /* card background */
--surface2  /* elevated card */
--ink       /* primary text */
--mid       /* muted text */
--dim       /* disabled/placeholder */
--line      /* borders */
--blue      /* primary accent */
--green     /* success / live */
--red       /* error / cancel */
--amber     /* warning / pending */
--mono      /* JetBrains Mono font */
```

---

## NIGHT SHIFT LOGIC

Trips are only shown to students between 20:00 and 06:00.
Outside this window → empty list (not an error).

Two route types:
  peak         → runs 21:00 to midnight (two buses)
  consolidated → runs 03:00 to 06:00 (one bus, all stops)

Auto-archive: trips are archived 25 min after departure
(cron runs every 60 seconds via ssbs-cron container)

---

## WHAT IS COMPLETE

- Frontend rewritten to React/Vite with fully responsive mobile-first UI
- 42 OAuth login flow and JWT handling completely wired
- Student UI (PassengerOverview, ReserveASeat, MyReservations, ProfileSettings, Notifications)
- Admin UI (Dashboard, Trips, Buses, Routes, Stations, Drivers, Announcements, Reports)
- Full localization (EN/FR/AR) with automatic RTL shift
- Theme engine (Dark/Light mode via CSS tokens)
- Docker-Compose infrastructure with WAF (ModSecurity Nginx), Vault, PostgeSQL, and ELK stack
- DND-kit powered drag-and-drop lists for Station/Route management

---

## WHAT IS INCOMPLETE / KNOWN ISSUES

| Feature | Status | Where |
|---------|--------|-------|
| Driver portal | Coming soon page only | /driver |
| Live map | Route UI exists but tracking is simulated | /passenger/live-map |
| Notifications/Announcements backend | UI uses local storage | /passenger/notifications and /admin/announcements |
| Real End-to-End OAUTH | Requires official 42 API app to test | Frontend Auth callback |

---

## SCORE ESTIMATE

  Core requirements: 14/14 pts
  Bonus points:      5/5 pts
  Total:             19/19 pts (125%)

  Bonus breakdown:
    i18n EN+FR+AR with RTL: ✅
    Docker compose WAF/ELK: ✅
    Prometheus + Grafana:   ✅
    Health check endpoint:  ✅

---

## HOW TO ASK AI FOR HELP

When you paste this file into an AI and ask for help,
use this format:

"I need to [add/fix/change] [what] in [which file].
 The backend endpoint is [endpoint].
 The field names are [fields].
 Do not touch backend/.
 Do not rename any field."

Examples:
  "Add a Stations management page to the admin dashboard.
   Use GET/POST /api/v1/stations/. File: src/pages/admin/Stations.jsx"

  "Fix the refresh button on Trips.jsx.
   It must re-call trips.list() when clicked."

  "Add an announcements section where admin can send
   messages to all students. Check if /api/v1/notifications/
   exists first, use localStorage fallback if not."

---

## ENVIRONMENT VARIABLES
VITE_API_URL=https://localhost:8443/api/v1
Backend (.env at project root)
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=
SECRET_KEY=
INTRA_42_CLIENT_ID=
INTRA_42_CLIENT_SECRET=
INTRA_42_REDIRECT_URI=https://localhost:8443/api/v1/auth/42/callback/
ADMIN_42_LOGIN=    ← the 42 login that gets admin role
FRONTEND_URL=https://localhost:8443

---

## COMMON COMMANDS
```bash
make up              # start everything
make down            # stop everything
make migrate         # run DB migrations
make seed            # seed demo data
make logs            # view all logs

# Manual API tests
curl -k https://localhost:8443/api/v1/auth/42/login/
curl -k https://localhost:8443/api/v1/stations/
curl -k https://localhost:8443/api/v1/buses/
curl -k https://localhost:8443/api/v1/trips/

# Force archive trips manually
docker compose exec backend python manage.py archive_trips

# Create admin superuser
docker compose exec backend python manage.py createsuperuser
```


