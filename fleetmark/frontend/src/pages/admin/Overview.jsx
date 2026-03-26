import React, { useEffect, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import DataTable from "../../components/ui/DataTable";
import SkeletonCard from "../../components/ui/SkeletonCard";
import SkeletonTable from "../../components/ui/SkeletonTable";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import { API_BASE } from "../../services/api";

const KPI_ICONS = [
  { icon: "event_seat",    color: "var(--blue)"  },
  { icon: "airline_seat_recline_normal", color: "var(--green)" },
  { icon: "map",          color: "var(--amber)" },
];

function getSeatsStatus(left, cap) {
  if (!cap || cap <= 0) return "dim";
  const pct = left / cap;
  if (pct <= 0)   return "red";
  if (pct <= 0.2) return "amber";
  return "green";
}

export default function Overview() {
  const [trips,  setTrips]  = useState([]);
  const [buses,  setBuses]  = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token   = localStorage.getItem("fleetmark_access");
        const headers = { Authorization: `Bearer ${token}` };
        const [t, b, r] = await Promise.all([
          fetch(`${API_BASE}/trips/`,  { headers }),
          fetch(`${API_BASE}/buses/`,  { headers }),
          fetch(`${API_BASE}/routes/`, { headers }),
        ]);
        if (!t.ok || !b.ok || !r.ok) throw new Error("Failed to load admin overview.");
        const [tData, bData, rData] = await Promise.all([t.json(), b.json(), r.json()]);
        if (active) {
          setTrips( Array.isArray(tData) ? tData : []);
          setBuses( Array.isArray(bData) ? bData : []);
          setRoutes(Array.isArray(rData) ? rData : []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load overview.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const onRefresh = () => load();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => {
      active = false;
      window.removeEventListener("fleetmark:refresh", onRefresh);
    };
  }, []);

  const activeTrips  = trips.filter((t) => !t.archived_at);
  const totalSeats   = buses.reduce((sum, b) => sum + (b.seat_capacity || 0), 0);
  const tonight      = activeTrips
    .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime))
    .slice(0, 8);

  const kpis = [
    { label: "Active trips",  value: String(activeTrips.length),  sub: "non-archived",    ...KPI_ICONS[0] },
    { label: "Total seats",   value: String(totalSeats),           sub: "across all buses", ...KPI_ICONS[1] },
    { label: "Routes",        value: String(routes.length),        sub: "configured",       ...KPI_ICONS[2] },
  ];

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "var(--section-gap)" }}>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
          {[0, 1, 2].map((i) => <SkeletonCard key={i} rows={1} />)}
        </section>
        <SkeletonTable cols={3} rows={5} />
      </div>
    );
  }

  if (error && !trips.length) {
    return <EmptyState icon="error" title="Overview unavailable" subtitle={error} />;
  }

  return (
    <div style={{ display: "grid", gap: "var(--section-gap)" }}>
      {/* KPI row */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
        {kpis.map(({ label, value, sub, icon, color }) => (
          <article key={label} className="stat-card">
            <div className="stat-card-label">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, color, fontVariationSettings: "'FILL' 1" }}
              >
                {icon}
              </span>
              {label}
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-sub">{sub}</div>
          </article>
        ))}
      </section>

      {/* Tonight's trips table */}
      <section style={{ display: "grid", gap: "var(--space-4)" }}>
        <PageHeader title="Tonight's Trips" subtitle="Upcoming non-archived departures, sorted by time" />
        {!tonight.length ? (
          <EmptyState icon="event_seat" title="No trips scheduled" subtitle="Create a trip from the Trips page." />
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th>Departure</th>
                <th>Route</th>
                <th>Bus</th>
                <th>Seats</th>
              </tr>
            </thead>
            <tbody>
              {tonight.map((trip) => {
                const cap  = Number(trip.bus_seat_capacity || 0);
                const left = Number(trip.seats_left ?? 0);
                return (
                  <tr key={trip.id}>
                    <td className="td-mono">
                      {new Date(trip.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <div
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--text-tertiary)",
                          marginTop: 2,
                        }}
                      >
                        {new Date(trip.departure_datetime).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ fontWeight: "var(--font-semibold)" }}>
                      {trip.route_name || trip.route}
                    </td>
                    <td className="td-secondary">{trip.bus_name || "—"}</td>
                    <td>
                      <Badge variant={getSeatsStatus(left, cap)}>
                        {cap > 0 ? `${left} / ${cap}` : left >= 0 ? `${left} left` : "—"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </section>
    </div>
  );
}
