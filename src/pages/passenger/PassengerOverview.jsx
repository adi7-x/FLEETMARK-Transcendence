import React, { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import { API_BASE, getUser } from "../../services/api";



export default function PassengerOverview() {
  const user = useMemo(() => getUser(), []);
  const [trips, setTrips] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("fleetmark_access");
        if (!token || !user?.station || !user?.id) throw new Error("Missing user session.");

        const [tripRes, resRes] = await Promise.all([
          fetch(`${API_BASE}/trips/available/?station_id=${encodeURIComponent(user.station)}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/reservations/?user_id=${encodeURIComponent(user.id)}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!tripRes.ok || !resRes.ok) throw new Error("Failed loading dashboard data.");
        const [tripData, resData] = await Promise.all([tripRes.json(), resRes.json()]);
        if (active) {
          setTrips(Array.isArray(tripData) ? tripData : []);
          setReservations(Array.isArray(resData) ? resData : []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load overview.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.station]);

  const tonightTrip = trips[0];
  const hasReservedTonight = tonightTrip
    ? reservations.some((r) => (r.trip_details?.id || r.trip) === tonightTrip.id)
    : false;
  const cap = tonightTrip ? Number(tonightTrip.bus_seat_capacity ?? 0) : 0;
  const left = tonightTrip ? Number(tonightTrip.seats_left ?? 0) : 0;
  const ridesThisMonth = reservations.filter((r) => {
    const date = r.created_at ? new Date(r.created_at) : null;
    if (!date) return false;
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  if (loading) return <Spinner text="Loading passenger overview..." />;
  if (error) return <EmptyState icon="⚠️" title="Unable to load overview" subtitle={error} />;

  return (
    <div style={{ display: "grid", gap: 48 }}>
      <section style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 12,
            background: "linear-gradient(to right, color-mix(in srgb, var(--blue) 14%, transparent), transparent)",
            filter: "blur(18px)",
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: "relative",
            border: "1px solid var(--line2)",
            borderRadius: 10,
            background: "var(--surface2)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
          }}
        >
          <div style={{ padding: 40, display: "grid", gap: 24 }}>
            <div>
              <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--blue)", fontWeight: 700 }}>
                Tonight
              </span>
              <h2 style={{ margin: "8px 0 6px", fontSize: 52, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {tonightTrip?.route_name || "—"}
              </h2>
              <p style={{ margin: 0, color: "var(--mid)" }}>
                {tonightTrip
                  ? "The active night loop for your station."
                  : "No trip currently available from your station."}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span className="mono" style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {tonightTrip ? new Date(tonightTrip.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </span>
              <span className="mono" style={{ color: "var(--green)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 8 }}>
                {!hasReservedTonight ? (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--green)",
                      boxShadow: "0 0 0 0 color-mix(in srgb, var(--green) 40%, transparent)",
                      animation: "fm-pulse 1.8s ease-in-out infinite",
                    }}
                  />
                ) : null}
                {hasReservedTonight ? "Reserved" : "In Transit"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--line2)", paddingTop: 14, display: "flex", gap: 30 }}>
              <div>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Seats Left</span>
                <div className="mono" style={{ fontSize: 18 }}>
                  {tonightTrip && (cap > 0 || left >= 0) ? `${left}/${cap || "—"}` : "-"}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Bus</span>
                <div className="mono" style={{ fontSize: 18 }}>
                  {tonightTrip?.bus_name || "—"}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Stops</span>
                <div className="mono" style={{ fontSize: 18 }}>
                  {tonightTrip?.route_stops_count || "—"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--surface2)", borderLeft: "1px solid var(--line2)", padding: 24, display: "grid", alignContent: "center", gap: 18 }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", borderRadius: 10, border: "1px solid color-mix(in srgb, var(--line) 15%, transparent)", background: "var(--surface)", overflow: "hidden", display: "grid", placeItems: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--dim)", opacity: 0.3 }}>map</span>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--surface2), transparent 55%)", pointerEvents: "none" }} />
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/passenger/reserve";
              }}
              style={{
                border: "1px solid var(--blue-bdr)",
                background: hasReservedTonight ? "var(--green-bg)" : "var(--blue-bg)",
                color: hasReservedTonight ? "var(--green)" : "var(--blue)",
                borderRadius: 8,
                padding: "14px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {hasReservedTonight ? "Reserved" : "Reserve Now"}
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
        {[
          { label: "My Stop", value: user?.station_name || "Not set", sub: "" },
          { label: "This Month", value: String(ridesThisMonth), sub: "Total current month" },
          { label: "Total Rides", value: String(reservations.length), sub: "LIFETIME" },
        ].map((card) => (
          <article key={card.label} style={{ border: "1px solid var(--line2)", borderRadius: 10, background: "var(--surface)", padding: 24 }}>
            <p style={{ margin: 0, color: "var(--dim)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{card.label}</p>
            <h3 className="mono" style={{ margin: "10px 0 0", fontSize: 42, lineHeight: 1 }}>
              {card.value}
            </h3>
            <p className="mono" style={{ margin: "6px 0 0", color: "var(--mid)", fontSize: 11 }}>
              {card.sub}
            </p>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h3 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--dim)" }}>
            Recent Activity
          </h3>
          <a href="/passenger/history" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--blue)" }}>
            View History
          </a>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {reservations.slice(0, 3).map((reservation) => (
            <div key={reservation.id} style={{ border: "1px solid var(--line2)", borderRadius: 10, background: "var(--surface)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "var(--surface2)", display: "grid", placeItems: "center", color: "var(--blue)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>directions_bus</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700 }}>{reservation.trip_details?.route_name || "Shuttle Trip"}</p>
                  <p className="mono" style={{ margin: "4px 0 0", color: "var(--dim)", fontSize: 10, textTransform: "uppercase" }}>
                    {reservation.trip_details?.departure_datetime
                      ? new Date(reservation.trip_details.departure_datetime).toLocaleString()
                      : reservation.created_at
                      ? new Date(reservation.created_at).toLocaleString()
                      : "No timestamp"}
                  </p>
                </div>
              </div>
              <span className="mono" style={{ color: "var(--green)", fontSize: 11, textTransform: "uppercase" }}>
                Completed
              </span>
            </div>
          ))}
          {!reservations.length ? (
            <EmptyState icon="🕘" title="No recent activity" subtitle="Your completed and upcoming reservations will appear here." />
          ) : null}
        </div>
      </section>

      {!trips.length ? (
        <EmptyState icon="🚌" title="No trips available" subtitle="No active departures are currently open for your station." />
      ) : null}

      <button
        type="button"
        onClick={() => { window.location.href = "/passenger/reserve"; }}
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "var(--blue)",
          color: "var(--on-inverse)",
          border: "none",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 8px 32px color-mix(in srgb, var(--blue) 50%, transparent)",
          cursor: "pointer",
          zIndex: 100,
          transition: "transform 0.2s ease"
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
      </button>
    </div>
  );
}
