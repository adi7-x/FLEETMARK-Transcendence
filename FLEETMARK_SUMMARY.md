# 🚌 Fleetmark — Comprehensive Project Summary
> A full-stack smart transportation management platform for 42 School / 1337.

## 1. Project Concept
**Fleetmark** is an end-to-end web system designed to streamline bus seat reservations, route planning, and fleet administration to solve the problem of overcrowded buses and chaotic scheduling for students and employees.

The platform serves three distinct user roles:
- **Admin / Organizer**: A comprehensive control panel (7 pages) to manage buses, routes, schedules, user permissions, and monitor system analytics.
- **Passenger (Student/Employee)**: A tailored dashboard (6 pages) to browse routes, view schedules, reserve seats through an interactive 3-step wizard with auto bus assignment based on capacity, and view upcoming trips.
- **Driver**: A dedicated interface (5 pages) to view daily schedules, assigned routes, and passenger manifests (currently in development / coming soon).

## 2. Technical Architecture & Stack
- **Frontend**: React 18, TypeScript 5.6, Vite 6.4, Tailwind CSS v4, Framer Motion for animations, Recharts for visual analytics. Custom layouts, micro-animations, code-splitting (`React.lazy`), and responsive design patterns across 24 pages. deployed via Vercel.
- **Backend**: Django 4.2 with Django REST Framework (DRF). Built with distinct apps handling models and APIs: Users (Accounts), Buses, Routes, Trips (with state machines), and Reservations.
- **Authentication**: JWT (Access/Refresh tokens) with an integrated OAuth 2.0 flow via 42 Intra for secure access control across all 3 roles.
- **Database**: SQLite for development, migrating to PostgreSQL for production environments.
- **Deployment**: Vercel for Frontend (SPA routing setup `vercel.json`), with the Backend destined for Railway/Render (managed via Gunicorn and environment variables).

## 3. Current Project State (Overall 70% Complete)
The project is currently tracking towards a **125% bonus score** (19 points) for the `ft_transcendence` module, already securing the mandatory 14 points through its comprehensive web APIs, user management systems, OAuth integrations, and analytics.

**Component Progress:**
- **Frontend (85% Done)**: The landing page, layouts, modular routing, error states, and UI components are fully functional. Authentication flows are built. *Next major milestone: Replacing all 18+ dashboard pages currently running on `mockData.ts` with real DRF API calls using `useApi.ts` services.*
- **Backend (75% Done)**: Core models (User, Bus, Route, Trip, Reservation) and corresponding CRUD API endpoints are implemented. Basic trip lifecycle functionality and JWT handling exist. *Remaining tasks: Building the Notifications, Schedule, and Reports APIs, plus implementing 1337-specific business rules (3 reservations/night limit, 30-min block before departure, home stop to route assignment auto-linking).*
- **Testing & Integration (35-40% Done)**: The automated integration suite (`test_integration.sh`) executes with 39 of 42 API passing end-to-end tests successfully. Few critical bugs remaining (e.g. `LifecycleError` exceptions triggering as `ValueError`).
- **DevOps (20% Done)**: Needs production hardening for the backend: setting up `STATIC_ROOT`, installing `django-cors-headers`, removing hardcoded secrets/DEBUG flags into `.env` vars, migrating to PostgreSQL, setting up Railway services, and adding SSL.

## 4. Immediate Critical Path (How We Proceed)
To reach launch (100% completion), the team's critical path involves sequential unblocking:
1. **Critical Bug Fixes (Testing Team)**: Resolve the `ValueError` exceptions in `backend1/trips/models.py`.
2. **Infrastructure Prep (DevOps/Backend)**: Install `django-cors-headers` and finalize production `settings.py` (CORS policies, `ALLOWED_HOSTS`, `SECRET_KEY`).
3. **Backend Deployment (DevOps)**: Get the DRF backend live on Railway/Render and update Vercel env vars so the live frontend can communicate via HTTPS.
4. **42 OAuth Completion (Frontend/Backend)**: End-to-end testing with production redirect URIs.
5. **API Integration (Frontend)**: Map the Axios API services to the 18 specific dashboard pages (Admin, Passenger, Driver) migrating away from mock structures.
6. **Advanced API/Rules Build (Backend)**: Add Notifications APIs, advanced Analytics aggregation endpoints, and the strict 1337 reservation limit rules.
