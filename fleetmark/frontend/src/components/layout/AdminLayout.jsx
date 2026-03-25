import React from "react";
import { useTranslation } from "../../context/TranslationContext";

const navItems = [
  { id: "dashboard", labelKey: "navDashboard", path: "/admin", icon: "dashboard" },
  { id: "trips", labelKey: "navTrips", path: "/admin/trips", icon: "event_seat" },
  { id: "buses", labelKey: "navBuses", path: "/admin/buses", icon: "directions_bus" },
  { id: "routes", labelKey: "navRoutes", path: "/admin/routes", icon: "map" },
  { id: "drivers", labelKey: "navDrivers", path: "/admin/drivers", icon: "person" },
  { id: "history", labelKey: "navHistory", path: "/admin/reservations", icon: "history" },
  { id: "reports", labelKey: "navReports", path: "/admin/reports", icon: "analytics" },
  { id: "settings", labelKey: "navSettings", path: "/admin/settings", icon: "settings" },
];

export default function AdminLayout({
  activePath,
  onNavigate,
  onLogout,
  onNewTrip,
  children,
  pageTitle = "Trips Management",
}) {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      <aside
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100%",
          width: 220,
          background: "var(--surface)",
          display: "flex",
          flexDirection: "column",
          padding: "24px 16px",
          gap: 32,
          borderRight: "1px solid var(--line2)",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>Fleetmark</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            1337 Shuttle System
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const active = activePath === item.path;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate && onNavigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: "none",
                  textAlign: "left",
                  padding: "8px 12px",
                  background: active ? "var(--surface-active)" : "transparent",
                  color: active ? "var(--blue)" : "var(--dim)",
                  borderLeft: active ? "2px solid var(--blue2)" : "2px solid transparent",
                  cursor: "pointer",
                  transform: active ? "scale(0.98)" : "none",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0, lineHeight: 1 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: "auto",
            border: "none",
            background: "transparent",
            color: "var(--dim)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 10px",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>
            logout
          </span>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{t("navLogout")}</span>
        </button>
      </aside>

      <main style={{ marginLeft: 220, minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
        <header
          style={{
            position: "fixed",
            left: 220,
            right: 0,
            top: 0,
            zIndex: 40,
            height: 56,
            borderBottom: "1px solid var(--line2)",
            background: "var(--bg)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            padding: "0 32px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              minWidth: 0,
              flex: "1 1 auto",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {pageTitle}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button
              type="button"
              title="Refresh"
              aria-label="Refresh"
              onClick={() => window.dispatchEvent(new CustomEvent("fleetmark:refresh"))}
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: "50%",
                border: "1px solid var(--line2)",
                background: "transparent",
                color: "var(--dim)",
                display: "grid",
                placeItems: "center",
                padding: 0,
                cursor: "pointer",
                lineHeight: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                refresh
              </span>
            </button>
            <button
              type="button"
              onClick={() => (onNewTrip ? onNewTrip() : onNavigate && onNavigate("/admin/trips"))}
              style={{
                border: "1px solid var(--blue-bdr)",
                background: "var(--blue-bg)",
                color: "var(--blue)",
                borderRadius: 7,
                padding: "8px 14px",
                fontSize: 14,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, lineHeight: 1 }}>
                add
              </span>
              {t("navNewTrip")}
            </button>
          </div>
        </header>

        <div style={{ paddingTop: 56, maxWidth: 1080, margin: "0 auto", paddingLeft: 32, paddingRight: 32, paddingBottom: 40 }}>
          {children}
        </div>

        <div
          style={{
            position: "fixed",
            right: -120,
            top: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "color-mix(in srgb, var(--blue) 5%, transparent)",
            filter: "blur(120px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </main>
    </div>
  );
}
