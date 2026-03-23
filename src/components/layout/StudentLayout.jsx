import React from "react";
import { useTranslation } from "../../context/TranslationContext";

const navItems = [
  { id: "dashboard", labelKey: "navDashboard", path: "/passenger", icon: "dashboard" },
  { id: "map", labelKey: "navLiveMap", path: "/passenger/map", icon: "map" },
  { id: "bookings", labelKey: "navBookings", path: "/passenger/reserve", icon: "event_seat" },
  { id: "history", labelKey: "navHistory", path: "/passenger/history", icon: "history" },
  { id: "settings", labelKey: "navSettings", path: "/passenger/settings", icon: "settings" },
];

export default function StudentLayout({
  user,
  activePath,
  onNavigate,
  onLogout,
  children,
  pageTitle = "Student Dashboard",
}) {
  const stationName = user?.station_name || "No Station";
  const login = user?.login_42 || "student";
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
          <span className="mono" style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
            1337 Shuttle System
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const active = activePath === item.path || (item.id === "dashboard" && activePath === "/passenger");
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
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {item.icon}
                </span>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                  {t(item.labelKey)}
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{ paddingTop: 12, borderTop: "1px solid var(--line2)", display: "grid", gap: 12 }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("/passenger/reserve")}
            style={{
              border: "1px solid var(--blue-bdr)",
              background: "var(--blue-bg)",
              color: "var(--blue)",
              borderRadius: 7,
              padding: "10px 12px",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("navNewBooking")}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--surface2)", border: "1px solid var(--line2)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, color: "var(--ink2)" }}>
              {login[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{login}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--dim)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              cursor: "pointer",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              logout
            </span>
            {t("navLogout")}
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 220, minHeight: "100vh", background: "var(--bg)" }}>
        <header
          style={{
            height: 56,
            position: "sticky",
            top: 0,
            zIndex: 40,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 32px",
            borderBottom: "1px solid var(--line2)",
            background: "color-mix(in srgb, var(--bg) 86%, transparent)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>{pageTitle}</h1>
            <div
              style={{
                border: "1px solid var(--line2)",
                borderRadius: 999,
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "var(--green)", fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {stationName}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--line2)", background: "transparent", color: "var(--dim)" }}>
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button type="button" style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid var(--line2)", background: "transparent", color: "var(--dim)", position: "relative" }}>
              <span className="material-symbols-outlined">notifications</span>
              <span style={{ position: "absolute", right: 8, top: 8, width: 6, height: 6, borderRadius: "50%", background: "var(--blue)" }} />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--surface2)", border: "1px solid var(--line2)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 700, color: "var(--ink2)" }}>
              {login[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div style={{ padding: 32, maxWidth: 1150, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
