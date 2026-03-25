# Fleetmark Project Status Report
*Generated on 2026-03-23*

This report outlines the overarching goals of the Fleetmark project, details the specific accomplishments and ongoing tasks within the frontend, and identifies what remains missing to achieve 100% completion.

---

## 1. What We Are Doing in This Project (Overall Goal)

**Fleetmark** is a night shuttle seat reservation platform exclusively built for 1337 School (Morocco). The system solves logistical transportation needs by allowing students to authenticate via their **42 Intra OAuth** accounts, establish a default home station, and reserve seats on scheduled nightly shuttle buses running between 21:00 and 06:00. 

Additionally, we are building full management portals for logistics staff to oversee buses, assign routes, manage drivers, and track ridership metrics.

**Core Architecture:**
- **Frontend:** React 18, Vite, JSX, and a custom CSS variable design system (Vanilla CSS). No external component libraries.
- **Backend:** Django REST Framework with SimpleJWT and PostgreSQL.
- **Roles:** `STUDENT` (Passengers), `LOGISTICS_STAFF` (Admins), and `DRIVER`.

---

## 2. What We Are Doing in the Frontend (Progress)

We have executed a comprehensive rebuild of the frontend to achieve visual parity with the original design specifications while ensuring responsiveness and theme support.

### Key accomplishments to date:
- **Full-Width Edge-to-Edge Layout:** Re-engineered the core layout ([index.html](file:///home/phoenix/Desktop/aaaa/index.html), [globals.css](file:///home/phoenix/Desktop/aaaa/src/styles/globals.css), and [Landing.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/Landing.jsx)) to enforce strict 100% width properties. Extracted max-width constraints out of wrapper tags (`<main>`) and placed them safely inside internal `<section>` `div` wrappers so backgrounds stretch seamlessly.
- **Dark/Light Mode Persistence:** Rewrote [tokens.css](file:///home/phoenix/Desktop/aaaa/src/styles/tokens.css) color variables to ensure perfect contrast and text legibility in both light (`:root`) and dark modes. Integrated the [DarkModeToggle](file:///home/phoenix/Desktop/aaaa/src/components/ui/DarkModeToggle.jsx#5-15) component into the Navigation bar with `localStorage` persistence under the `fleetmark_theme` key.
- **Authentication Handshake:** Investigated the OAuth process. The backend successfully exposes `/api/v1/auth/42/login/`. We've fortified the [AuthCallback.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx) receiver to cleanly output authorization errors when users navigate there manually.
- **Environment & Build Setup:** Validated that the [vite.config.js](file:///home/phoenix/Desktop/aaaa/vite.config.js) properly proxies `/api` to `http://localhost:8000` (allowing local login flows to avoid CORS) and successfully verified zero-error production compilation (`npm run build`). All pages are now wired to real API calls instead of mock data.
- **Internationalization (i18n):** Hooked the `LanguageSwitcher` to support English, French, and Arabic (RTL) safely.

---

## 3. What Is Missing At This Moment

While the critical architecture and Landing page are structurally sound, the following items are missing or require active validation:

### A. Missing Features
- **Driver Portal:** The `/driver` route currently just renders a [ComingSoon](file:///home/phoenix/Desktop/aaaa/src/pages/driver/ComingSoon.jsx#4-15) component. The actual driver interface needs to be built from scratch.
- **Full Translation Dictionaries:** While the landing page has a stable translation dictionary (`text.navHow`, `text.heroA`, etc.), other pages like the student/admin dashboards are mostly English. Translations need to be expanded.
- **Stock Images / Assets:** We purposefully omitted stock photo URLs for the "Team" section (using generated gradients instead). If real photos are required, those assets are missing.

### B. Crucial Testing & Validation (Pending)
- **End-to-End OAuth Completion:** We must manually test a real authentication loop. Click "Sign in with 42", allow the Intra redirect, and verify that [AuthCallback.jsx](file:///home/phoenix/Desktop/aaaa/src/pages/AuthCallback.jsx) successfully exchanges the `?code=` for a JWT and redirects the user to `/passenger` or `/admin`.
- **Passenger Dashboard Interactive Parity:** We need to verify that the "Reserve a Seat" flow accurately posts to the backend and reflects on `/passenger/history` dynamically.
- **Admin Dashboard Integration:** Ensure [AdminLayout](file:///home/phoenix/Desktop/aaaa/src/components/layout/AdminLayout.jsx#15-171) and CRUD operations (managing Trips, Buses, Routes via GET/POST/PUT/DELETE) perfectly map to the fields dictated by the Django backend (e.g., `station`, `plate`, `seat_capacity`).
- **Responsive Mobile Layouts:** We must confirm that the edge-to-edge layout constraints flex elegantly on narrow viewports without horizontal scrolling breakage inside the inner `1200px` content wrappers.
