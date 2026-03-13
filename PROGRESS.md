# Fleetmark — Progress Report

**Date:** 2026-03-12  
**Author:** Adil Bourji (Frontend)

---

## What Was Done Today

### Frontend

| File | What it does |
|------|-------------|
| `src/pages/admin/BusManagement.tsx` | Updated admin bus management page with live API integration |
| `src/pages/admin/Overview.tsx` | Updated admin overview dashboard with real data hooks |
| `src/pages/admin/Routes.tsx` | Updated admin routes page to use live API calls |
| `src/pages/admin/Reports.tsx` | New admin reports page wired to `/api/v1/reports/` endpoint |
| `src/pages/admin/Notifications.tsx` | New admin notifications page — send & view notifications by role |
| `src/pages/passenger/PassengerNotifications.tsx` | Passenger notification inbox with role-filtered view |
| `src/pages/driver/DriverNotifications.tsx` | Driver notification inbox with role-filtered view |
| `src/services/report.service.ts` | New API service for reports (stats, rides per route, weekly ridership) |
| `src/services/notification.service.ts` | New API service for notifications (list + create) |
| `src/hooks/useApi.ts` | Added React Query hooks for reports and notifications |
| `src/config/api.config.ts` | Added feature flags and updated API endpoint config |
| `vite.config.ts` | Updated Vite proxy and dev server configuration |
| `package-lock.json` | Dependency lock file updated |

### Backend

| File | What it does |
|------|-------------|
| `apps/notifications/__init__.py` | New notifications app init |
| `apps/notifications/apps.py` | Django app config for notifications |
| `apps/notifications/models.py` | Notification model — UUID PK, user/role targeting, title, message, status |
| `apps/notifications/serializers.py` | DRF serializer with formatted time output |
| `apps/notifications/views.py` | ListCreate view with role-based filtering (user, role, broadcast) |
| `apps/notifications/urls.py` | URL routing for `/api/v1/notifications/` |
| `apps/notifications/migrations/0001_initial.py` | Initial migration for Notification model |
| `apps/notifications/migrations/__init__.py` | Migrations package init |
| `apps/reports/views.py` | New report overview API — total rides, occupancy, rides per route |
| `apps/reports/urls.py` | URL routing for `/api/v1/reports/` |
| `apps/core/exceptions.py` | Added domain exceptions — CapacityError, LifecycleError, FreezeError |
| `apps/trips/models.py` | Added `status` field + `start()`/`end()` lifecycle methods + structural freeze |
| `apps/trips/views.py` | Added TripStart/TripEnd views + AvailableTrips by station |
| `apps/trips/urls.py` | Added `/start/` and `/end/` action endpoints |
| `apps/trips/migrations/0003_trip_status.py` | Migration for Trip status field |
| `apps/buses/views.py` | Updated bus views |
| `apps/routes/views.py` | Updated route views |
| `apps/reservations/views.py` | Updated reservation views |
| `apps/users/urls.py` | Updated user URL configuration |
| `apps/users/permissions.py` | Added IsLogisticsStaffOrReadOnly, IsDriver, IsStudent permission classes |
| `ssbs/settings.py` | Added `apps.notifications` to INSTALLED_APPS, configured CORS |
| `ssbs/urls.py` | Registered notifications and reports URL routes |
| `requirements.txt` | Updated Python dependencies |
| `seed_test_data.py` | Test data seeder for integration testing |
| `debug_perms.py` | Permission debugging helper (dev only) |

### Docker & Config

| File | What it does |
|------|-------------|
| `docker-compose.yml` | Full compose with PostgreSQL, Django backend, Vite frontend, cron service |
| `backend/Dockerfile` | Django backend container image |
| `backend/entrypoint.sh` | Backend startup script (migrate + runserver) |
| `frontend/Dockerfile` | Vite/React frontend container image |
| `frontend/entrypoint.sh` | Frontend startup script (npm install + dev server) |
| `.env` | Environment variables (DB creds, API keys, OAuth secrets) |
| `.env.example` | Template env file for onboarding |
| `test_integration.sh` | Full integration test suite (42 test cases) |
| `integration_test.sh` | Lightweight integration smoke test |

---

## Current State

### Works Right Now

- **Full frontend SPA** — Landing page, admin dashboard (14 pages), passenger dashboard (7 pages), driver dashboard (7 pages)
- **AuthContext** with 42 OAuth + JWT token management
- **ThemeContext** with light/dark mode and CSS design tokens
- **i18n** — English, French, Arabic translations
- **All service layers** — api.ts, bus, route, trip, reservation, user, organization, report, notification services
- **React Query hooks** for all CRUD operations (useApi.ts)
- **Backend REST API** — Users, Stations, Buses, Routes, Trips, Reservations, Reports, Notifications
- **Trip lifecycle** — create → start → end with business rule validation
- **Notifications system** — role-targeted notifications (admin, driver, passenger, broadcast)
- **Reports API** — total rides, average occupancy, most used route, weekly ridership
- **Permission system** — IsLogisticsStaff, IsStudent, IsDriver, IsLogisticsStaffOrReadOnly, HasAPIKey
- **Docker Compose** — All 4 services (db, backend, frontend, cron) containerized
- **Domain exceptions** — CapacityError, LifecycleError, FreezeError with proper HTTP codes
- **CORS** configured for frontend dev server (localhost:5173, localhost:3000)
- **Frontend ↔ Backend integration** — Student, Admin, and Driver dashboards fully wired to the live API using React Query
- **TypeScript interfaces** — Fully aligned between Frontend types and Backend serializers
- **Local Dev Stack** — Full production stack running via `docker compose up --build -d` with seeded database

### Still Needs Work

- **42 OAuth callback** — Backend needs real 42 API credentials configured and tested end-to-end
- **Reports module** — Weekly ridership data is partially hardcoded (needs real aggregation)
- **Stations API** — No dedicated serializer/viewset for stations CRUD in backend
- **Route stops** — Backend `RouteStation` many-to-many is defined but the stops management API is minimal
- **Schedule management** — Frontend page exists but no backend scheduling logic
- **Driver assignment** — No automated driver-to-trip assignment workflow
- **Reservation cancellation** — Backend endpoint exists but no email/notification on cancel
- **User management** — Admin user CRUD is not fully connected to backend `/api/v1/auth/users/`
- **Test coverage** — No unit tests for frontend; backend integration tests have 3 known failures
- **Production deployment** — No nginx reverse proxy config, no SSL, no CI/CD pipeline
- **Archive cron** — `archive_trips` management command referenced in docker-compose but not verified

---

## File Structure

```
Fleetmark/
├── backend/
│   ├── apps/
│   │   ├── buses/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   ├── core/
│   │   │   ├── exception_handler.py
│   │   │   └── exceptions.py
│   │   ├── drivers/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   ├── notifications/
│   │   │   ├── migrations/
│   │   │   ├── __init__.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── (NEW TODAY)
│   │   ├── reports/
│   │   │   ├── views.py, urls.py
│   │   │   └── (UPDATED TODAY)
│   │   ├── reservations/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   ├── routes/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   ├── stations/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   ├── trips/
│   │   │   ├── migrations/
│   │   │   ├── admin.py, apps.py, models.py
│   │   │   ├── serializers.py, views.py, urls.py
│   │   │   └── tests.py
│   │   └── users/
│   │       ├── migrations/
│   │       ├── admin.py, apps.py, models.py
│   │       ├── serializers.py, views.py, urls.py
│   │       ├── permissions.py
│   │       └── tests.py
│   ├── ssbs/
│   │   ├── __init__.py, asgi.py, wsgi.py
│   │   ├── settings.py, urls.py
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_test_data.py
│   └── debug_perms.py
├── frontend/
│   ├── public/
│   │   ├── favicon.svg, vite.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/      → AdminLayout, Modal, Sidebar, Topbar
│   │   │   ├── driver/     → DriverSidebar, DriverTopbar
│   │   │   ├── layout/     → AdminLayout, ProtectedRoute, StudentLayout
│   │   │   ├── passenger/  → PassengerSidebar, PassengerTopbar, ScheduleStatusBanner, StudentOnboarding
│   │   │   ├── shared/     → LanguageSwitcher, Navbar, StopPicker
│   │   │   ├── ui/         → Badge, ComingSoonFeature, DarkModeToggle, EmptyState, ErrorState,
│   │   │   │                  FleetmarkLogo, FlipCard, SectionDivider, Skeleton, SnakeCard,
│   │   │   │                  Spinner, ThemeToggle, Toggle
│   │   │   ├── AuthSection, Features, Footer, Hero, HowItWorks
│   │   │   ├── LanguageSwitcher, Navbar, ProtectedRoute
│   │   │   ├── Schedule, ScrollArrows, Subscribe, WhoWeAre
│   │   ├── config/         → api.config.ts, index.ts
│   │   ├── context/        → AuthContext, ReservationContext, ScheduleContext, ThemeContext, ToastContext
│   │   ├── data/           → driverMockData, mockData, passengerMockData
│   │   ├── hooks/          → useApi, useDocumentTitle, useHorizontalScroll, useLoadingState,
│   │   │                      useReservations, useSnakeAnimation, useStations, useTrips
│   │   ├── i18n/           → index.ts, translations.ts, locales/ (en, fr, ar)
│   │   ├── lib/            → axios.ts, errorMapper.ts
│   │   ├── pages/
│   │   │   ├── admin/      → AdminLayout, Buses, BusManagement, Drivers, Notifications,
│   │   │   │                  Overview, Reports, Reservations, RouteStops, Routes,
│   │   │   │                  ScheduleManagement, Settings, Students, UserManagement
│   │   │   ├── driver/     → ComingSoon, DriverLayout, DriverNotifications, DriverOverview,
│   │   │   │                  DriverProfile, MyRoute, PassengerList
│   │   │   ├── passenger/  → MyReservations, PassengerLayout, PassengerNotifications,
│   │   │   │                  PassengerOverview, PassengerRoutes, ProfileSettings, ReserveASeat
│   │   │   ├── student/    → History, Onboarding, Overview, Reserve, Settings, StudentLayout
│   │   │   ├── AuthCallback, ComingSoon, Landing, NotFound, Onboarding, RoleSelection
│   │   ├── services/       → api, auth, bus, notification, organization, report,
│   │   │                      reservation, route, trip, user
│   │   ├── styles/         → globals.css, tokens.css
│   │   ├── types/          → api.ts
│   │   ├── App.tsx, index.css, main.tsx, vite-env.d.ts
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── index.html
│   ├── package.json, package-lock.json
│   ├── tsconfig.json, vercel.json, vite.config.ts
├── database/
│   └── db_data/            → PostgreSQL data volume
├── docs/
├── docker-compose.yml
├── Makefile
├── .env, .env.example, .gitignore
├── PROGRESS.md             → (this file)
├── DESIGN_PROMPT.md, FRONTEND_REPORT.md, MERGE_TEST_REPORT.md
├── PROJECT.md, PROJECT_STATUS.md, README.md, REPORT.md
├── integration_test.sh, test_integration.sh, test_system.py
├── stations.json, response.json, debug.txt
└── en.subject.pdf, SSBS_Problem_Description_.docx, SSBS_Technical_Specification.docx
```

---

## Next Steps

1. **Wire frontend pages to live backend API** — Replace remaining mock data calls with real API hooks (useApi.ts) across admin Overview, BusManagement, Routes, Reservations, Students, and Drivers pages
2. **Fix 42 OAuth end-to-end flow** — Configure real 42 API credentials, test the full login → callback → JWT token cycle between frontend AuthContext and backend auth views
3. **Build stations CRUD API** — Backend needs a proper StationViewSet with serializer so the frontend StopPicker and route management pages can fetch real station data
4. **Add nginx reverse proxy** — Create `nginx.conf` to serve the production frontend, proxy `/api/` to Django, and handle SSL termination
5. **Run and fix integration tests** — The test suite (`test_integration.sh`) has 3 known failing cases; fix the permission issues and missing seed data so all 42 tests pass
