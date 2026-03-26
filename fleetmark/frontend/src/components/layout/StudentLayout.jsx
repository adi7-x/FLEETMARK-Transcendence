import React, { useEffect, useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import UserIdentity from "../ui/UserIdentity";
import Button from "../ui/Button";
import DarkModeToggle from "../ui/DarkModeToggle";

const navItems = [
  { id: "dashboard", labelKey: "navDashboard", path: "/passenger",           icon: "dashboard"  },
  { id: "bookings",  labelKey: "navBookings",  path: "/passenger/reserve",   icon: "event_seat" },
  { id: "history",   labelKey: "navHistory",   path: "/passenger/history",   icon: "history"    },
  { id: "settings",  labelKey: "navSettings",  path: "/passenger/settings",  icon: "settings"   },
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
          const active =
            activePath === item.path ||
            (item.id === "dashboard" && activePath === "/passenger");
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
    <div className="layout-root">
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

      {/* Main */}
      <main className="layout-main">
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
            <h1
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
            >
              {pageTitle}
            </h1>
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

        <div className="layout-content layout-content-student">
          {children}
        </div>
      </main>
    </div>
  );
}
