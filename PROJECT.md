# 🚌 Fleetmark — Project Management Document

> **Smart Transportation Reservation Platform**
> Daily reference for frontend development progress, architecture decisions, and team coordination.

| Field | Detail |
|---|---|
| **Project** | Fleetmark |
| **Live URL** | [fleetmark.vercel.app](https://fleetmark.vercel.app/) |
| **Repo** | [github.com/adilx15487/Fleetmark](https://github.com/adilx15487/Fleetmark) |
| **Deployment** | Vercel — auto-deploy on push to `main` |
| **Last Updated** | March 2, 2026 |

---

## 1. Project Overview

**Fleetmark** is a full-stack smart transportation management platform designed for schools, universities, and enterprises. It provides seat reservation, fleet management, route planning, and real-time notifications — replacing chaotic manual processes with a clean, role-based digital system.

### Mission

> Eliminate overcrowded buses, unfair seat allocation, and poor route visibility by giving every stakeholder — admins, passengers, and drivers — the tools they need in one unified platform.

### Target Users

| Role | Description |
|---|---|
| **Admin / Organizer** | Manages the entire fleet: buses, routes, schedules, users, and reports |
| **Passenger (Student / Employee)** | Reserves seats, views routes & schedules, receives notifications |
| **Driver** | Views assigned schedule, passenger manifests, and route details |

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5.6 |
| **Build Tool** | Vite 6.4 |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Routing** | React Router DOM v6 |
| **Deployment** | Vercel (CI/CD on push) |
| **Package Manager** | npm |

### Team

| # | Name | Role |
|---|---|---|
| 1 | **Adil Bourji** | Frontend Developer |
| 2 | **Mohamed Lahrech** | Backend Developer |
| 3 | **Abderrahman Chakour** | Backend Developer |
| 4 | **Ayoub El Haouti** | Backend + Testing & Debugging |
| 5 | **Aamir Tahtah** | DevOps & Security |

### Team Focus Tracker

| Name | Role | Focus This Week |
|------|------|------------------|
| Adil Bourji | Frontend | UI Polish + 42 OAuth frontend |
| Mohamed Lahrech | Backend | 42 OAuth endpoint + API fixes |
| Abderrahman Chakour | Backend | Production deploy prep |
| Ayoub El Haouti | Backend + Testing | Fix bugs + test suite |
| Aamir Tahtah | DevOps & Security | Railway deploy + SSL |

---

## 2. Current Progress

### ✅ Completed

- [x] Project scaffolding (React + Vite + TS + Tailwind v4)
- [x] Custom design system & theme (colors, fonts, spacing)
- [x] **Landing Page**
  - [x] Navbar (transparent → solid on scroll, responsive mobile menu)
  - [x] Hero (gradient background, stats, animated dashboard preview)
  - [x] Features — "What This Project Is About" (Problem → Solution paired rows)
  - [x] Who We Are (team member cards with horizontal scroll)
  - [x] Get Started — Auth Section (tabbed Login / Signup with role selector)
  - [x] Subscribe (email subscription CTA)
  - [x] Footer (links, copyright)
- [x] **Admin Dashboard**
  - [x] Sidebar (collapsible, responsive drawer on mobile)
  - [x] Topbar (search, notifications bell, profile dropdown)
  - [x] Reusable Modal component
  - [x] Overview (stat cards, line chart, donut chart, activity table, quick actions)
  - [x] Bus Management (search, data table, status badges, CRUD modal)
  - [x] Route & Stops (expandable route cards, stops timeline, add route modal)
  - [x] User Management (search + role filter, user table, invite modal)
  - [x] Schedule Management (weekly calendar grid, color-coded slots, legend)
  - [x] Reports & Analytics (date range, stat cards, bar chart, line chart, top routes table)
  - [x] Notifications (filter tabs, notification cards, send notification modal)
- [x] React Router wiring (`/` landing, `/admin/*` dashboard)
- [x] `vercel.json` SPA rewrite configuration
- [x] GitHub repo + Vercel deployment
- [x] Production build passing (0 TypeScript errors)

### 🔄 In Progress

- [ ] **Passenger Dashboard**
  - [ ] Passenger layout (simplified sidebar/nav)
  - [ ] My Reservations (upcoming rides, history)
  - [ ] Browse Routes (search, view stops & schedules)
  - [ ] Seat Reservation flow (select route → pick seat → confirm)
  - [ ] My Profile (edit details, preferences)
  - [ ] Notifications inbox

### ⏳ TODO — Frontend

- [ ] **Driver Dashboard**
  - [ ] Driver layout
  - [ ] Today's Schedule (assigned routes & times)
  - [ ] Passenger Manifest (who's on the bus)
  - [ ] Route Map view
  - [ ] Notifications
- [ ] **Authentication Flow**
  - [ ] Login → API call → JWT storage
  - [ ] Role-based redirect (Admin → `/admin`, Passenger → `/passenger`, Driver → `/driver`)
  - [ ] Protected route guards (`PrivateRoute` wrapper)
  - [ ] Logout + token cleanup
  - [ ] Session persistence (refresh token or localStorage)
- [ ] **API Integration**
  - [ ] Axios/fetch service layer with base URL config
  - [ ] Replace all mock data with real API calls
  - [ ] Error handling (toast notifications, retry logic)
  - [ ] Loading skeletons for async data
- [ ] **Polish & QA**
  - [ ] 404 page
  - [ ] Empty states for all tables/lists
  - [ ] Form validation (Zod or native)
  - [ ] Accessibility audit (focus management, ARIA labels)
  - [ ] Responsive testing (mobile, tablet, desktop)
  - [ ] Performance optimization (lazy loading, code splitting)
  - [ ] Final cross-browser testing

---

## 3. Pages & Routes

| # | Page | Route | Role | Status | Priority |
|---|---|---|---|---|---|
| 1 | Landing Page | `/` | Public | ✅ Done | — |
| 2 | Admin — Overview | `/admin/overview` | Admin | ✅ Done | — |
| 3 | Admin — Bus Management | `/admin/buses` | Admin | ✅ Done | — |
| 4 | Admin — Route & Stops | `/admin/routes` | Admin | ✅ Done | — |
| 5 | Admin — User Management | `/admin/users` | Admin | ✅ Done | — |
| 6 | Admin — Schedule | `/admin/schedule` | Admin | ✅ Done | — |
| 7 | Admin — Reports | `/admin/reports` | Admin | ✅ Done | — |
| 8 | Admin — Notifications | `/admin/notifications` | Admin | ✅ Done | — |
| 9 | Passenger — Dashboard | `/passenger` | Passenger | 🔄 In Progress | 🔴 High |
| 10 | Passenger — My Reservations | `/passenger/reservations` | Passenger | ⏳ Todo | 🔴 High |
| 11 | Passenger — Browse Routes | `/passenger/routes` | Passenger | ⏳ Todo | 🔴 High |
| 12 | Passenger — Reserve Seat | `/passenger/reserve/:routeId` | Passenger | ⏳ Todo | 🔴 High |
| 13 | Passenger — Profile | `/passenger/profile` | Passenger | ⏳ Todo | 🟡 Medium |
| 14 | Passenger — Notifications | `/passenger/notifications` | Passenger | ⏳ Todo | 🟡 Medium |
| 15 | Driver — Dashboard | `/driver` | Driver | ⏳ Todo | 🟡 Medium |
| 16 | Driver — Today's Schedule | `/driver/schedule` | Driver | ⏳ Todo | 🟡 Medium |
| 17 | Driver — Passenger Manifest | `/driver/manifest` | Driver | ⏳ Todo | 🟡 Medium |
| 18 | Driver — Notifications | `/driver/notifications` | Driver | ⏳ Todo | 🟢 Low |
| 19 | Login | `/login` | Public | ⏳ Todo | 🔴 High |
| 20 | Register | `/register` | Public | ⏳ Todo | 🔴 High |
| 21 | 404 Not Found | `*` | Public | ⏳ Todo | 🟢 Low |

---

## 4. Components Checklist

### Shared / Reusable

| Component | Location | Status | Used By |
|---|---|---|---|
| `Navbar` | `components/Navbar.tsx` | ✅ | Landing |
| `Footer` | `components/Footer.tsx` | ✅ | Landing |
| `ScrollArrows` | `components/ScrollArrows.tsx` | ✅ | WhoWeAre |
| `Sidebar` | `components/admin/Sidebar.tsx` | ✅ | Admin |
| `Topbar` | `components/admin/Topbar.tsx` | ✅ | Admin |
| `Modal` | `components/admin/Modal.tsx` | ✅ | Admin (all pages) |
| Passenger Sidebar | `components/passenger/Sidebar.tsx` | ⏳ | Passenger |
| Driver Sidebar | `components/driver/Sidebar.tsx` | ⏳ | Driver |
| `DataTable` | `components/shared/DataTable.tsx` | ⏳ | All dashboards |
| `StatCard` | `components/shared/StatCard.tsx` | ⏳ | All dashboards |
| `EmptyState` | `components/shared/EmptyState.tsx` | ⏳ | All dashboards |
| `LoadingSkeleton` | `components/shared/LoadingSkeleton.tsx` | ⏳ | All dashboards |
| `Toast` | `components/shared/Toast.tsx` | ⏳ | Global |
| `ProtectedRoute` | `components/auth/ProtectedRoute.tsx` | ⏳ | Auth |

### Custom Hooks

| Hook | Location | Status |
|---|---|---|
| `useHorizontalScroll` | `hooks/useHorizontalScroll.ts` | ✅ |
| `useAuth` | `hooks/useAuth.ts` | ⏳ |
| `useApi` | `hooks/useApi.ts` | ⏳ |

---

## 5. Backend Integration Notes

> **Status:** Backend team is building the API. Frontend uses mock data (`src/data/mockData.ts`) until endpoints are ready.

### API Base URL

```
Development:  http://localhost:8080/api/v1
Production:   https://api.fleetmark.com/v1   (TBD)
```

### Endpoints Frontend Will Consume

#### Auth

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `POST` | `/auth/login` | Login with email + password → JWT | 🔴 |
| `POST` | `/auth/register` | Register new user (name, email, password, role) | 🔴 |
| `POST` | `/auth/logout` | Invalidate session | 🔴 |
| `GET` | `/auth/me` | Get current user profile from token | 🔴 |
| `POST` | `/auth/refresh` | Refresh access token | 🟡 |

#### Buses

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/buses` | List all buses (admin) | 🔴 |
| `GET` | `/buses/:id` | Get single bus details | 🟡 |
| `POST` | `/buses` | Create new bus | 🔴 |
| `PUT` | `/buses/:id` | Update bus | 🔴 |
| `DELETE` | `/buses/:id` | Delete bus | 🟡 |

#### Routes

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/routes` | List all routes (with stops) | 🔴 |
| `GET` | `/routes/:id` | Get single route with stops | 🔴 |
| `POST` | `/routes` | Create new route | 🔴 |
| `PUT` | `/routes/:id` | Update route | 🟡 |
| `DELETE` | `/routes/:id` | Delete route | 🟡 |

#### Reservations

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/reservations` | List reservations (filtered by user/route) | 🔴 |
| `POST` | `/reservations` | Create reservation (route, seat, date) | 🔴 |
| `PUT` | `/reservations/:id/cancel` | Cancel a reservation | 🔴 |
| `GET` | `/reservations/my` | Get current user's reservations | 🔴 |

#### Users

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/users` | List all users (admin) | 🔴 |
| `GET` | `/users/:id` | Get user profile | 🟡 |
| `PUT` | `/users/:id` | Update user details | 🟡 |
| `PUT` | `/users/:id/status` | Activate / suspend user | 🟡 |

#### Notifications

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/notifications` | List notifications for current user | 🔴 |
| `POST` | `/notifications` | Send notification (admin) | 🟡 |
| `PUT` | `/notifications/:id/read` | Mark as read | 🟡 |
| `GET` | `/notifications/unread-count` | Badge count | 🟡 |

#### Reports

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/reports/stats` | Dashboard stats (totals, changes) | 🔴 |
| `GET` | `/reports/ridership` | Ridership trends (daily/weekly) | 🟡 |
| `GET` | `/reports/routes` | Rides per route breakdown | 🟡 |
| `GET` | `/reports/export` | Export PDF report | 🟢 |

#### Schedule

| Method | Endpoint | Description | Priority |
|---|---|---|---|
| `GET` | `/schedule/weekly` | Get weekly schedule | 🔴 |
| `POST` | `/schedule` | Add time slot | 🟡 |
| `PUT` | `/schedule/:id` | Update time slot | 🟡 |
| `DELETE` | `/schedule/:id` | Remove time slot | 🟢 |

---

## 6. Design System Reference

### Colors

| Token | Hex | Usage |
|---|---|---|
| `primary-900` | `#0F172A` | Headings, dark text |
| `primary-800` | `#1E293B` | Sidebar background |
| `primary-700` | `#1E3A5F` | Primary brand navy |
| `primary-600` | `#2563EB` | Buttons, links |
| `primary-500` | `#3B82F6` | Hover states |
| `primary-50` | `#EFF6FF` | Light backgrounds |
| `accent-400` | `#38BDF8` | Highlight / sky blue |
| `accent-500` | `#0EA5E9` | Charts, active states |
| `success` | `#22C55E` | Confirmed, active |
| `warning` | `#F59E0B` | Pending, attention |
| `danger` | `#EF4444` | Cancelled, error |

### Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Headings | Inter | 700 (Bold) | 2xl–4xl |
| Body | Inter | 400–500 | sm–base |
| Labels / Caps | Inter | 600 (Semibold) | xs, uppercase, tracking-wider |
| Mono (times, IDs) | System mono | 400 | xs–sm |

### Component Patterns

| Pattern | Standard |
|---|---|
| Cards | `bg-white rounded-2xl border border-slate-200` + `hover:shadow-lg hover:shadow-primary-100/30` |
| Buttons (primary) | `px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20` |
| Buttons (secondary) | `px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50` |
| Inputs | `px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none` |
| Tables | White bg, `divide-y divide-slate-100`, `hover:bg-slate-50/50` rows |
| Status badges | Colored `bg-*-50 text-*-600 border-*-200` pills with `rounded-lg px-2.5 py-1 text-xs font-semibold` |
| Page background | `bg-slate-50` (dashboard), `bg-white` (landing) |
| Sidebar | `bg-primary-800` with `text-primary-300/70` links, `text-accent-400` active |
| Animations | Framer Motion `fadeInUp`, `useInView` trigger, `ease: 'easeOut' as const` |

---

## 7. Daily Task Tracker

### 📅 Today — March 2, 2026

| # | Task | Assigned To | Status |
|---|---|---|---|
| 1 | Fix ValueError → LifecycleError bug | Ayoub | ⏳ Todo |
| 2 | Install + config django-cors-headers | Ayoub | ⏳ Todo |
| 3 | Re-run test suite → 42/42 pass | Ayoub | ⏳ Todo |
| 4 | 42 OAuth frontend polish | Adil | 🔄 In Progress |
| 5 | 42 OAuth backend endpoint fixes | Mohamed | 🔄 In Progress |
| 6 | Production deploy prep | Abderrahman | ⏳ Todo |
| 7 | Railway deploy + SSL | Aamir | ⏳ Todo |

### 🧪 Ayoub El Haouti — Backend + Testing & Debugging

| # | Task | Priority | Est. Time | Status |
|---|------|----------|-----------|--------|
| 1 | Fix ValueError→LifecycleError bug | 🔴 Critical | 5 min | ⏳ Todo |
| 2 | Install + config django-cors-headers | 🔴 High | 10 min | ⏳ Todo |
| 3 | Re-run test suite → 42/42 pass | 🔴 High | 30 min | ⏳ Todo |
| 4 | Fix test script ordering (fail 3.1) | 🟡 Medium | 5 min | ⏳ Todo |
| 5 | Write tests: 3/night reservation limit | 🟡 Medium | 1 hour | ⏳ Todo |
| 6 | Write tests: 30min lock rule | 🟡 Medium | 1 hour | ⏳ Todo |
| 7 | Write tests: home stop → bus assignment | 🟡 Medium | 1 hour | ⏳ Todo |
| 8 | Test 42 OAuth full flow | 🟡 Medium | 2 hours | ⏳ Todo |
| 9 | End-to-end test all 3 roles | 🟡 Medium | 2 hours | ⏳ Todo |
| 10 | Mobile testing (real device) | 🟢 Low | 1 hour | ⏳ Todo |
| 11 | Cross-browser testing | 🟢 Low | 1 hour | ⏳ Todo |
| 12 | Security audit (JWT + permissions) | 🟢 Low | 2 hours | ⏳ Todo |

**Ayoub's Priority Order:**
1. Fix ValueError → LifecycleError bug (TODAY)
2. Fix CORS (TODAY)
3. Re-run tests → 42/42 (TODAY)
4. Write new tests for 1337 specific rules
5. End-to-end testing with 42 OAuth
6. Mobile + browser testing before launch

### 🚧 Blocked By

| Item | Waiting On | Since |
|---|---|---|
| Deployment domain / SSL | DevOps (Aamir) | — |

### 📝 Notes & Decisions

- All dashboard pages use mock data from `src/data/mockData.ts` — swap to API calls when ready
- Using `vercel.json` rewrites for SPA client-side routing
- Recharts for all data visualization (bar, line, pie/donut)
- Sidebar collapses to icon-only mode on desktop, slides as drawer on mobile
- 42 OAuth is implemented (real flow via intra.42.fr)
- Backend API running on Django 4.2 + DRF + SimpleJWT
- Ayoub El Haouti joined as 5th member — owns all testing & debugging
- With 5 members, backend devs (Mohamed, Abderrahman) focus on features while Ayoub handles QA

### 📅 Estimated Completion

| Milestone | Target Date | Status |
|---|---|---|
| Backend API complete | March 5, 2026 | 🔄 In Progress |
| 42 OAuth working end-to-end | March 3, 2026 | 🔄 In Progress |
| All tests passing (42/42) | March 3, 2026 | ⏳ Todo (Ayoub) |
| Production deployment (Railway) | March 7, 2026 | ⏳ Todo |
| Mobile + cross-browser QA | March 8, 2026 | ⏳ Todo (Ayoub) |
| **Launch ready** | **March 10, 2026** | ⏳ Todo |

> With 5 team members (up from 4), testing is no longer a bottleneck. Ayoub handles all QA, freeing Mohamed and Abderrahman to focus purely on backend features and deployment prep.

---

## 8. Team Contacts

| Name | Role | GitHub | LinkedIn | WhatsApp |
|---|---|---|---|---|
| Adil Bourji | Frontend Developer | [github.com/adilx15487](https://github.com/adilx15487) | [linkedin.com/in/adil-bourji](https://linkedin.com/in/adil-bourji) | — |
| Mohamed Lahrech | Backend Developer | [github.com/mohamedlahrech](https://github.com/mohamedlahrech) | [linkedin.com/in/mohamed-lahrech](https://linkedin.com/in/mohamed-lahrech) | — |
| Abderrahman Chakour | Backend Developer | [github.com/achakour](https://github.com/achakour) | [linkedin.com/in/abderrahman-chakour](https://linkedin.com/in/abderrahman-chakour) | — |
| Ayoub El Haouti | Backend + Testing & Debugging | [github.com/ayoubelhaouti](https://github.com/ayoubelhaouti) | [linkedin.com/in/ayoub-el-haouti](https://linkedin.com/in/ayoub-el-haouti) | — |
| Aamir Tahtah | DevOps & Security | [github.com/aamirtahtah](https://github.com/aamirtahtah) | [linkedin.com/in/aamir-tahtah](https://linkedin.com/in/aamir-tahtah) | — |

>> SOON ...! ⚠️ Update the links above with real profile URLs. NON IMPORTANT NOW!!

---

## 9. Important Links

| Resource | URL |
|---|---|
| **Live Site** | [https://fleetmark.vercel.app](https://fleetmark.vercel.app/) |
| **Admin Dashboard** | [https://fleetmark.vercel.app/admin/overview](https://fleetmark.vercel.app/admin/overview) |
| **GitHub Repository** | [https://github.com/adilx15487/Fleetmark](https://github.com/adilx15487/Fleetmark) |
| **Vercel Dashboard** | [https://vercel.com/adilx15487/fleetmark](https://vercel.com/adilx15487/fleetmark) |
| **Figma / Design** | _Not yet created_ |
| **API Documentation** | _Pending from backend team_ |
| **Notion / Trello** | _Not yet set up_ |

---

<sub>Maintained by **Adil Bourji** · Frontend Developer · Fleetmark Team</sub>
