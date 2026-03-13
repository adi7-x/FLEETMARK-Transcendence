# Fleetmark — Frontend Development Report

| | |
|---|---|
| **Author** | Adil Bourji |
| **Role** | Frontend Developer |
| **Date** | February 2026 |
| **Repository** | [github.com/adilx15487/Fleetmark](https://github.com/adilx15487/Fleetmark) |
| **Live Demo** | [fleetmark.vercel.app](https://fleetmark.vercel.app/) |

---

## 1. Introduction

This report documents the complete frontend development process for **Fleetmark**, a smart transportation reservation platform. It covers every phase of work — from setting up an empty folder to deploying a production-ready application with 24 pages, 3 role-based dashboards, authentication, animations, and performance optimization.

Fleetmark is a team project with 4 members. My responsibility was the **entire frontend**: choosing the tech stack, designing the UI, writing all components, handling routing and state management, and deploying to production. The backend team (Mohamed Lahrech and Abderrahman Chakour) is building the API separately, and Aamir Tahtah handles DevOps and security.

This report explains **what** I built, **how** I built it, **what tools** I used, **what problems** I faced, and **how I solved them** — phase by phase.

---

## 2. Development Environment & Tools

Before writing any code, I set up my development environment with the following tools:

### Editor & Extensions

| Tool | Purpose |
|------|---------|
| **VS Code** | Primary code editor |
| **GitHub Copilot** | AI-powered code assistant — helped with boilerplate, component structure, debugging |
| **ESLint** | Code quality and error detection |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind utility classes |
| **Prettier** | Code formatting consistency |

### Command Line Tools

| Tool | Purpose |
|------|---------|
| **Node.js + npm** | JavaScript runtime and package manager |
| **Git** | Version control — every phase committed separately |
| **Vite CLI** | Project scaffolding and dev server |
| **TypeScript compiler (`tsc`)** | Type checking before every build |

### Deployment & Collaboration

| Tool | Purpose |
|------|---------|
| **GitHub** | Remote repository, code hosting |
| **Vercel** | Auto-deployment — every `git push` to `main` triggers a new production build |
| **Chrome DevTools** | Responsive testing, performance analysis, debugging |

### My Workflow

For every feature, I followed this cycle:

```
1. Plan what to build (pages, components, data structure)
2. Write the code in VS Code
3. Test in browser with Vite dev server (hot reload)
4. Check for TypeScript errors: npx tsc --noEmit
5. Build for production: npm run build
6. Commit and push: git add -A && git commit && git push
7. Vercel auto-deploys → check live site
```

---

## 3. Development Phases — Step by Step

The project was built in **11 phases** over the course of development. Each phase focused on a specific area, and I only moved to the next phase after the current one was complete, tested, and deployed.

---

### Phase 1 — Project Scaffolding

**Goal:** Create the project from scratch with all the right tools configured.

**What I did:**

1. Created a new Vite project with React and TypeScript:
   ```bash
   npm create vite@latest Fleetmark -- --template react-ts
   cd Fleetmark
   npm install
   ```

2. Installed Tailwind CSS v4 (the new CSS-first version):
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

3. Set up the Tailwind plugin in `vite.config.ts` and added `@import "tailwindcss"` to `index.css`.

4. Defined the **design system** directly in CSS using Tailwind v4's `@theme` block:
   ```css
   @theme {
     --color-primary-800: #1E3A5F;   /* Navy — sidebar, dark elements */
     --color-primary-500: #3B82F6;   /* Blue — buttons, links */
     --color-accent-400: #38BDF8;    /* Sky — highlights, badges */
     --color-success-500: #22C55E;   /* Green — active status */
     --color-warning-500: #F59E0B;   /* Amber — pending status */
     --color-danger-500: #EF4444;    /* Red — errors, delete */
     --font-sans: 'Inter', system-ui, sans-serif;
   }
   ```

5. Installed additional dependencies:
   ```bash
   npm install react-router-dom framer-motion lucide-react recharts
   ```

**Why these choices:**
- **Vite** instead of Create React App → CRA is deprecated; Vite starts in milliseconds and has instant hot reload
- **Tailwind v4** instead of v3 → No config file needed, design tokens live in CSS where they belong
- **TypeScript** → Catches bugs at compile time, makes components self-documenting
- **Inter font** → Clean, professional, excellent readability at all sizes

**Result:** Empty project with all tools configured, ready to build.

---

### Phase 2 — Landing Page

**Goal:** Build the public-facing page that introduces Fleetmark and lets users sign up or log in.

**What I did:**

I broke the landing page into 7 independent components, each in its own file:

| Component | What It Does | Lines |
|-----------|-------------|-------|
| `Navbar.tsx` | Fixed navbar that turns solid on scroll, hamburger menu on mobile | 180 |
| `Hero.tsx` | Large hero section with headline, stats, CTA buttons, SVG illustration | 232 |
| `Features.tsx` | "What This Project Is About" — 3 feature cards with connecting arrows | 174 |
| `WhoWeAre.tsx` | Team member cards with horizontal drag-scroll | 206 |
| `AuthSection.tsx` | Login/Signup tabbed forms with role selector | 551 |
| `Subscribe.tsx` | Email subscription form | 134 |
| `Footer.tsx` | 4-column footer with links | 121 |

**How I approached it:**

1. Started with `Navbar` since it's the first thing users see — made it transparent over the hero, then solid white after scrolling (using a `scroll` event listener).
2. Built `Hero` with a two-column layout: text on left, illustration on right. Added animated stat counters.
3. For `WhoWeAre`, I created a custom `useHorizontalScroll` hook that enables drag-to-scroll with mouse/touch and auto-scrolls on a timer.
4. `AuthSection` was the most complex landing component (551 lines) — it has tab switching between Login and Signup, a role selector dropdown, form validation, and error handling.

**Tools used:**
- **Framer Motion** for scroll-triggered animations (`useInView` hook detects when elements enter the viewport)
- **Lucide React** for all icons (Bus, Users, Shield, etc.)

**Result:** Complete landing page with all 7 sections, responsive on all screen sizes.

---

### Phase 3 — Landing Page Iterations

**Goal:** Refine the landing page based on visual review.

**What I changed:**
- Adjusted spacing and padding across all sections for better visual rhythm
- Fixed the hero gradient to span full width
- Improved the mobile hamburger menu behavior
- Made team cards scroll smoothly with proper snap points
- Added `ScrollArrows` component for manual scroll navigation on team cards

**Lesson learned:** The first version is never final. I went through multiple rounds of tweaking spacing, colors, and responsive breakpoints before it felt right.

---

### Phase 4 — Admin Dashboard (7 Pages)

**Goal:** Build the complete admin control panel with navigation, data tables, charts, and modals.

**What I built:**

First, I created the **layout structure** that all admin pages share:

```
┌────────────────────────────────────────────┐
│ Topbar (hamburger + search + profile)      │
├──────────┬─────────────────────────────────┤
│          │                                 │
│ Sidebar  │   Page content (via <Outlet />) │
│  (nav)   │                                 │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

**Step-by-step process:**

1. **Sidebar** (129 lines) — Navy background, icon + label navigation links, active state highlighting with `NavLink` from React Router. On desktop it's always visible; on mobile it slides in as an overlay with a backdrop.

2. **Topbar** (122 lines) — Hamburger button (mobile only), search bar, notification bell with badge count, profile dropdown with avatar.

3. **AdminLayout** — Wrapper component that renders the Sidebar + Topbar + `<Outlet />` (React Router renders the current page inside the outlet).

4. **Modal** component (53 lines) — Shared modal used by 4 different pages. Handles open/close, backdrop click, body scroll lock, responsive sizing.

Then I built each page one by one:

| Page | Key UI Elements | How I Built It |
|------|----------------|----------------|
| **Overview** | 4 stat cards, area chart, activity table, quick actions | Stat cards use a grid that goes from 1 column (mobile) → 2 → 4 (desktop). Chart uses Recharts `AreaChart`. |
| **Bus Management** | Data table, status badges, CRUD modal | Table with search/filter. Each row has a status badge (Active/Maintenance/Inactive). Add/Edit modal reuses the shared `Modal`. |
| **Route & Stops** | Route cards with expandable stop lists | Each route is a card that expands to show a timeline of stops. "Add Route" modal has time inputs. |
| **User Management** | User table with role filter | Table with responsive column hiding — on mobile, less important columns are hidden with `hidden sm:table-cell`. |
| **Schedule Management** | Weekly calendar grid | Grid of time slots organized by day. Each slot is a card with route, bus, and driver info. |
| **Reports** | Stat cards, bar chart, pie chart, table | Used Recharts `BarChart` and `PieChart`. Added a date range selector. |
| **Notifications** | Filter tabs, notification list | Tabs for All/Unread/Read. Each notification has a type icon, message, and timestamp. |

**Routing setup:**

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<Navigate to="overview" replace />} />
  <Route path="overview" element={<Overview />} />
  <Route path="buses" element={<BusManagement />} />
  <Route path="routes" element={<RouteStops />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="schedule" element={<ScheduleManagement />} />
  <Route path="reports" element={<Reports />} />
  <Route path="notifications" element={<Notifications />} />
</Route>
```

**Result:** 7 fully functional admin pages with consistent design, all using mock data.

---

### Phase 5 — GitHub & Vercel Deployment

**Goal:** Put the code online and set up automatic deployment.

**What I did:**

1. Created a GitHub repository:
   ```bash
   git init
   git add -A
   git commit -m "Initial commit"
   git remote add origin https://github.com/adilx15487/Fleetmark.git
   git push -u origin main
   ```

2. Connected the repo to **Vercel** — Vercel detects it's a Vite project and configures build settings automatically.

3. Created `vercel.json` to handle client-side routing (without this, refreshing on `/admin/overview` would show a 404 from Vercel's server):
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

4. From this point forward, every `git push` to `main` triggers an automatic build and deployment on Vercel.

**Result:** Live at [fleetmark.vercel.app](https://fleetmark.vercel.app/) with CI/CD pipeline.

---

### Phase 6 — PROJECT.md Documentation

**Goal:** Create a project management document for team coordination.

**What I wrote:** A comprehensive `PROJECT.md` file (375 lines) containing:
- Project overview and team members
- Current progress checklist with status indicators
- Full page/route table with status and priority
- Component checklist with locations
- Backend API endpoint specifications (for future integration)
- Design system reference (colors, typography, component patterns)
- Daily task tracker template
- Team contact information

**Why:** This document serves as the single source of truth for the team — the backend developers can see what endpoints the frontend expects, what the data format should look like, and everyone can track progress.

---

### Phase 7 — Passenger Dashboard (6 Pages)

**Goal:** Build the passenger-facing dashboard where users can reserve seats, view routes, and manage their profile.

**What I built:**

I followed the same layout pattern as the admin dashboard (sidebar + topbar + content) but with a simpler navigation and a different color feel.

| Page | Lines | What Makes It Special |
|------|-------|----------------------|
| **Overview** | 210 | Welcome card with user name, upcoming reservations table, favorite routes |
| **Reserve a Seat** | 400 | **Most complex page in the entire app** — 3-step wizard |
| **My Reservations** | 148 | Card grid showing booked seats with cancel option |
| **Routes** | 185 | Expandable route cards with stop timeline and schedule |
| **Notifications** | 122 | Read/unread toggle, categorized notifications |
| **Profile Settings** | 223 | Personal info form, notification preferences, password change |

**The Seat Reservation Flow (400 lines):**

This was the most challenging page to build. I broke it into 3 steps:

```
Step 1: Select a Route    →    Step 2: Choose a Seat    →    Step 3: Confirm Booking
(route cards with           (visual seat map grid        (summary of selection
 schedule info)              with color-coded seats)      + confirm button)
```

- **Step 1:** Route cards showing origin, destination, departure time, and available seats count. User clicks a route to proceed.
- **Step 2:** An interactive seat grid where each seat is a clickable button. Colors indicate status: green = available, red = occupied, blue = your selection. Users click to select their seat.
- **Step 3:** Confirmation screen showing the selected route, seat number, date, and a "Confirm Reservation" button.

All state (selected route, selected seat, current step) is managed with React `useState` hooks in a single component. Users can navigate back and forth between steps without losing their selections.

**Result:** 6 passenger pages with a complete reservation flow.

---

### Phase 8 — Driver Dashboard (5 Pages)

**Goal:** Build the driver interface for viewing routes, passengers, and trip status.

**What I built:**

| Page | Lines | Description |
|------|-------|-------------|
| **Overview** | 267 | Today's stats, next trip countdown, weekly trips line chart, vehicle status |
| **My Route** | 184 | Stop timeline with arrival times, today's trips table |
| **Passenger List** | 151 | Passenger cards with seat numbers, boarding status, contact info |
| **Notifications** | 121 | Operational notifications with priority indicators |
| **Profile** | 199 | Personal info, license details, vehicle assignment |

**How the driver dashboard differs from admin:**
- Simpler navigation (5 items vs 7)
- Data is focused on "my" assignments, not system-wide management
- No CRUD modals — drivers view data but don't create/edit fleet resources
- Overview shows a line chart (weekly trips) instead of the area chart (monthly ridership) used by admin

**Result:** 5 driver pages with consistent design language shared with the other dashboards.

---

### Phase 9 — Authentication Flow

**Goal:** Implement login/logout with role-based routing so each user type sees only their dashboard.

**What I built:**

1. **AuthContext** (129 lines) — A React Context that provides global authentication state to the entire app:
   ```tsx
   type UserRole = 'admin' | 'passenger' | 'driver';
   
   interface AuthUser {
     name: string;
     email: string;
     role: UserRole;
     avatar: string;
   }
   ```

2. **Mock credentials** — Three predefined users for testing:

   | Role | Email | Password |
   |------|-------|----------|
   | Admin | `admin@fleetmark.com` | `admin123` |
   | Passenger | `passenger@fleetmark.com` | `pass123` |
   | Driver | `driver@fleetmark.com` | `driver123` |

3. **ProtectedRoute** component (25 lines) — Wraps each dashboard route tree. It checks:
   - Is the user logged in? → If no, redirect to landing page
   - Does the user's role match the required role? → If no, redirect to their correct dashboard

4. **How the login flow works:**
   ```
   Landing page → "Get Started" section → Enter email + password + select role
   → AuthContext.login() validates against mock users
   → Success: show success toast + redirect to /admin, /passenger, or /driver
   → Failure: show error toast "Invalid email or password"
   ```

**Why mock auth instead of real API:**
The backend API wasn't ready yet. I designed the `AuthContext` so that replacing mock validation with a real API call requires changing only the `login()` function — zero changes to any component. The context already manages `user`, `isAuthenticated`, `loading`, and `error` states, which is exactly what a real JWT flow would need.

**Result:** Working login/logout with 3 roles, protected routes, proper redirects.

---

### Phase 10 — Loading States, Error Handling & Form Validation

**Goal:** Make the app feel professional by handling loading, errors, empty states, and user input properly.

**What I built:**

1. **Skeleton components** (166 lines in `Skeleton.tsx`):
   - `SkeletonCard` — Shimmer animated placeholder for stat cards
   - `SkeletonTable` — Shimmer placeholder for data tables
   - `SkeletonText` — Shimmer placeholder for text blocks
   
   These show while data is "loading" (simulated with a 1.5s delay using `useLoadingState`) instead of showing blank screens.

2. **EmptyState** (45 lines) — Displayed when a data list has no items. Shows an icon, a message, and an optional action button ("Add your first bus", "Make a reservation", etc.).

3. **ErrorState** (40 lines) — Displayed when data fetching fails. Shows an error message and a "Retry" button.

4. **useLoadingState hook** (36 lines) — Custom hook that provides a standard pattern for every data page:
   ```tsx
   const { isLoading, hasError, retry } = useLoadingState();
   
   if (isLoading) return <SkeletonTable rows={5} cols={4} />;
   if (hasError) return <ErrorState onRetry={retry} />;
   if (data.length === 0) return <EmptyState />;
   return <DataTable data={data} />;
   ```

5. **ToastContext** (107 lines) — Global notification system accessible from any component:
   ```tsx
   const { showToast } = useToast();
   showToast('Reservation confirmed!', 'success');
   showToast('Something went wrong', 'error');
   showToast('Check your input', 'warning');
   showToast('Bus added to fleet', 'info');
   ```
   Toasts appear at the top-right corner, auto-dismiss after 4 seconds, and animate in with a slide-from-right transition.

6. **Form validation** — Added validation to:
   - Login form (required fields, email format)
   - Signup form (password length, matching confirmation)
   - Admin modals (required fields for adding buses, routes, users, time slots)
   - Reserve a Seat (must select route and seat before proceeding)

**Result:** Every page handles loading, error, and empty states gracefully. Users get clear feedback on every action via toast notifications.

---

### Phase 11 — Mobile Responsiveness, Animations & Performance

**Goal:** Final polish — make everything work on all screen sizes, add micro-animations, and optimize bundle size.

**This phase covered 5 areas:**

#### 11.1 — Mobile Responsiveness

I tested every page at 375px (iPhone SE) and 768px (iPad) widths using Chrome DevTools.

**What was already responsive** (built correctly from the start):
- All 3 sidebars had hamburger menus with slide-in overlay
- All 3 topbars adapted to mobile
- Most grids used proper Tailwind breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`)
- All tables had `overflow-x-auto` for horizontal scrolling

**What I fixed in this phase:**
- **Modal component** → Redesigned for mobile: on small screens the modal slides up from the bottom as a "sheet" with `rounded-t-2xl` and locks body scroll
- **Hero stats** → Reduced gap from `gap-8` to `gap-4 sm:gap-8` to prevent cramping at 375px
- **Footer** → Reduced gap from `gap-12` to `gap-8` on mobile
- **Time input grids in modals** → Changed `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` so they stack on small screens

#### 11.2 — Micro Animations

| Animation | Where Used | How It Works |
|-----------|------------|-------------|
| **Page fade-in** | Every route change | CSS `@keyframes page-fade-in` — content slides up 6px and fades in over 300ms |
| **Modal scale-in** | Every modal open | CSS `@keyframes modal-in` — scales from 95% to 100% with fade, 200ms |
| **Toast slide-in** | Every notification | CSS `@keyframes slide-in-right` — slides in from right edge, 300ms |
| **Skeleton shimmer** | Loading states | CSS `@keyframes shimmer` — moving gradient background, loops every 1.5s |
| **Scroll reveals** | Landing page | Framer Motion `useInView` — sections animate in when they enter the viewport |

For page transitions, I added `key={location.pathname}` on the content wrapper so React re-creates the animation element on every route change, triggering the fade-in each time.

#### 11.3 — CSS Polish

| Feature | What I Did |
|---------|-----------|
| **Custom scrollbar** | Replaced browser default with a 6px thin scrollbar, navy-tinted thumb |
| **Focus states** | Added `focus-visible` outline (2px blue ring) on all inputs, buttons, links — important for accessibility |
| **Cursor pointer** | Applied `cursor: pointer` to all clickable elements globally |
| **Firefox support** | Added `scrollbar-width: thin; scrollbar-color` for Firefox compatibility |

#### 11.4 — Final Details

| Detail | What I Did |
|--------|-----------|
| **Favicon** | Created a custom SVG favicon — navy rounded rectangle with an accent-blue bus icon (replaced the default Vite icon) |
| **Page titles** | Built a `useDocumentTitle` hook — every page updates the browser tab title dynamically (e.g., "Overview — Fleetmark Admin", "My Route — Fleetmark Driver") |
| **404 page** | Created `NotFound.tsx` with bus icon, "404" heading, "Lost your route?" message, and a "Go Home" button |
| **Copyright** | Updated Footer year to © 2026 |

#### 11.5 — Performance: Code-Splitting with React.lazy()

**The problem:** All 18 dashboard pages were imported at the top of `App.tsx` using regular `import` statements. Even if a user only visits the passenger dashboard, the browser downloads admin and driver code too — resulting in a **932 KB** initial JavaScript bundle.

**The solution:** Converted all 18 dashboard page imports to lazy loading:

```tsx
// Before (eager — everything loads upfront):
import Overview from './pages/admin/Overview'

// After (lazy — loads only when the user navigates there):
const Overview = lazy(() => import('./pages/admin/Overview'))
```

I wrapped all routes in a `<Suspense>` boundary with a spinner fallback that shows while the chunk downloads.

**Result:**

| Metric | Before | After |
|--------|--------|-------|
| Initial bundle | 932 KB | 420 KB |
| Reduction | — | **55%** |
| Dashboard pages | 1 monolithic chunk | 20+ separate chunks |
| Load behavior | All pages at once | On-demand per route |

---

## 4. Technology Choices — Why Each One

### Why React 18?

- Component-based architecture fits perfectly for a dashboard app with many reusable patterns (cards, tables, modals)
- Largest ecosystem of tools, libraries, and community support
- Industry standard — relevant for professional portfolio and job market
- React 18's concurrent features allow better handling of loading states

### Why TypeScript?

- Catches type errors at compile time before code reaches production
- Every component's props are self-documenting — you can see exactly what data each component expects
- Better IDE support with autocomplete and inline error detection
- I ran `npx tsc --noEmit` before every build to ensure zero type errors throughout development

### Why Tailwind CSS v4?

- **Utility-first** → no context switching between separate CSS files and JSX components. The styling is right there in the component, next to the element it applies to.
- **Design tokens via `@theme`** → all colors, fonts, and spacing defined once in CSS, referenced everywhere via classes like `bg-primary-500` or `text-accent-400`
- **Responsive prefixes** → `sm:`, `md:`, `lg:`, `xl:` make responsive design declarative and readable instead of writing media queries manually
- **Zero runtime CSS** → Tailwind generates only the classes actually used, keeping the CSS bundle small (12 KB gzipped)

### Why Vite?

- Dev server starts in ~200ms (Create React App takes 10-30 seconds)
- Hot Module Replacement (HMR) — changes appear in the browser instantly without a full page reload
- Built-in TypeScript support with no extra configuration
- Production builds use Rollup — automatic code splitting when using `React.lazy()`

### Why Framer Motion?

- Declarative animation API that feels natural in React components
- `useInView` hook detects when elements scroll into the viewport — used for landing page section reveals
- Smooth, physics-based animations with minimal code

### Why Recharts?

- React-native charting library — charts are actual React components, not canvas-based
- Responsive containers that resize automatically with the layout
- Used for area charts (admin overview), bar charts (reports), line charts (driver overview), and pie charts (reports)

---

## 5. Architecture & Code Structure

### Directory Structure

```
src/
├── App.tsx                          # Root routing — defines all routes (123 lines)
├── index.css                        # Design tokens + global styles (131 lines)
├── context/
│   ├── AuthContext.tsx               # Login/logout, user state, role management (129 lines)
│   └── ToastContext.tsx              # Toast notifications, auto-dismiss (107 lines)
├── hooks/
│   ├── useDocumentTitle.ts           # Dynamic browser tab titles (14 lines)
│   ├── useHorizontalScroll.ts        # Drag-scroll for card rows (37 lines)
│   └── useLoadingState.ts            # Loading → error → data lifecycle (36 lines)
├── components/
│   ├── Navbar.tsx                    # Landing — fixed navbar (180 lines)
│   ├── Hero.tsx                      # Landing — hero section (232 lines)
│   ├── Features.tsx                  # Landing — feature cards (174 lines)
│   ├── WhoWeAre.tsx                  # Landing — team section (206 lines)
│   ├── AuthSection.tsx               # Landing — login/signup forms (551 lines)
│   ├── Subscribe.tsx                 # Landing — email form (134 lines)
│   ├── Footer.tsx                    # Landing — footer (121 lines)
│   ├── ScrollArrows.tsx              # Scroll navigation arrows (42 lines)
│   ├── ProtectedRoute.tsx            # Route guard — checks auth + role (25 lines)
│   ├── ui/
│   │   ├── Skeleton.tsx              # Shimmer loading placeholders (166 lines)
│   │   ├── EmptyState.tsx            # "No data" display (45 lines)
│   │   └── ErrorState.tsx            # Error with retry button (40 lines)
│   ├── admin/
│   │   ├── Sidebar.tsx               # Admin navigation sidebar
│   │   ├── Topbar.tsx                # Admin top bar with search & profile
│   │   └── Modal.tsx                 # Shared modal dialog (53 lines)
│   ├── passenger/
│   │   ├── PassengerSidebar.tsx      # Passenger navigation sidebar
│   │   └── PassengerTopbar.tsx       # Passenger top bar
│   └── driver/
│       ├── DriverSidebar.tsx         # Driver navigation sidebar
│       └── DriverTopbar.tsx          # Driver top bar
└── pages/
    ├── NotFound.tsx                  # 404 page
    ├── admin/       (8 files)        # AdminLayout + 7 page components
    ├── passenger/   (7 files)        # PassengerLayout + 6 page components
    └── driver/      (6 files)        # DriverLayout + 5 page components
```

### How Components Are Reused Across Roles

| Component | Used By | Purpose |
|-----------|---------|---------|
| `Modal` | Admin pages (BusManagement, RouteStops, UserManagement, ScheduleManagement) | CRUD dialogs |
| `Skeleton` variants | All 3 dashboards | Loading states |
| `EmptyState` | All 3 dashboards | "No data" fallback |
| `ErrorState` | All 3 dashboards | Error with retry |
| `ProtectedRoute` | App.tsx | Route protection for all 3 role trees |
| `useLoadingState` | All data pages | Loading state management |
| `useDocumentTitle` | All layouts + 404 page | Browser tab title updates |
| `ToastContext` | Any component in the app | User feedback notifications |

### Layout Pattern (Shared by All 3 Dashboards)

```
┌────────────────────────────────────────────┐
│ Topbar (hamburger + search + profile)      │
├──────────┬─────────────────────────────────┤
│          │                                 │
│ Sidebar  │   <Outlet /> (page content)     │
│  (nav)   │   with animate-page-in          │
│          │                                 │
└──────────┴─────────────────────────────────┘
```

The sidebar collapses to a hamburger overlay on mobile. Page content transitions with a fade-in animation on every route change.

---

## 6. Challenges I Faced & How I Solved Them

### Challenge 1: Managing 3 User Roles in One App

**The problem:** Three completely different dashboards need to coexist. A passenger should never see admin controls. A driver should be redirected if they try to access `/admin`.

**What I tried first:** Conditional rendering inside a single layout based on the user role. This quickly became a mess of `if/else` blocks and made it hard to maintain.

**Final solution:** Created `ProtectedRoute` — a small wrapper component that reads `AuthContext`, checks the user's role, and either renders the children or redirects. Each role has a completely separate route tree with its own layout, sidebar, and topbar:

```
/              → Landing (public)
/admin/*       → Protected: only role="admin"
/passenger/*   → Protected: only role="passenger"  
/driver/*      → Protected: only role="driver"
```

### Challenge 2: The Seat Reservation Page (400 Lines)

**The problem:** The reservation flow requires 3 sequential steps where the selection from Step 1 affects what Step 2 shows, and both feed into Step 3. Users need to go back and forth between steps without losing their selections.

**How I solved it:** Used `useState` for step tracking and selection state:

```tsx
const [step, setStep] = useState(1);
const [selectedRoute, setSelectedRoute] = useState(null);
const [selectedSeat, setSelectedSeat] = useState(null);
```

The visual seat map renders a grid of buttons. Each seat has a status (available/occupied/selected) that determines its color and click behavior. Clicking an available seat updates `selectedSeat` and changes the button's color to blue. Clicking an occupied seat does nothing.

### Challenge 3: Consistent Design Across 24 Pages

**The problem:** With 24 pages built over several phases, it's easy for spacing, colors, and component styles to drift apart.

**How I solved it:**
- Defined all colors once in the `@theme` block — never used raw hex values in components
- Used consistent patterns everywhere: `rounded-xl` for cards, `rounded-2xl` for modals, same padding values
- Built shared components (`Modal`, `Skeleton`, `EmptyState`, `ErrorState`) and reused them across dashboards
- All 3 dashboards use the same layout structure — same sidebar width, same topbar height, same content padding

### Challenge 4: Making Data Tables Work on Mobile

**The problem:** Admin tables have 5-6 columns — they don't fit on a 375px phone screen.

**How I solved it:**
- Wrapped every `<table>` in a `<div className="overflow-x-auto">` for horizontal scrolling
- Used responsive column visibility: `hidden sm:table-cell` hides less important columns on small screens
- Critical columns (name, status, actions) are always visible regardless of screen width
- On the passenger side, I used card layouts instead of tables for reservations — cards stack naturally on mobile

### Challenge 5: Initial Load Performance

**The problem:** With 18 dashboard pages imported eagerly, the JavaScript bundle was 932 KB at first build — too large for initial load, especially on slower connections.

**How I solved it:** Converted all dashboard page imports to `React.lazy()`. Now the browser only downloads the code for the page the user is actually visiting. The initial bundle dropped to 420 KB (55% reduction), and each dashboard page loads as a separate chunk on first navigation.

---

## 7. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#EFF6FF` | Backgrounds, hover states |
| `primary-100` | `#DBEAFE` | Light card backgrounds |
| `primary-200` | `#BFDBFE` | Borders, dividers |
| `primary-300` | `#93C5FD` | Secondary text |
| `primary-400` | `#60A5FA` | Icons, links |
| `primary-500` | `#3B82F6` | Primary buttons, focus rings |
| `primary-600` | `#2563EB` | Button hover states |
| `primary-700` | `#1D4ED8` | Active/pressed states |
| `primary-800` | `#1E3A5F` | Sidebar background, dark elements |
| `primary-900` | `#0F172A` | Headings, darkest text |
| `accent-400` | `#38BDF8` | Accent highlights, badges |
| `accent-500` | `#0EA5E9` | Accent buttons |
| `success-500` | `#22C55E` | Active status, confirmations |
| `warning-500` | `#F59E0B` | Pending status, warnings |
| `danger-500` | `#EF4444` | Errors, delete actions |

### Typography

All text uses **Inter** font family with these weights:
- **800 (Extra Bold):** Hero headline (48-60px)
- **700 (Bold):** Page headings (24-30px), stat numbers
- **600 (Semibold):** Subheadings, labels, badges
- **500 (Medium):** Navigation items, form labels
- **400 (Regular):** Body text, table cells (14px)

### Component Patterns

| Pattern | Tailwind Classes |
|---------|-----------------|
| Cards | `bg-white rounded-2xl border border-slate-200 p-5` |
| Primary buttons | `px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold` |
| Inputs | `px-4 py-2.5 rounded-xl border border-slate-200 outline-none` |
| Status badges | `rounded-lg px-2.5 py-1 text-xs font-semibold` with color variants |
| Page background | `bg-slate-50` (dashboards), `bg-white` (landing) |
| Sidebar | `bg-primary-800` with accent-400 active links |

---

## 8. What's Ready for Backend Integration

The frontend is a **complete prototype**. Every piece of mock data is clearly located inside its component file and ready to be replaced with API calls. Here's the migration path:

### Step 1 — Install HTTP Client

```bash
npm install axios
```

### Step 2 — Replace Mock Auth

Change `AuthContext.login()` from:
```tsx
// Check against MOCK_USERS object
const user = MOCK_USERS[email];
```
To:
```tsx
// Real API call
const response = await axios.post('/api/auth/login', { email, password });
const { token, user } = response.data;
localStorage.setItem('token', token);
```

### Step 3 — Replace Mock Data in Each Page

Every page has its data as a constant at the top. Replace with `useEffect` + API call:
```tsx
// Current: const buses = [{ id: 1, name: 'Bus A', ... }];
// Replace: useEffect(() => { axios.get('/api/buses').then(...) }, []);
```

### API Endpoints the Frontend Expects

| Area | Key Endpoints |
|------|--------------|
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| Buses | `GET /buses`, `POST /buses`, `PUT /buses/:id`, `DELETE /buses/:id` |
| Routes | `GET /routes`, `POST /routes` |
| Reservations | `GET /reservations`, `POST /reservations`, `PUT /reservations/:id/cancel` |
| Users | `GET /users`, `PUT /users/:id` |
| Schedule | `GET /schedule/weekly`, `POST /schedule` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read` |
| Reports | `GET /reports/stats`, `GET /reports/ridership` |

---

## 9. Final Project Numbers

| Metric | Value |
|--------|-------|
| Total source files | 52 TypeScript/TSX + 1 CSS |
| Total lines of code | 7,628 |
| Pages/views built | 24 |
| React components | 41 |
| Custom hooks | 3 |
| Context providers | 2 |
| CSS animations | 5 |
| Development phases | 11 |
| Production bundle (initial, gzipped) | ~125 KB |
| Lazy-loaded chunks | 20+ |
| TypeScript errors | 0 |
| Build warnings | 0 |

---

## 10. Live Demo & Test Credentials

| | |
|---|---|
| **Live URL** | [https://fleetmark.vercel.app/](https://fleetmark.vercel.app/) |
| **Repository** | [https://github.com/adilx15487/Fleetmark](https://github.com/adilx15487/Fleetmark) |
| **Deployment** | Vercel — auto-deploy on push to `main` |

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@fleetmark.com` | `admin123` |
| **Passenger** | `passenger@fleetmark.com` | `pass123` |
| **Driver** | `driver@fleetmark.com` | `driver123` |

### What to Explore

| Screen | What to Notice |
|--------|---------------|
| Landing page | Scroll-triggered animations, team card drag-scroll, responsive navbar |
| Admin Overview | Stat cards, area chart, activity table, quick action buttons |
| Passenger — Reserve a Seat | 3-step wizard with interactive seat map |
| Driver — Overview | Line chart, vehicle status, weekly summary cards |
| Any page on mobile (375px) | Hamburger sidebar, bottom-sheet modals, stacking grids |
| `/any-invalid-path` | Custom 404 page |

---

*Report written by Adil Bourji — Frontend Developer — February 2026*
