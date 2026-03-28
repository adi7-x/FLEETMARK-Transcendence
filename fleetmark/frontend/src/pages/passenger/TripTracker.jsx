import React, { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import RouteMap from "../../components/ui/RouteMap";
import { API_BASE, getUser } from "../../services/api";

function formatTime(dateStr) {
  if (!dateStr) return "--:--";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getMinutesUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.max(0, Math.round(diff / 60000));
}

export default function TripTracker() {
  const user = useMemo(() => getUser(), []);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      if (!token || !user?.station) throw new Error("Missing session.");
      const res = await fetch(
        `${API_BASE}/trips/available/?station_id=${encodeURIComponent(user.station)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to load trip data.");
      const data = await res.json();
      const trips = Array.isArray(data) ? data : [];
      setTrip(trips[0] || null);
    } catch (err) {
      setError(err.message || "Unable to load tracker.");
    } finally {
      setLoading(false);
    }
  }, [user?.station]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, [load]);

  // Live clock tick every 30s
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const eta = trip ? getMinutesUntil(trip.departure_datetime) : null;
  const departed = eta !== null && eta <= 0;
  const stopsCount = trip?.route_stops_count || 4;

  // Simulate bus position along stops (1-indexed for timeline)
  const currentStop = trip
    ? Math.min(stopsCount, Math.max(1, stopsCount - Math.floor((eta || 0) / 10)))
    : 1;
  const routeMapStopIndex = Math.max(0, Math.min((stopsCount || 4) - 1, currentStop - 1));

  // Skeleton
  if (loading) {
    return (
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <div className="skeleton-card animate-in">
          <div className="skeleton-bar" style={{ width: "60%", height: 22 }} />
          <div className="skeleton-bar" style={{ width: "40%", height: 14 }} />
          <div className="skeleton-bar" style={{ width: "80%", height: 60 }} />
        </div>
        <div className="skeleton-card animate-in">
          <div className="skeleton-bar" style={{ width: "30%", height: 14 }} />
          <div className="skeleton-bar" style={{ width: "100%", height: 120 }} />
        </div>
      </div>
    );
  }

  if (error && !trip) {
    return <div className="animate-in"><EmptyState icon="error" title="Tracker unavailable" subtitle={error} /></div>;
  }

  if (!trip) {
    return (
      <div
        className="animate-in"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--surface)",
          padding: "var(--space-8) var(--space-6)",
          textAlign: "center",
          display: "grid",
          placeItems: "center",
          gap: "var(--space-3)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface2)", display: "grid", placeItems: "center" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--dim)" }}>directions_bus</span>
        </div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>No active trips</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", maxWidth: 300 }}>
          There are no buses running from your station right now. Check back closer to departure time.
        </p>
        <button
          type="button"
          onClick={() => window.location.href = "/passenger/reserve"}
          style={{
            border: "1px solid var(--blue-border, var(--blue))",
            background: "var(--blue-light)",
            color: "var(--blue)",
            borderRadius: 10,
            padding: "10px 20px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            marginTop: 4,
          }}
        >
          Browse Schedule →
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {/* Hero ETA card */}
      <section
        className="animate-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-md)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: departed
              ? "color-mix(in srgb, var(--green) 12%, transparent)"
              : "color-mix(in srgb, var(--blue) 12%, transparent)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                background: departed
                  ? "var(--green-light)"
                  : "var(--blue-light)",
                color: departed ? "var(--green)" : "var(--blue)",
                border: `1px solid ${departed ? "var(--green-border)" : "var(--blue-border)"}`,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: departed ? "var(--green)" : "var(--blue)",
                  animation: "fm-pulse 1.8s ease-in-out infinite",
                }}
              />
              {departed ? "Departed" : "En Route"}
            </span>
            <h2 style={{ margin: "12px 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {trip.route_name || "Shuttle"}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
              Bus: {trip.bus_name || "—"} • {stopsCount} stops
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700, letterSpacing: "0.08em" }}>
              {departed ? "Departed at" : "Departs in"}
            </span>
            <div className="mono" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 4, color: departed ? "var(--green)" : "var(--text-primary)" }}>
              {departed ? formatTime(trip.departure_datetime) : eta !== null ? `${eta}m` : "--"}
            </div>
            {!departed && (
              <span className="mono" style={{ fontSize: 12, color: "var(--mid)", marginTop: 4, display: "block" }}>
                at {formatTime(trip.departure_datetime)}
              </span>
            )}
          </div>
        </div>

        {/* Seat info */}
        {typeof trip.seats_left === "number" && (
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              padding: "14px 16px",
              background: "var(--surface2)",
              borderRadius: 10,
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Seats Left</span>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                {trip.seats_left}
              </div>
            </div>
            {trip.bus_seat_capacity && (
              <div>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Capacity</span>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                  {trip.bus_seat_capacity}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Route timeline */}
      <section
        className="animate-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mid)" }}>
          Route Progress
        </h3>
        <div style={{ display: "grid", gap: 0 }}>
          {Array.from({ length: stopsCount }, (_, i) => {
            const stopNum = i + 1;
            const isCurrent = stopNum === currentStop;
            const isPast = stopNum < currentStop;
            return (
              <div key={i} style={{ display: "flex", gap: 16, minHeight: 48 }}>
                {/* Timeline column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 24 }}>
                  <div
                    style={{
                      width: isCurrent ? 16 : 10,
                      height: isCurrent ? 16 : 10,
                      borderRadius: "50%",
                      background: isCurrent ? "var(--blue)" : isPast ? "var(--green)" : "var(--surface3)",
                      border: isCurrent ? "3px solid var(--blue-mid)" : "none",
                      flexShrink: 0,
                      transition: "all 0.3s ease",
                      boxShadow: isCurrent ? "0 0 0 4px var(--accent-glow)" : "none",
                    }}
                  />
                  {i < stopsCount - 1 && (
                    <div
                      style={{
                        flex: 1,
                        width: 2,
                        background: isPast ? "var(--green)" : "var(--border)",
                        minHeight: 24,
                        transition: "background 0.3s ease",
                      }}
                    />
                  )}
                </div>
                {/* Stop label */}
                <div style={{ paddingTop: isCurrent ? 0 : 0, paddingBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: isCurrent ? 700 : isPast ? 500 : 400,
                      color: isCurrent ? "var(--text-primary)" : isPast ? "var(--green)" : "var(--text-tertiary)",
                    }}
                  >
                    {i === 0 ? "Departure" : i === stopsCount - 1 ? "Arrival" : `Stop ${stopNum}`}
                  </span>
                  {isCurrent && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--blue)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
                        directions_bus
                      </span>
                      Bus here
                    </span>
                  )}
                  {isPast && (
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 6, color: "var(--green)", verticalAlign: "middle", fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Map */}
      <section
        className="animate-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--mid)" }}>
          Live Map
        </h3>
        <div style={{ 
          position: "relative", 
          width: "100%", 
          height: 380, 
          borderRadius: 12, 
          border: "1px solid color-mix(in srgb, var(--border) 50%, transparent)", 
          background: "var(--surface)", 
          overflow: "hidden", 
          display: "grid", 
          placeItems: "center",
          padding: 24
        }}>
          <RouteMap animated currentStop={routeMapStopIndex} />
        </div>
      </section>
    </div>
  );
}
