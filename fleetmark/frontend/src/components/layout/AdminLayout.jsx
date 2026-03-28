import React, { useEffect, useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import UserIdentity from "../ui/UserIdentity";
import Button from "../ui/Button";
import DarkModeToggle from "../ui/DarkModeToggle";

const navItems = [
  { id: "dashboard",   labelKey: "navDashboard", path: "/admin",              icon: "dashboard"    },
  { id: "trips",       labelKey: "navTrips",     path: "/admin/trips",        icon: "event_seat"   },
  { id: "buses",       labelKey: "navBuses",     path: "/admin/buses",        icon: "directions_bus"},
  { id: "stations",    labelKey: "navStations",  path: "/admin/stations",     icon: "location_on"  },
  { id: "routes",      labelKey: "navRoutes",    path: "/admin/routes",       icon: "map"          },
  { id: "drivers",     labelKey: "navDrivers",   path: "/admin/drivers",      icon: "person"       },
  { id: "history",     labelKey: "navHistory",   path: "/admin/reservations", icon: "history"      },
  { id: "reports",     labelKey: "navReports",   path: "/admin/reports",      icon: "analytics"    },
  { id: "announcements", labelKey: "navAnnouncements", path: "/admin/announcements", icon: "campaign" },
  { id: "settings",    labelKey: "navSettings",  path: "/admin/settings",     icon: "settings"     },
];

export default function AdminLayout({
  user,
  activePath,
  onNavigate,
  onLogout,
  onNewTrip,
  children,
  pageTitle = "Dashboard",
}) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const login = user?.login_42 || "admin";

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [activePath]);

  function handleNavigate(path) {
    onNavigate?.(path);
    setDrawerOpen(false);
  }

  const sidebar = (
    <>
      {/* Logo */}
      <div style={{ padding: "0 var(--space-3)" }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: "var(--font-extrabold)",
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
          }}
        >
          Fleetmark
        </div>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--text-tertiary)",
            marginTop: 2,
            fontWeight: "var(--font-medium)",
          }}
        >
          1337 Shuttle System
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = activePath === item.path;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.path)}
              className={`nav-item${active ? " active" : ""}`}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 20,
                  flexShrink: 0,
                  lineHeight: 1,
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              {t(item.labelKey)}
            </button>
          );
        })}
      </nav>

      {/* User identity + logout */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "var(--space-3)",
          display: "grid",
          gap: "var(--space-1)",
        }}
      >
        <UserIdentity login={login} role="Admin" />
        <button
          type="button"
          className="nav-item"
          onClick={onLogout}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>
            logout
          </span>
          {t("navLogout")}
        </button>
      </div>
    </>
  );

  return (
    <div className="layout-root" style={{ '--accent': '#10b981', '--accent2': '#34d399', '--accent-light': 'rgba(16,185,129,0.08)', '--accent-mid': 'rgba(16,185,129,0.14)', '--accent-border': 'rgba(16,185,129,0.28)', '--accent-glow': 'rgba(16,185,129,0.2)', '--accent-dim': '#d1fae5' }}>
      {/* Skip-to-content link — Fix 3c */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Mobile backdrop */}
      {drawerOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`layout-sidebar${drawerOpen ? " drawer-open" : ""}`}>
        {sidebar}
      </aside>

      {/* Main — id for skip link (WCAG) */}
      <main id="main-content" className="layout-main">
        <header className="layout-header">
          {/* Hamburger — hidden on desktop via CSS */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon sidebar-hamburger"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, lineHeight: 1 }}>menu</span>
          </button>

          <div
            style={{
              margin: 0,
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-bold)",
              letterSpacing: "-0.02em",
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
            role="heading"
            aria-level="2"
          >
            {pageTitle}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
            <DarkModeToggle />
            <Button
              variant="ghost"
              size="sm"
              icon="refresh"
              iconOnly
              title="Refresh"
              aria-label="Refresh"
              onClick={() => window.dispatchEvent(new CustomEvent("fleetmark:refresh"))}
            />

          </div>
        </header>

        <div className="layout-content">
          {children}
        </div>
      </main>
    </div>
  );
}
