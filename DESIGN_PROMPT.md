# FLEETMARK — Complete UI Design Reference Prompt

> Feed this entire document to any AI design tool (Penpot, Figma, Relume, v0, etc.)
> to generate a pixel-accurate visual design of the Fleetmark frontend.

---

## PROJECT OVERVIEW

**App:** Fleetmark — Night Shuttle Seat Reservation Platform  
**Client:** 1337 School, Ben Guerir, Morocco  
**Auth:** 42 Intra OAuth (only 1337 School members can sign in)  
**Users:** Students (role: `passenger`) + Staff/Admin (role: `admin`)  
**Style:** Linear.app / Vercel-inspired — calm, professional, spacious  
**Modes:** Light Mode + Dark Mode (toggle in navbar/topbar)  
**Languages:** English (primary), French, Arabic (RTL — landing page only)  
**Font:** Inter (all weights 300–800), Cairo (Arabic RTL fallback)  
**Icon library:** Lucide React (line icons, 1.5px stroke)  
**Animation:** Framer Motion — slide-in from alternating left/right, flip cards  
**Charts:** Recharts (LineChart, PieChart)  

---

## DESIGN TOKENS (CSS Custom Properties)

### Light Mode Colors

| Token                | Hex       | Usage                              |
|---------------------|-----------|------------------------------------|
| `--bg-primary`       | `#F8F9FB` | Page background                   |
| `--bg-secondary`     | `#F1F3F7` | Section backgrounds, sidebar      |
| `--bg-tertiary`      | `#E8ECF2` | Hover states, input backgrounds   |
| `--bg-card`          | `#FFFFFF` | Card backgrounds                  |
| `--bg-card-hover`    | `#F8F9FB` | Card hover state                  |
| `--border-subtle`    | `#E2E8F0` | Light borders, dividers           |
| `--border-default`   | `#CBD5E1` | Input borders, card borders       |
| `--border-strong`    | `#94A3B8` | Strong emphasis borders           |
| `--text-primary`     | `#0F172A` | Headings, primary text            |
| `--text-secondary`   | `#475569` | Body text, descriptions           |
| `--text-tertiary`    | `#94A3B8` | Placeholders, captions            |
| `--text-disabled`    | `#CBD5E1` | Disabled text                     |
| `--accent-primary`   | `#0EA5E9` | Primary buttons, links, active    |
| `--accent-hover`     | `#0284C7` | Button hover                      |
| `--accent-subtle`    | `#E0F2FE` | Light accent backgrounds          |
| `--accent-text`      | `#0369A1` | Accent text on subtle bg          |
| `--success`          | `#10B981` | Success badges, confirmed         |
| `--success-subtle`   | `#D1FAE5` | Success background                |
| `--warning`          | `#F59E0B` | Warning badges                    |
| `--warning-subtle`   | `#FEF3C7` | Warning background                |
| `--danger`           | `#EF4444` | Error, delete, cancel             |
| `--danger-subtle`    | `#FEE2E2` | Error background                  |

### Dark Mode Colors

| Token                | Hex                       | Usage                     |
|---------------------|---------------------------|---------------------------|
| `--bg-primary`       | `#0D1117`                | Page background           |
| `--bg-secondary`     | `#161B22`                | Section, sidebar, cards   |
| `--bg-tertiary`      | `#1C2333`                | Hover states              |
| `--bg-card`          | `#161B22`                | Card backgrounds          |
| `--border-subtle`    | `#21262D`                | Light borders             |
| `--border-default`   | `#30363D`                | Default borders           |
| `--border-strong`    | `#484F58`                | Strong borders            |
| `--text-primary`     | `#F0F6FC`                | Headings                  |
| `--text-secondary`   | `#8B949E`                | Body text                 |
| `--text-tertiary`    | `#6E7681`                | Captions                  |
| `--accent-primary`   | `#38BDF8`                | Accent in dark mode       |
| `--accent-hover`     | `#7DD3FC`                | Accent hover              |
| `--accent-subtle`    | `rgba(12, 74, 110, 0.2)` | Subtle accent bg          |
| `--nav-bg`           | `rgba(13, 17, 23, 0.90)` | Navbar glass bg           |

### Shadows

| Token        | Value                                                                      |
|-------------|----------------------------------------------------------------------------|
| `shadow-sm`  | `0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)`           |
| `shadow-md`  | `0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)`          |
| `shadow-lg`  | `0 8px 24px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.06)`          |
| `shadow-xl`  | `0 16px 48px rgba(15,23,42,0.12)`                                         |

### Typography Scale

| Level  | Font               | Size   | Weight | Sample Text                              |
|--------|--------------------|--------|--------|------------------------------------------|
| H1     | Inter              | 72px   | 800    | `Smart Transportation.`                  |
| H2     | Inter              | 48px   | 800    | `Meet the Team Behind`                   |
| H3     | Inter              | 20px   | 700    | `Bus Management`                         |
| Body   | Inter              | 16px   | 400    | `The night shuttle reservation platform` |
| Small  | Inter              | 13px   | 400    | `Only 1337 School members can sign in`   |
| Badge  | Inter              | 11px   | 600    | `STAFF`                                  |
| Tiny   | Inter              | 10px   | 600    | `@username42`                            |

### Spacing: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96px

### Border Radius: 4 / 8 / 12 / 16 / 20 / 100px (pill)

### Sidebar Tokens (Light)
- Background: `#F1F3F7`
- Border right: `1px solid #E2E8F0`
- Logo icon bg: `#E0F2FE`, icon: `#0EA5E9`
- Nav item text: `#475569`
- Nav item active bg: `#E0F2FE`, text: `#0EA5E9`
- Nav item hover bg: `#E8ECF2`
- Profile badge bg: `#E0F2FE`, text: `#0EA5E9`

---

## REUSABLE COMPONENTS

### Buttons

**Primary Button**
- Height: 44px, padding: 10px 20px
- Background: `#0EA5E9`, border-radius: 8px
- Text: white, 14px, weight 600
- Hover: bg `#0284C7`, shadow `0 4px 12px rgba(14,165,233,0.3)`, translateY(-1px)
- Active: scale(0.98)

**Primary Large (Hero CTA)**
- Height: 56px, padding: 16px 32px
- Border-radius: 16px
- Text: white, 18px, weight 700
- Shadow: `0 4px 20px rgba(14,165,233,0.3)`

**Secondary Button**
- Height: 44px, padding: 10px 20px
- Background: transparent (or `--bg-tertiary`)
- Border: 1px solid `#CBD5E1`, radius: 8px
- Text: `#0F172A`, 14px, 600
- Hover: bg `--bg-tertiary`, border `--border-strong`

**Danger Button**
- Background: `#EF4444`, text: white
- Hover: bg `#DC2626`
- Shadow: `0 4px 12px rgba(239,68,68,0.25)`

**Ghost Button**
- Background: transparent, no border
- Text: `#0EA5E9`
- Hover: bg `--bg-tertiary`

### Inputs

**Default Input**
- Width: 100%, height: 44px
- Background: `--bg-card` (white)
- Border: 1px solid `#CBD5E1`, radius: 8px (some: 12px)
- Padding: 10px 14px
- Placeholder: `#94A3B8`
- Focus: border `#0EA5E9`, shadow `0 0 0 3px rgba(14,165,233,0.12)`
- Error: border `#EF4444`, red error text below 12px

**Search Input**
- Same as default + Lucide `Search` icon (16px) on the left side
- Left padding: 40px for icon space

### Badges / Pills

**Accent Badge (default)**
- Background: `#E0F2FE`, text: `#0369A1`
- Padding: 4px 12px, radius: 100px
- Font: 12px, weight 500

**Role Badges**
- Student: bg `#E0F2FE`, text `#0369A1` — "1337 Student"
- Admin: bg `#EDE9FE`, text `#7C3AED` — "Admin"  
- Staff: bg `#0F172A`, text white — "STAFF"
- Driver: bg `#FEF3C7`, text `#D97706` — "Driver"

**Status Badges**
- Active/Confirmed: bg `#D1FAE5`, text `#059669`, border `#A7F3D0`
- Pending/Created: bg `#DBEAFE`, text `#2563EB`, border `#BFDBFE`
- Cancelled: bg `#FEE2E2`, text `#DC2626`, border `#FECACA`
- Maintenance: bg `#FEF3C7`, text `#D97706`, border `#FDE68A`
- Inactive: bg `#F1F5F9`, text `#64748B`, border `#E2E8F0`

**Live Indicator**
- bg `#D1FAE5`, text `#059669`
- TrendingUp icon + "Live"
- Font: 12px, weight 600

### Cards

**Base Card**
- Background: white (`--bg-card`)
- Border: 1px solid `#E2E8F0`
- Border-radius: 16px (some: 12px)
- Shadow: `shadow-sm`
- Padding: 20–24px
- Hover: shadow-md, border `--border-default`, translateY(-2px)

**Stat Card**
- Width: flex, min 200px
- Content: icon circle (44px, colored bg) + number (24px, 700) + label (13px, `#94A3B8`)
- Top-right: "Live" green badge with TrendingUp icon

**Team Member Card**
- Width: 260px fixed, flex-shrink: 0
- Background: white, radius: 16px, border: `#E2E8F0`
- Padding: 24px
- Content stacked centered:
  - Avatar circle: 72px, bg `#F1F5F9`, border 2px `#E2E8F0`, green dot bottom-right (10px, `#10B981`)
  - Name: 16px, weight 700, `#0F172A`
  - Role badge: bg `#EFF6FF`, text `#0369A1`, 11px, 600, pill
  - Description: 13px, `#475569`, line-height 1.6
  - Social icons row: LinkedIn (blue hover), GitHub (dark hover), WhatsApp (green hover) — each 36px rounded-xl

### Navigation

**Landing Navbar**
- Height: 64px (desktop), position: fixed top
- When not scrolled: transparent background
- When scrolled: bg `rgba(248,249,251,0.85)`, backdrop-filter: blur(20px), border-bottom: `#E2E8F0`, shadow-sm
- Left: Bus icon (in rounded-xl padded square, blue) + "Fleetmark" (20px, 700) + "1337 School" (10px, `#94A3B8`)
- Center: About | Features | Get Started | Subscribe — 14px, 500, `#475569`
- Right: Language switcher (EN/FR/AR buttons group) + Theme toggle (Moon/Sun icon, 36px) + CTA buttons

**Language Switcher**
- Container: bg `--bg-tertiary`, border 1px `--border-subtle`, rounded-lg, padding 4px
- Each button: 32px height, rounded-md, flag emoji + label
- Active: bg `#0EA5E9`, text white, shadow-sm
- Inactive: text `--text-secondary`

**Theme Toggle**
- 36px × 36px button, rounded-lg
- Border: 1px solid `--border-default`
- Icon: Moon (light mode) / Sun (dark mode) with rotation animation
- Hover: border accent, color accent

**Admin Sidebar (Desktop)**
- Width: 240px (expanded), 72px (collapsed)
- Background: `#F1F3F7` (var(--sidebar-bg))
- Border-right: 1px solid `#E2E8F0`
- Logo area: 64px height, Bus icon in accent-subtle square + "Fleetmark" text
- Nav items: 40px height, icon (20px) + label, rounded-xl
  - Default: text `#475569`
  - Active: bg `#E0F2FE`, text `#0EA5E9`
  - Hover: bg `#E8ECF2`
- Bottom: user avatar circle (36px) + name (14px, 600) + role badge + @login42

**Admin Sidebar Nav Items:**
- 📊 Overview
- 🚌 Buses
- 🗺️ Routes
- 👥 Users
- 📅 Schedule
- 📈 Reports
- 🔔 Notifications

**Student Sidebar Nav Items:**
- 🏠 Overview
- 🎫 Reserve a Seat
- 📋 My Reservations
- 🗺️ Routes & Stops
- 🔔 Notifications (with unread count badge)
- ⚙️ Profile

**Topbar**
- Height: 64px, sticky top
- Background: `--bg-card`, border-bottom: `--border-subtle`, backdrop-blur
- Left: hamburger menu (mobile only) + page title (20px, 700)
- Right: search input (hidden sm, 224px) + language switcher + theme toggle + notification bell (with red count badge) + profile avatar dropdown

**Profile Dropdown:**
- Width: 192px, rounded-xl, shadow-xl
- Header: name + email
- Items: Profile, Settings
- Footer: Sign Out (red text)

### Modals

**Modal Overlay:** Full screen, bg `rgba(0,0,0,0.4)`, backdrop-blur
**Modal Card:**
- Width: 480px (md), 576px (lg)
- Background: white, radius: 16px (desktop) / 16px top only (mobile bottom sheet)
- Shadow: shadow-xl
- Header: title (18px, 700) + X close button (32px rounded-lg)
- Body: form content, padding 20-24px
- Footer: Cancel (secondary) + Confirm (primary) buttons

### Empty States

- Container: white card, rounded-2xl, border, padding 48px, centered
- Icon: 64px square, rounded-2xl, bg `#F8FAFC`, icon 32px `#CBD5E1`
- Title: 16px, 700
- Subtitle: 14px, `#94A3B8`, max-width 280px
- Action: primary button below

### Error States

- Same layout as empty state
- Icon: AlertOctagon in red-50 bg
- Border: `#FEE2E2`
- Button: red "Try Again" with RefreshCw icon

### Section Divider
- 1px line, gradient: transparent → `--border-subtle` → transparent
- Max-width: 800px, centered

### SnakeCard Animation Wrapper
- Each card/section slides in from alternating left/right
- Even index → slide from left (-60px)
- Odd index → slide from right (+60px)
- Duration: 0.55s, ease: `[0.25, 0.46, 0.45, 0.94]`
- Staggered delay: `(index % 4) * 0.08s`
- Mobile: simple fade-in only

---

## PAGE LAYOUTS

### PAGE: Landing Page (Single scroll, 1440×auto)

**Section 1 — Navbar** (1440×64px)
- Fixed top, glassmorphism on scroll
- Logo: Bus icon square + "Fleetmark" + "1337 School"
- Links: About | Features | Get Started | Subscribe
- Right: EN/FR/AR switcher + Moon toggle + "Sign Up" CTA

**Section 2 — Hero** (1440×~700px, full viewport height)
- Background: radial gradient `linear-gradient(135deg, #EFF6FF 0%, #F8F9FB 40%, #F0F9FF 100%)`
- Subtle 60px grid pattern overlay (opacity 4%)
- Two columns on desktop (text left, card right)

- LEFT (centered vertically):
  - Pill badge: blue dot (animated pulse) + "Now Accepting Reservations" — bg `#E0F2FE`, text `#0369A1`
  - H1 (3 lines, 72px, 800):
    - "Smart Transportation." — `#0F172A`
    - "Reserved for You." — gradient text `#38BDF8` → `#0284C7`
  - Paragraph: "The night shuttle seat reservation platform built for 1337 School, Ben Guerir." — 18px, `#475569`
  - Button row (12px gap):
    - "Get Started Free →" — primary large CTA with ArrowRight icon
    - "Learn More" — secondary button
  - Stats row (48px below buttons, 3 columns):
    - "500+" / "Students" — number: 28px 800, label: 12px uppercase `#94A3B8`
    - "25+" / "Routes"
    - "99%" / "10PM — 6AM"

- RIGHT:
  - Dashboard preview card (floating, ~480px wide):
    - White card, radius 24px, shadow-lg + slight blue glow
    - Mac dots (red/yellow/green, 12px circles)
    - "Fleetmark Dashboard" title bar
    - Route card inside: "Night Shuttle — Route 1", "OCP Saka → Nakhil → Kentra → La Gare", green "Active" badge
    - 3 mini stat blocks: "32 Seats Left", "11:00 PM Tonight", "19 Stops"
    - 2 info blocks: "Seat Reserved — Seat 14A" + "ETA — 12 minutes"
    - Floating badge (top-right, rotated): "Seat Confirmed! ✓ Route 1 — Seat 14A" — white card, shadow-lg, bouncing

**Section 3 — Features** (1440×auto)
- Background: `#F8F9FB` (`--bg-primary`)
- Header centered: pill "What This Project Is About" + H2 "Solving Real Transport" / "Problems with Smart Solutions" (blue gradient) + description paragraph
- 2×2 Grid of flip cards (max-width 896px centered):
  - Each card: ~340×320px
  - FRONT: white card, shadow-sm. Red icon circle (56px). "PROBLEM" red label. Problem text. "Click to reveal →" hint
  - BACK: blue gradient bg. "SOLUTION" green label. Solution text. Green CheckCircle icon.
  - Cards flip on click (3D rotateY, 0.6s, cubic-bezier)
  - Problems: "Overcrowded buses with no capacity control" / "Unfair seat allocation" / "No route visibility" / "Poor communication"
  - Solutions: "Smart seat reservation" / "Auto bus assignment by home stop" / "Full route visibility" / "Instant notifications"
- "Flip all cards" button below

**Section 4 — Who We Are / Team** (1440×auto)
- Background: `#F1F3F7` (`--bg-secondary`)
- Header: pill "Who We Are" + H2 "Meet the Team Behind" / "Fleetmark" (blue gradient)
- Horizontal scrollable card row (260px each, 20px gap):
  - Members:
    1. Adil Bourji — Frontend Developer
    2. Mohamed Lahrech — Backend Developer
    3. Abderrahman Chakour — Backend Developer
    4. Ayoub El Haouti — Backend + Testing & Debugging
    5. Aamir Tahtah — DevOps & Security
  - Each: DiceBear avatar circle (72px) + green dot + name + role pill + description + LinkedIn/GitHub/WhatsApp icons
- "← scroll to see all team members →" hint below

**Section 5 — Auth / Get Started** (1440×auto)
- Background: `#F1F3F7` (`--bg-secondary`)
- Two columns:
  - LEFT: pill "Get Started" + H2 "Your Ride Awaits." / "Join Fleetmark Today." (blue) + description + 3 steps list (numbered in accent squares) + "🏫 Currently serving 1337 School, Ben Guerir" badge
  - RIGHT: Auth card (400px, white, radius 24px, shadow-lg, padding 40px):
    - 42 logo: 64px square, bg `#111827`, white "42" text, radius 16px
    - "Sign in with 42 Intra" — 20px, 700
    - "Use your 42 account to access Fleetmark" — 14px, `#94A3B8`
    - "Sign in as Student" button: bg `#0EA5E9`, white text, GraduationCap icon, full width, 48px height
    - "Sign in as Staff" button: bg `--bg-tertiary`, border `--border-default`, Shield icon, full width
    - Disclaimer: "Only 1337 School members can sign in..." — 12px, `#94A3B8`, centered

**Section 6 — Subscribe** (1440×auto)
- Background: `#F8F9FB` (`--bg-primary`)
- Centered: Bell icon (64px square, accent-subtle bg) + H2 "Stay Updated" + description + email input + "Subscribe" button row + "No spam, ever." tiny text

**Section 7 — Footer** (1440×auto)
- Background: `#F1F3F7` (`--bg-secondary`), border-top: `--border-subtle`
- 4-column grid: Brand (logo + tagline) | Quick Links | Resources | Legal
- Bottom bar: copyright + "Built with ❤️ in Morocco 🇲🇦"

---

### PAGE: Auth Callback (1440×900)

Three states, all centered on page with `--bg-primary` background:

**State 1 — Authenticating:**
- Card: white, radius 16px, shadow-lg, padding 40px, max-width 384px
- 42 logo square (64px) at top
- Blue spinner (Loader2 icon, animated spin)
- "Authenticating with 42" — 18px, 700
- "Verifying your 42 Intra credentials…" — 14px, `#94A3B8`

**State 2 — Success:**
- Green CheckCircle2 icon (40px)
- "Authenticated!" — 18px, 700
- "Redirecting you now…" — 14px, `#94A3B8`

**State 3 — Error:**
- Red XCircle icon (40px)
- "Authentication Failed" — 18px, 700
- Error message in red
- "Back to Home" primary button

---

### PAGE: Onboarding — Pick Home Stop (1440×900)

- Centered card, max-width 512px, radius 24px, shadow-lg
- Header: MapPin icon (28px) in accent-subtle square + "Welcome, {name}! 👋" (24px, 800) + subtitle
- Search input with Search icon
- Scrollable stop list (max-height 288px):
  - 26 stops total across 2 bus routes
  - Bus 1 stops (Ben Guerir → 1337): Gare Routière Ben Guerir, Place du Marché, Hay Essalam, Quartier Administratif, Lycée Qualifiant, Centre de Santé, Mosquée Al Mohammadi, Rond-Point Central (shared), Station Total, Zone Industrielle, Complexe Sportif, Hay Al Massira, Entrée UM6P (shared), Parking UM6P, Résidence Étudiante, Bibliothèque UM6P, Campus 1337, Forum UM6P
  - Bus 2 stops (Marrakech → 1337): Gare Routière Marrakech, Bab Doukkala, Avenue Mohammed V, Place Jemaa el-Fna, Guéliz Centre, Route de Casablanca
  - Each stop: MapPin icon + name + bus assignment pills ("Bus 1", "Bus 2" or both)
  - Selected: bg `--accent-subtle`, border `--accent-primary`, blue text, checkmark circle
- "Continue →" primary button (disabled until selected)

---

### PAGE: Admin Dashboard — Layout

- Sidebar: 240px left (collapsible to 72px)
- Topbar: 64px sticky
- Main content: padding 24px, bg `--bg-primary`
- Page transition: fade-in + translateY(6px) animation

**Admin — Overview**
- 4 stat cards row: Total Buses | Active Routes | Total Users | Reservations — each with colored icon circle + "Live" green badge
- 3 info strips: "Operating Hours: 10PM → 6AM" (indigo) | "Break Period: 2AM → 3AM" (amber) | "Active Routes: N routes" (emerald)
- Charts row (60/40 split):
  - Left: "Daily Reservations" line chart (blue line, rounded tooltips)
  - Right: "Bus Capacity Usage" donut chart (4 colored segments)
- Full-width "Recent Reservations" table:
  - Columns: ID | Student | Route | Date | Status badge | Actions
  - Rounded-2xl container, hover rows, zebra headers

**Admin — Bus Management**
- Header: "All Buses" H2 + count + "+ Add New Bus" primary button
- Search input
- Table: Bus ID (mono font, blue) | Matricule (bold) | Capacity | Status badge (Active green) | Actions (edit pencil + delete trash)
- Add Bus Modal: form with Matricule input + Capacity number input + Status select + Cancel/Create buttons

**Admin — Route & Stops**
- Route cards with expandable stop lists
- Warning banner if issues detected

**Admin — User Management**
- Header: "All Users" + count + "Create User" button
- Filter bar: search input + role dropdown (All/Admin/Student/Driver)
- Table: User (avatar + name) | Email | Role badge (color-coded) | Organization | Status (green dot + "Active") | Joined | Actions (edit/delete)
- Create User Modal: Username + Email + Password + Role select

**Admin — Schedule Management**
- Operating hours config
- Timeline preview
- Weekly schedule grid

**Admin — Reports**
- Stats cards + charts (line + bar) + data table

**Admin — Notifications**
- Header + filters + notification list (coming soon states for some features)

---

### PAGE: Student Dashboard — Layout

- Same sidebar/topbar pattern as admin
- Schedule status banner at top of every page
- Info banner: "Official shuttle stops only. No pick-up or drop-off outside designated points."

**Student — Overview**
- Welcome banner: gradient bg (primary-700 → primary-900), white text:
  - "Good evening, {name} 👋" — 28px, 700
  - "Here's your shuttle status for tonight." — 14px, `text-primary-200`
  - Right side: next trip card (glassmorphic: bg white/10, backdrop-blur, border white/20):
    - Trip time + bus + stop info
    - View all / Cancel links
  - "Reserve a Seat" CTA button with Ticket icon
- Reservation counter: progress bar (green/amber/red) + list of confirmed trips
- 4 stat cards: Total Rides | Tonight usage | Past Nights | Home Stop
- Notifications section (empty state with Bell icon)

**Student — Reserve a Seat**
- If not onboarded: shows StudentOnboarding component (stop selection flow)
- Header card: gradient bg with bus info (bus name + home stop + tonight usage counter) — 3 columns with icons
- Warning banners (amber for 1 remaining, red for limit reached)
- Operating status strip: green "Buses running" / amber "Break" / red "Offline"
- Time slot grid (3 columns):
  - Each slot: rounded-2xl button card showing time (12-hour format) + seat count + status
  - States:
    - **Open** (reservable): white bg, emerald border, green ring, "Reserve" text
    - **Reserved** (yours): emerald-50 bg, green border, checkmark, "Reserved ✓"
    - **Locked** (not yet open): blue-50 bg, lock icon, countdown timer "Opens in Xm Ys"
    - **Break**: amber-50 bg, pause icon, "Break"
    - **Passed**: slate-50 bg, dimmed, "Passed"
    - **Full**: red-50 bg, "Full" red text
- Confirmation dialog: slot details + Confirm/Cancel buttons

**Student — My Reservations**
- Tonight's section: progress bar + active reservation cards (green: clock + time + bus + stop + Confirmed badge + cancel X) + cancelled cards (gray, strikethrough)
- Past Nights section: grouped by date, each showing time + stop + bus + status badge
- Cancel modal: warning message + Keep It / Cancel Reservation buttons

**Student — Routes & Stops**
- Search filter input
- Route cards (expandable):
  - Header: MapPin icon circle + "Route #N — {direction}" + Active badge + bus/capacity info
  - Expanded: 3 info blocks (direction, capacity, bus matricule) + "Reserve a Seat" button

**Student — Profile Settings**
- Avatar section: DiceBear avatar (80px) + camera edit button + name + email + "1337 Student" badge
- Transport settings (if onboarded): home stop + assigned bus + tonight usage progress bar + "Change →" link
- Personal info form: name (editable) + email (readonly, gray bg) + phone + school/campus (readonly)
- Password section (hidden since 42 OAuth)
- Change home stop modal: search input + scrollable stop list + bus selection for shared stops + confirm

**Student — Notifications**
- Header + filters
- Notification list (mostly empty/coming soon placeholders)

---

### PAGE: Mobile Views (390×844, iPhone 14)

**Mobile Landing:**
- Navbar: logo left, hamburger right, theme toggle
- Mobile menu: slide-down, full-width, links stacked, language switcher, CTA buttons
- Hero: stacked vertically — badge, title (smaller 40px), subtitle, description, buttons full-width, stats row, card below text
- Features: 1-column cards
- Team: horizontal scroll, same cards
- Auth: full-width card
- Subscribe: stacked input + button

**Mobile Dashboard:**
- Sidebar: slide-out drawer from left (hamburger trigger), overlay bg-black/50
- Topbar: hamburger + title + bell + avatar (no search on small screens)
- Content: single column, cards stack, tables horizontally scroll
- Stats: 2×2 grid

---

### PAGE: Dark Mode

Apply all dark mode tokens. Key differences:
- Page bg: `#0D1117`
- Cards/sidebar: `#161B22`
- Text: `#F0F6FC` primary, `#8B949E` secondary
- Borders: `#21262D` subtle, `#30363D` default
- Accent: `#38BDF8`
- Shadows use `rgba(0,0,0,0.3–0.6)` instead of slate-based
- Navbar glass: `rgba(13,17,23,0.90)`
- Success/warning/danger slightly adjusted for dark bg contrast

---

## LOADING STATES

**Skeleton Loaders (shimmer animation):**
- SkeletonCard: rounded-2xl, gray shimmer blocks for icon (44px), number (28px wide), label
- SkeletonTable: header row + N rows of shimmer blocks
- SkeletonChart: full chart area as one shimmer block
- Animation: `background-position 200% → -200%` gradient slide, 1.5s ease-in-out loop

**Page Loader:**
- Centered spinner: 32px circle, border-3, border-primary-200, border-top-primary-600, animate-spin

---

## ANIMATIONS & TRANSITIONS

- **Theme transitions:** All elements transition bg/border/color over 0.25s ease
- **Page transitions:** fade-in + translateY(6px), 0.3s ease-out
- **Card hover:** shadow-md, border-default, translateY(-2px), 0.2s
- **Button hover:** translateY(-1px), 0.2s
- **Button press:** scale(0.98)
- **Modal enter:** scale(0.95) → scale(1), opacity 0→1, 0.2s
- **Toast enter:** translateX(100%) → translateX(0), 0.3s
- **SnakeCard:** alternating left/right slide-in, staggered
- **FlipCard:** 3D rotateY 180°, 0.6s, preserving 3D
- **Hero floating badge:** infinite Y bounce (0→-8px→0), 3s ease-in-out
- **Hero badge dot:** infinite pulse animation
- **Reduced motion:** all animations disabled via `prefers-reduced-motion: reduce`

---

## i18n TEXT (English)

### Landing
- Nav: About | Features | Get Started | Subscribe | Log In | Sign Up | Go to Dashboard
- Hero badge: "Now Accepting Reservations"
- Hero H1: "Smart Transportation." + "Reserved for You."
- Hero subtitle: "The night shuttle seat reservation platform built for 1337 School, Ben Guerir."
- Hero CTA: "Get Started Free" + "Learn More"
- Hero stats: "500+" Students | "25+" Routes | "99%" 10PM — 6AM
- Features badge: "What This Project Is About"
- Features H2: "Solving Real Transport" + "Problems with Smart Solutions"
- Team badge: "Who We Are"
- Team H2: "Meet the Team Behind" + "Fleetmark"
- Auth badge: "Get Started"
- Auth H2: "Your Ride Awaits." + "Join Fleetmark Today."
- Subscribe H2: "Stay Updated"
- Subscribe: "No spam, ever. Unsubscribe anytime."
- Footer: "Night shuttle management for 1337 School, Ben Guerir."
- Footer bottom: "Built with ❤️ in Morocco 🇲🇦"

### Dashboard
- Admin sidebar: Overview | Buses | Routes | Users | Schedule | Reports | Notifications
- Student sidebar: Overview | Reserve a Seat | My Reservations | Routes & Stops | Notifications | Profile

---

## FILE MAP (Frontend Source Structure)

```
src/
├── App.tsx                    # Router + Landing page assembly
├── index.css                  # Global styles + utility classes
├── styles/tokens.css          # CSS custom properties (design tokens)
├── components/
│   ├── Navbar.tsx             # Landing navbar with glass effect
│   ├── Hero.tsx               # Hero section with dashboard preview
│   ├── Features.tsx           # 2×2 flip card grid
│   ├── WhoWeAre.tsx           # Team cards horizontal scroll
│   ├── AuthSection.tsx        # 42 OAuth sign-in cards
│   ├── Subscribe.tsx          # Email subscribe section
│   ├── Footer.tsx             # Footer with links
│   ├── LanguageSwitcher.tsx   # EN/FR/AR toggle
│   ├── admin/
│   │   ├── Sidebar.tsx        # Admin sidebar navigation
│   │   ├── Topbar.tsx         # Admin topbar with search/bell/profile
│   │   └── Modal.tsx          # Reusable modal component
│   ├── passenger/
│   │   ├── PassengerSidebar.tsx
│   │   ├── PassengerTopbar.tsx
│   │   ├── ScheduleStatusBanner.tsx
│   │   └── StudentOnboarding.tsx
│   └── ui/
│       ├── FlipCard.tsx       # 3D flip card component
│       ├── SnakeCard.tsx      # Alternating slide-in wrapper
│       ├── ThemeToggle.tsx    # Sun/Moon toggle button
│       ├── SectionDivider.tsx # Gradient line divider
│       ├── Skeleton.tsx       # Loading skeletons
│       ├── EmptyState.tsx     # No data placeholder
│       ├── ErrorState.tsx     # Error with retry
│       └── ComingSoonFeature.tsx
├── pages/
│   ├── AuthCallback.tsx       # 42 OAuth callback handler
│   ├── Onboarding.tsx         # Home stop selection
│   ├── admin/
│   │   ├── AdminLayout.tsx    # Sidebar + Topbar + Outlet
│   │   ├── Overview.tsx       # Stats + charts + table
│   │   ├── BusManagement.tsx  # CRUD bus table
│   │   ├── RouteStops.tsx     # Route management
│   │   ├── UserManagement.tsx # User CRUD table
│   │   ├── ScheduleManagement.tsx
│   │   ├── Reports.tsx
│   │   └── Notifications.tsx
│   └── passenger/
│       ├── PassengerLayout.tsx
│       ├── PassengerOverview.tsx  # Welcome + stats + notifications
│       ├── ReserveASeat.tsx      # Time slot grid + booking
│       ├── MyReservations.tsx    # Tonight + past reservations
│       ├── PassengerRoutes.tsx   # Route explorer
│       ├── ProfileSettings.tsx   # Profile + transport settings
│       └── PassengerNotifications.tsx
└── i18n/locales/
    ├── en.json
    ├── fr.json
    └── ar.json
```

---

## KEY DESIGN RULES

1. **No raw hex colors** — everything uses design token CSS variables
2. **Consistent border-radius:** cards = 16px, buttons = 8–12px, inputs = 8–12px, badges = 100px (pill), avatars = full circle
3. **Consistent shadows:** cards use shadow-sm, modals use shadow-xl, hover adds shadow-md
4. **Consistent spacing:** all spacing is multiples of 4px
5. **All icons are Lucide** — 20px default size in nav, 16px in buttons, 28-32px in empty states
6. **Cards are white in light mode**, `#161B22` in dark mode
7. **Accent color (#0EA5E9)** is used consistently for: active nav items, primary buttons, links, badges, focus rings
8. **No driver role UI exists yet** — routes to "Coming Soon" page
9. **42 OAuth is the only auth method** shown — no email/password forms (sign-in buttons redirect to 42 Intra)
10. **Mobile: sidebar becomes drawer**, topbar gets hamburger, content stack vertically
