import React, { useEffect, useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import UserIdentity from "../ui/UserIdentity";
import Button from "../ui/Button";
import DarkModeToggle from "../ui/DarkModeToggle";
import { API_BASE } from "../../services/api";

const navItems = [
  { id: "dashboard", labelKey: "navDashboard", path: "/passenger",           icon: "dashboard"  },
  { id: "bookings",  labelKey: "navBookings",  path: "/passenger/reserve",   icon: "event_seat" },
  { id: "history",   labelKey: "navHistory",   path: "/passenger/history",   icon: "history"    },
  { id: "settings",  labelKey: "navSettings",  path: "/passenger/settings",  icon: "settings"   },
];

/* Bottom nav tabs for mobile */
const bottomNavItems = [
  { id: "dashboard",     labelKey: "navDashboard",      path: "/passenger",               icon: "dashboard"     },
  { id: "bookings",      labelKey: "navBookings",       path: "/passenger/reserve",       icon: "event_seat"    },
  { id: "notifications", labelKey: "navNotifications",  path: "/passenger/notifications", icon: "notifications" },
  { id: "profile",       labelKey: "navProfile",        path: "/passenger/settings",      icon: "person"        },
];

export default function StudentLayout({
  user,
  activePath,
  onNavigate,
  onLogout,
  children,
  pageTitle = "Overview",
}) {
  const stationName = user?.station_name || "No station set";
  const login       = user?.login_42 || "student";
  const { t }       = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchUnread() {
      const token = localStorage.getItem("fleetmark_access");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/announcements/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok && active) {
          const data = await res.json();
          setUnread(data.filter(a => !a.is_dismissed).length);
        }
      } catch { /* ignore */ }
    }

    fetchUnread();
    window.addEventListener("fleetmark:refresh", fetchUnread);
    return () => {
      active = false;
      window.removeEventListener("fleetmark:refresh", fetchUnread);
    };
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [activePath]);

  function handleNavigate(path) {
    onNavigate?.(path);
    setDrawerOpen(false);
  }

  function isActive(itemPath) {
    if (itemPath === "/passenger") return activePath === "/passenger";
    return activePath.startsWith(itemPath);
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
          const active = isActive(item.path);
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

      {/* CTA + User identity + logout */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "var(--space-3)",
          display: "grid",
          gap: "var(--space-1)",
        }}
      >
        <div style={{ padding: "var(--space-1) var(--space-3)" }}>
          <Button
            variant="primary"
            size="md"
            icon="event_seat"
            onClick={() => handleNavigate("/passenger/reserve")}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {t("navNewBooking")}
          </Button>
        </div>
        <UserIdentity login={login} role="Passenger" />
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
    <div className="layout-root" style={{ '--accent': '#818cf8', '--accent2': '#a78bfa', '--accent-light': 'rgba(99,102,241,0.1)', '--accent-mid': 'rgba(99,102,241,0.15)', '--accent-border': 'rgba(99,102,241,0.28)', '--accent-glow': 'rgba(99,102,241,0.25)', '--accent-dim': '#ede9fe' }}>
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

      {/* Sidebar — desktop only */}
      <aside className={`layout-sidebar${drawerOpen ? " drawer-open" : ""}`}>
        {sidebar}
      </aside>

      <main id="main-content" className="layout-main">
        <header className="layout-header">
          {/* Hamburger — CSS hides this on desktop */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon sidebar-hamburger"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22, lineHeight: 1 }}>menu</span>
          </button>

          {/* Title + station pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flex: "1 1 auto", minWidth: 0 }}>
            <div
              style={{
                margin: 0,
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-bold)",
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1,
              }}
              role="heading"
              aria-level="2"
            >
              {pageTitle}
            </div>
            {/* Station pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "5px 10px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 999,
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 13, color: "var(--green)", lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: "var(--font-medium)",
                  whiteSpace: "nowrap",
                }}
              >
                {stationName}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
            {/* User avatar */}
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--blue), var(--blue2, var(--blue)))",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
              title={login}
            >
              <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.02em" }}>
                {login.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <DarkModeToggle />
            {/* Notification bell */}
            <button
              type="button"
              onClick={() => onNavigate?.("/passenger/notifications")}
              style={{
                position: "relative",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 6,
                display: "grid",
                placeItems: "center",
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--text-secondary)" }}>
                notifications
              </span>
              {unread > 0 && (
                <span
                  className="bell-badge-pulse"
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: "var(--red)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                    padding: "0 4px",
                    lineHeight: 1,
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
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

        <div className="layout-content layout-content-student">
          {children}
        </div>
        <footer
          style={{
            padding: "12px var(--page-padding-x, 32px)",
            borderTop: "1px solid var(--line2)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: "var(--dim)",
          }}
        >
          <span>© 2026 Fleetmark</span>
          <span>·</span>
          <a href="/privacy" style={{ color: "var(--dim)", textDecoration: "none", fontWeight: 600 }}>Privacy</a>
          <span>·</span>
          <a href="/terms" style={{ color: "var(--dim)", textDecoration: "none", fontWeight: 600 }}>Terms</a>
        </footer>
      </main>

      {/* ── Mobile bottom navigation ──────────── */}
      <nav className="student-bottom-nav">
        {bottomNavItems.map((item) => {
          const active = isActive(item.path);
          const isNotif = item.id === "notifications";
          return (
            <button
              key={item.id}
              type="button"
              className={`student-bottom-nav-item${active ? " active" : ""}`}
              onClick={() => handleNavigate(item.path)}
              aria-label={t(item.labelKey)}
            >
              <span className="material-symbols-outlined" style={{ position: "relative" }}>
                {item.icon}
                {/* Unread badge on notification icon */}
                {isNotif && unread > 0 && (
                  <span
                    className="bell-badge-pulse"
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -8,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 7,
                      background: "var(--red)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                      padding: "0 3px",
                      lineHeight: 1,
                    }}
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </span>
              <span className="student-bottom-nav-label">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
