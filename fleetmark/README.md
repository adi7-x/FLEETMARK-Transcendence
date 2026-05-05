*This project has been created as part of the 42 curriculum by aabourji, mlahrech, atahtah, achakour, aelhaouti.*

# Fleetmark — Smart School Bus System (SSBS)

> **Night shuttle reservation platform for 1337 School, Ben Guerir, Morocco.**

Fleetmark lets students log in with their 42 Intra credentials, choose a home station, and reserve seats on night-time shuttle buses that run from **21:00 to 06:00** every night.

Built as a [42 School](https://42.fr) `ft_transcendence`-scope project by five 1337 students.

---

## Description

Fleetmark is a full-stack web application that digitizes shuttle bus management for 1337 School. Students can authenticate via 42 Intra OAuth, select their departure station, browse active trips, and reserve seats — with the platform enforcing real-time capacity constraints. Logistics staff have a full administration portal to manage routes, buses, drivers, trips, and announcements. The system runs 24/7 in Docker, secured behind a ModSecurity WAF, with secrets managed by HashiCorp Vault and all events indexed into an ELK stack.

**Key features:**
- 42 OAuth 2.0 single sign-on with TOTP two-factor authentication
- Seat reservation with overbooking prevention
- Admin portal: fleet, routes (drag-and-drop ordering), drivers, trips, analytics charts
- Announcement system with priority levels (info / warning / urgent)
- Multi-language UI: English, French, Arabic (full RTL layout)
- GDPR self-service: data export and account deletion
- Privacy Policy and Terms of Service pages

---

## 1. Team Members & Roles

| Name | Role | Core Responsibility |
|------|------|--------------------|
| **Adil Bourji** (`aabourji`) | Product Owner / Frontend Lead | Product vision, React SPA architecture, custom design system, UX/UI |
| **Mohamed Lahrech** (`mlahrech`) | Tech Lead / Backend | System architecture, API design, reservation & trip logic (Django) |
| **Aamir Tahtah** (`atahtah`) | Project Manager / DevOps | Docker infrastructure, ELK logging, WAF, CI/CD |
| **Abderrahman Chakour** (`achakour`) | Backend Developer | 42 OAuth, JWT auth, permissions, HashiCorp Vault |
| **Ayoub El Haouti** (`aelhaouti`) | QA Engineer / Backend | Automated tests (86/86 passing), API reliability, endpoints |

---

## 2. Project Management

- **Task distribution**: work divided into sprints tracked via GitHub Issues and a shared Notion board.
- **Meetings**: weekly sync every Monday to review progress and plan the next sprint.
- **Communication**: Discord server with dedicated channels (#backend, #frontend, #devops, #reviews).
- **Code reviews**: all PRs required at least one teammate approval before merging.

---

## 3. Technical Stack

### Frontend
- **React 19 & Vite 7**: component-based SPA with extremely fast HMR and build times.
- **Vanilla CSS with custom properties**: full design token system (color palette, typography, spacing); no heavy UI library dependency. Complete light/dark mode via CSS variables.
- **dnd-kit**: drag-and-drop route station sequencing in the admin portal.
- **Recharts**: BarChart and PieChart for analytics in the admin dashboard.

### Backend
- **Django 4.2+ & Django REST Framework (DRF)**: secure ORM-driven framework with class-based views, serializers, and permission classes for the complex relational model.
- **SimpleJWT**: stateless, standard-compliant JWT access/refresh token authentication.
- **pyotp + qrcode**: TOTP-based two-factor authentication (setup / verify / disable).
- **drf-spectacular**: OpenAPI 3.0 schema generation and interactive API documentation.

### Infrastructure & Security
- **PostgreSQL 15**: ACID-compliant relational database for reservation integrity.
- **Docker Compose**: 11-container orchestration with health checks and dependency ordering, single-command deployment (`make up`).
- **HashiCorp Vault**: AppRole-based secrets management — no hardcoded credentials anywhere.
- **ModSecurity + NGINX (WAF)**: CRS ruleset protecting against SQLi, XSS, and DDoS.
- **ELK Stack**: Logstash pipeline → Elasticsearch indexing → Kibana dashboards for centralized log analytics.

---

## 4. Database Schema

| Table | Key Fields |
|-------|-----------|
| **Users** | `id`, `login_42`, `email`, `role` (STUDENT/LOGISTICS_STAFF/DRIVER), `station_id` FK, `is_active`, `totp_secret`, `totp_enabled` |
| **Stations** | `id`, `name`, `created_at` |
| **Buses** | `id`, `name`, `plate`, `seat_capacity` |
| **Drivers** | `id`, `name`, `username`, `password` (hashed), `status`, `default_bus_id` FK |
| **Routes** | `id`, `name`, `window` (peak/consolidated) |
| **RouteStations** | Join table — `route_id` FK, `station_id` FK, `order` INT |
| **Trips** | `id`, `route_id` FK, `bus_id` FK, `driver_id` FK, `departure_datetime`, `archived_at` |
| **Reservations** | `id`, `trip_id` FK, `student_id` FK, `created_at` |
| **Announcements** | `id`, `title`, `message`, `priority` (info/warning/urgent) |
| **IncidentReports** | `id`, `reporter_id` FK, `trip_id` FK, `category`, `status`, `description` |

---

## 5. Features List

| Feature | Owner | Description |
|---------|-------|-------------|
| 42 OAuth login | Abderrahman Chakour | Full OAuth 2.0 handshake with 42 Intra; JWT tokens issued on callback |
| TOTP 2FA | Abderrahman Chakour | pyotp TOTP setup (QR code), verify gate on login, disable flow |
| User profile & station selection | Mohamed Lahrech | Profile edit, home station picker, reservation history |
| GDPR self-service | Adil Bourji | Export personal data (JSON) and account deletion with confirm dialog |
| Trip browsing & seat reservation | Mohamed Lahrech | Real-time capacity check; atomic reservation to prevent overbooking |
| Automatic trip archiving | Mohamed Lahrech | Cron job archives past trips nightly |
| Admin: fleet management | Adil Bourji | CRUD for buses and drivers |
| Admin: route builder | Adil Bourji | Drag-and-drop station ordering via dnd-kit |
| Admin: trip generation | Adil Bourji | Assign bus + driver to route with datetime picker |
| Admin: analytics dashboard | Adil Bourji | Recharts BarChart (seat occupancy) + PieChart (reservations by route) |
| Announcement system | Mohamed Lahrech | Post/dismiss announcements with priority levels; bell badge for unread |
| Incident reports | Ayoub El Haouti | Passengers file reports; admin reviews and resolves |
| Multi-language UI (EN/FR/AR) | Adil Bourji | Custom i18n context; full Arabic RTL layout via CSS `[data-lang]` |
| HashiCorp Vault secrets | Abderrahman Chakour | AppRole auth; Django reads DB credentials from Vault at startup |
| WAF / ModSecurity | Aamir Tahtah | NGINX reverse proxy with CRS ruleset; custom rules for API paths |
| ELK logging pipeline | Aamir Tahtah | Logstash reads NGINX & Django logs, ships to Elasticsearch; Kibana UI |
| OpenAPI / Public API | Ayoub El Haouti | drf-spectacular docs; X-API-Key authentication; full CRUD endpoints |
| Automated test suite | Ayoub El Haouti | 86 passing tests across all apps (buses, trips, reservations, users…) |

---

## 6. Modules — Points Calculation

**Subject scoring: Major module = 2 pts · Minor module = 1 pt · Minimum required = 14 pts**

> Note: "Support Multiple Devices" (responsive) and "SSL/HTTPS" are **mandatory technical requirements** in the subject, not scorable modules. WAF + Vault is **one combined Major** per subject §IV.5.

| # | Module Name | Category | Type | Pts | Implementation | Owner |
|---|-------------|----------|------|-----|----------------|-------|
| 1 | **Use a Framework as both frontend AND backend** | Web | **Major** | **2** | React 19 (Vite SPA) + Django 4.2 / DRF | Adil + Mohamed |
| 2 | **Use an ORM for the database** | Web | Minor | 1 | Django ORM with PostgreSQL 15; full model coverage verified via automated test suite (86/86) | Mohamed + Ayoub |
| 3 | **Public API** (API key + rate-limit + OpenAPI docs + 5 endpoints) | Web | **Major** | **2** | drf-spectacular, `X-API-Key` header auth, GET/POST/PUT/DELETE/PATCH routes | Ayoub |
| 4 | **Notification / Announcement System** | Web | Minor | 1 | Priority announcements (info/warning/urgent), dismiss tracking, bell badge | Mohamed |
| 5 | **Custom Design System** | Web | Minor | 1 | 20+ reusable components (Button, Card, Modal, Badge, Input, Select, DataTable, Spinner, EmptyState, PageHeader…) + full CSS token system | Adil |
| 6 | **Multiple Language Support** (EN / FR / AR) | Accessibility | Minor | 1 | Custom `TranslationContext` i18n with 3 complete translations; language switcher in all layouts | Adil |
| 7 | **RTL Language Support** (Arabic) | Accessibility | Minor | 1 | Full layout mirroring via `[data-lang="ar"]` CSS; sidebar flip, input alignment, seamless LTR↔RTL | Adil |
| 8 | **Standard User Management** | Users | **Major** | **2** | Profile edit, role system (STUDENT / LOGISTICS_STAFF / DRIVER), station config, role-based views; all user flows covered by automated tests | Mohamed + Abderrahman + Ayoub |
| 9 | **Remote Authentication — OAuth 2.0** (42 Intra) | Users | Minor | 1 | Full OAuth 2.0 handshake, JWT issued on callback, `totp_required` flag for 2FA gate | Abderrahman |
| 10 | **Two-Factor Authentication (TOTP)** | Users | Minor | 1 | pyotp TOTP: QR code setup, 6-digit verify on login, disable flow — all in profile settings | Abderrahman |
| 11 | **WAF / ModSecurity + HashiCorp Vault** | Cybersecurity | **Major** | **2** | ModSecurity NGINX (paranoia level 2, OWASP CRS) blocks XSS, SQLi, path traversal, Shellshock, Log4Shell, scanner UAs — all verified 403; Vault AppRole supplies all DB/OAuth/Django secrets; CORS restricted to WAF origin only | Aamir + Abderrahman |
| 12 | **ELK Stack Log Management** | DevOps | **Major** | **2** | Logstash pipeline (TCP + file inputs) ingests NGINX + Django logs → Elasticsearch (cluster status: green) → Kibana dashboards at `https://localhost:5601` | Aamir |
| 13 | **GDPR Compliance** | Data & Analytics | Minor | 1 | `GET /api/v1/auth/me/export/` (JSON dump), `POST /api/v1/auth/me/delete/` (confirmed deletion), Privacy Policy page; endpoints validated with edge-case tests | Adil + Mohamed + Ayoub |
| 14 | **Admin Analytics Dashboard** *(custom minor)* | Modules of Choice | Minor | 1 | Recharts BarChart (seat occupancy per bus) + PieChart (reservations by route) in admin overview; justification: domain-specific data visualisation tailored to fleet logistics | Adil |

### Point Totals

| Type | Count | Pts each | Subtotal |
|------|-------|----------|---------|
| Major modules | 5 | 2 | **10** |
| Minor modules | 9 | 1 | **9** |
| **Grand Total** | **14** | | **19 pts** |

**19 pts — exceeds the 14-point minimum by 5 pts.**

---

## 7. Individual Contributions

### Adil Bourji — Product Owner / Frontend Lead
- Designed and built the entire React SPA (routing, state, layouts)
- Created the custom CSS design system (20+ components, design tokens, dark/light mode)
- Built the admin portal: fleet, route builder (dnd-kit), trip generator, analytics charts (Recharts)
- Implemented multi-language i18n + Arabic RTL
- Built GDPR self-service UI in profile settings
- Implemented Recharts analytics dashboard (seat occupancy + route distribution charts)

### Mohamed Lahrech — Tech Lead / Backend
- Designed and implemented the full data model (10 tables, relational integrity)
- Built the core reservation engine (capacity checks, atomic writes)
- Implemented the announcement system (priority, dismiss tracking)
- Built the automated trip archiving cron job
- Implemented GDPR backend endpoints (`/me/export/`, `/me/delete/`)

### Aamir Tahtah — Project Manager / DevOps
- Designed and maintained all 11 Docker containers + Compose orchestration
- Configured ModSecurity NGINX WAF with OWASP CRS + custom rules (paranoia level 2)
- Deployed and configured the ELK stack (TLS certs, ILM policies, Kibana system user)
- Set up the Logstash pipeline (TCP + file inputs) shipping NGINX and Django logs to Elasticsearch
- Verified WAF blocks: XSS, SQLi, path traversal, Shellshock, Log4Shell, scanner User-Agents

### Abderrahman Chakour — Backend Developer
- Implemented 42 Intra OAuth 2.0 flow (authorization code, token exchange)
- Built JWT token lifecycle (access/refresh, middleware)
- Integrated HashiCorp Vault with AppRole; Django reads secrets at runtime
- Implemented TOTP 2FA backend: model fields, pyotp setup/verify/disable endpoints

### Ayoub El Haouti — QA Engineer / Backend
- Wrote 86 automated tests covering all apps (buses, trips, reservations, drivers, users)
- Implemented drf-spectacular OpenAPI 3.0 schema and API documentation
- Built and hardened the public API with `X-API-Key` authentication
- Defined DRF serializer validation and standardized exception handling

---

## 8. Instructions

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- A registered [42 API application](https://profile.intra.42.fr/oauth/applications)

### Environment Setup

```bash
cp .env.example .env
```

Required variables in `.env`:

| Variable | Description |
|----------|-------------|
| `INTRA_42_CLIENT_ID` | 42 API application client ID |
| `INTRA_42_CLIENT_SECRET` | 42 API application client secret |
| `INTRA_42_REDIRECT_URI` | Must match your 42 app's callback URL |
| `ADMIN_42_LOGIN` | Your 42 login that gets admin role |
| `POSTGRES_PASSWORD` | Database password |
| `SECRET_KEY` | Django secret key |
| `SSBS_API_KEY` | API key for `X-API-Key` header |
| `ELASTIC_PASSWORD` | Shared password for all ELK components |

> All secrets are injected into HashiCorp Vault at first boot and read from there at runtime — `vault-init` seeds them automatically from `.env`.

### Quick Start

```bash
make up          # Build, start all 11 containers, wait for readiness, seed data
```

### Access URLs

| Service | URL | Notes |
|---------|-----|-------|
| **App** | `https://localhost:8443` | Through WAF (NGINX + ModSecurity) |
| **API docs** | `https://localhost:8443/api/v1/schema/swagger-ui/` | OpenAPI 3.0 UI |
| **Kibana** | `https://localhost:5601` | Must use `https://` — login: `elastic` / `<ELASTIC_PASSWORD>` |
| **Elasticsearch** | `https://localhost:9200` | Basic auth required |

### Useful Commands

```bash
make up          # Start all services + seed database
make down        # Stop all services
make clean       # Full reset (remove images, volumes, db data)
make seed        # Re-seed database without restarting
make logs        # Stream all container logs
make shell-be    # Shell into the backend container
# Run tests:
docker compose exec backend python manage.py test
```

### Security Architecture

```
Browser → https://localhost:8443
           │
         NGINX + ModSecurity WAF  (blocks XSS, SQLi, path traversal, scanners)
           │
         ssbs-backend (Django)    (reads all secrets from Vault, not .env)
           │
         ssbs-db (PostgreSQL)     (internal only, not exposed to host)
```

> Direct access to `:8000` (backend) and `:5174` (frontend) bypasses the WAF and is intentionally restricted via CORS — all traffic must go through `:8443`.

---

## 9. Resources

### Documentation & References
- [Django REST Framework](https://www.django-rest-framework.org/)
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [HashiCorp Vault — AppRole Auth](https://developer.hashicorp.com/vault/docs/auth/approle)
- [ModSecurity OWASP CRS](https://coreruleset.org/)
- [ELK Stack Getting Started](https://www.elastic.co/guide/index.html)
- [Recharts](https://recharts.org/en-US/)
- [pyotp TOTP](https://pyauth.github.io/pyotp/)
- [drf-spectacular](https://drf-spectacular.readthedocs.io/)
- [dnd-kit](https://dndkit.com/)

### AI Usage
GitHub Copilot (Claude Sonnet) was used throughout the project for:
- **Boilerplate acceleration**: generating initial serializer/view skeletons for repetitive CRUD modules (buses, drivers, stations), then reviewed and adapted by the team.
- **Debugging assistance**: diagnosing Vault AppRole token renewal issues and ModSecurity false-positive rule tuning.
- **Code review support**: identifying missing permission checks in DRF views.
- **Documentation**: drafting initial README structure, then rewritten by the team to match actual implementation.
- All AI-generated content was reviewed, tested, and understood by the team member responsible for that module before merge.

---

## 10. License

This project was built as part of the [42 School](https://42.fr) curriculum. All rights reserved by the respective authors.

