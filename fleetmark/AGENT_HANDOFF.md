# FleetMark frontend — handoff for the next agent

Use this file to onboard another AI or developer. Update it when you finish a chunk of work.

## Project

- **App:** FleetMark — university bus fleet management (admin + student/passenger).
- **Stack:** React 19 + Vite, CSS variables (`tokens.css`, `globals.css`, `components.css`), no Tailwind in package (mostly custom CSS + inline styles).
- **Data:** Frontend talks to `API_BASE` from `src/services/api.js`; some features use `localStorage` (announcements, tour, bus–station map, etc.).
- **Entry:** `src/main.jsx` → `App.jsx` (routes). Layouts: `components/layout/AdminLayout.jsx`, `StudentLayout.jsx`.

## What was already implemented (recent UI/audit pass)

High-level goals were: motion, mobile, a11y, accents (teal admin / indigo student), route map SVG, empty states, loading states, reservation success animation, onboarding polish.

| Area | What to look at |
|------|------------------|
| Entrance / reduced motion | `src/styles/globals.css` — `fadeInUp`, `.animate-in`, `prefers-reduced-motion`, modal keyframes, skip link, landing mobile grids |
| Landing | `src/pages/Landing.jsx` — splash (`FleetmarkLogoAnimation`), static hero wordmark, `HeroBusIllustration`, hamburger + `.landing-mobile-menu`, `RevealSection` + `src/hooks/useInView.js`, section ids `#how-it-works`, `#schedule`, `#team`, `#get-started`, Get Started card (dark + gradient border) |
| Count-up stats | `src/hooks/useCountUp.js` — `TripStatCard` in `src/pages/admin/Trips.jsx` (do **not** call hooks inside `.map()`); `PassengerStatCard` in `src/pages/passenger/PassengerOverview.jsx` |
| Route map | `src/components/ui/RouteMap.jsx` — used in `PassengerOverview.jsx`, `TripTracker.jsx` |
| Modals | `src/components/ui/Modal.jsx` — enter/exit animation + delayed unmount; many pages still use **inline** `modal-backdrop-anim` divs (Trips, BusManagement, etc.) |
| Onboarding tour | `src/components/ui/OnboardingTour.jsx` — focus trap, step transitions, `role="dialog"` |
| Reserve flow | `src/pages/passenger/ReserveASeat.jsx` — `ReserveSeatSkeleton`, 1.5s `SuccessCheckmark` overlay then toast, inline spinner on button |
| Empty states | `src/components/ui/AdminEmptyState.jsx` — trips / buses / routes variants |
| Error boundary | `src/components/ui/ErrorBoundary.jsx` — try again + home link |
| Tables a11y | `scope="col"` added on main admin tables + `SkeletonTable` |
| Layout skip link | `#main-content` on `<main>` in both layouts |
| Tokens | `--dim` contrast in `src/styles/tokens.css`; admin/student `--accent` overrides inline on layout roots |

## Bugs fixed worth knowing

- **`Trips.jsx`:** Previously called `useCountUp` inside `.map()` (invalid). Fixed via **`TripStatCard`** component.
- **`BusManagement.jsx`:** Create/edit modal was not wrapped in `{open ? (…) : null}` — JSX was broken; fixed.

## Known issues / environment

1. **`npm run build` / `dist/`:** If build fails with **EACCES** on `dist/`, files there may be owned by root. Fix: `sudo chown -R "$USER" fleetmark/frontend/dist` or remove `dist` and rebuild. `vite.config.js` is standard (output `dist/`).
2. **`Modal.jsx`** is not wired everywhere — Trips/Buses and others still duplicate modal markup; consolidating would be a follow-up.
3. **Legacy components** under `src/components/` (`TripManager.jsx`, `FleetManager.jsx`, etc.) may still have `<th>` without `scope` if those UIs are still reachable.

## Suggested next tasks (pick based on product priority)

1. **Unify modals** — Replace inline modal divs with `Modal.jsx` (or a small wrapper) so open/close animation and focus are consistent.
2. **Remaining `<th>`** — Grep `src/components/*.jsx` and any old managers for `<th` without `scope="col"`.
3. **E2E / smoke** — Click through `/`, `/auth` flows, `/passenger/*`, `/admin/*` at 375 / 768 / 1024 widths; confirm no console errors.
4. **Build pipeline** — Ensure CI runs `npm run build` with a clean, writable `dist/`.
5. **Optional:** Add `build-out` or `emptyOutDir` strategy only if `dist` permissions keep breaking automated builds.

## Commands

```bash
cd fleetmark/frontend
npm install
npm run dev    # default port from vite.config.js (e.g. 5174)
npm run build  # outputs to dist/
```

## Files another agent should read first

- `fleetmark/frontend/src/App.jsx` — routes
- `fleetmark/frontend/src/styles/globals.css` — global animations and a11y
- `fleetmark/frontend/src/styles/tokens.css` — design tokens
- `ui_audit.md` (repo root) — original audit scores / intent, if present

---

*Last updated: handoff after UI audit implementation pass. Edit this file when you complete new work.*
