import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import EmptyState from "../../components/ui/EmptyState";
import DataTable from "../../components/ui/DataTable";
import SkeletonCard from "../../components/ui/SkeletonCard";
import SkeletonTable from "../../components/ui/SkeletonTable";
import Badge from "../../components/ui/Badge";
import PageHeader from "../../components/ui/PageHeader";
import useCountUp from "../../hooks/useCountUp";
import { API_BASE } from "../../services/api";
import { useTranslation } from "../../context/TranslationContext";

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [trips,  setTrips]  = useState([]);
  const [buses,  setBuses]  = useState([]);
  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stationsCount, setStationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token   = localStorage.getItem("fleetmark_access");
        const headers = { 
          Authorization: `Bearer ${token}`,
          "X-API-Key": import.meta.env.VITE_API_KEY
        };
        const [t, b, r, s, d, rv] = await Promise.all([
          fetch(`${API_BASE}/trips/`,    { headers }),
          fetch(`${API_BASE}/buses/`,    { headers }),
          fetch(`${API_BASE}/routes/`,   { headers }),
          fetch(`${API_BASE}/stations/`, { headers }),
          fetch(`${API_BASE}/drivers/`,  { headers }),
          fetch(`${API_BASE}/reservations/`, { headers }),
        ]);
        if (!t.ok || !b.ok || !r.ok) throw new Error("Failed to load admin overview.");
        const [tData, bData, rData] = await Promise.all([t.json(), b.json(), r.json()]);
        const sData = s.ok ? await s.json() : [];
        const dData = d.ok ? await d.json() : [];
        const rvData = rv.ok ? await rv.json() : [];
        if (active) {
          setTrips( Array.isArray(tData) ? tData : []);
          setBuses( Array.isArray(bData) ? bData : []);
          setRoutes(Array.isArray(rData) ? rData : []);
          setDrivers(Array.isArray(dData) ? dData : []);
          setStationsCount(Array.isArray(sData) ? sData.length : 0);
          setReservations(Array.isArray(rvData) ? rvData : []);
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

  // ── Chart data: Seat occupancy per active trip ──────────────────────────
  const occupancyData = useMemo(() => {
    return activeTrips.slice(0, 10).map((trip) => {
      const cap = Number(trip.bus_seat_capacity || 0);
      const left = Number(trip.seats_left ?? 0);
      const booked = Math.max(0, cap - left);
      return {
        name: trip.route_name || trip.route || "Trip",
        booked,
        available: Math.max(0, left),
      };
    });
  }, [activeTrips]);

  // ── Chart data: Reservations by route (pie) ────────────────────────────
  const routeDistribution = useMemo(() => {
    const counts = {};
    reservations.forEach((r) => {
      const name = r.route_name || r.trip_route_name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reservations]);

  const animatedActiveTrips = useCountUp(activeTrips.length);
  const animatedTotalSeats = useCountUp(totalSeats);
  const animatedRoutes = useCountUp(routes.length);

  const kpis = [
    { label: "Active trips",  value: String(animatedActiveTrips),  sub: "non-archived",    ...KPI_ICONS[0] },
    { label: "Total seats",   value: String(animatedTotalSeats),   sub: "across all buses", ...KPI_ICONS[1] },
    { label: "Routes",        value: String(animatedRoutes),       sub: "configured",       ...KPI_ICONS[2] },
  ];

  // Workflow guide steps — in dependency order
  const steps = [
    { label: t("setupAddStations"), desc: t("setupAddStationsDesc"), icon: "location_on",    done: stationsCount > 0,          path: "/admin/stations" },
    { label: t("setupAddBuses"),    desc: t("setupAddBusesDesc"),    icon: "directions_bus", done: buses.length > 0,            path: "/admin/buses",    needs: "stations" },
    { label: t("setupAddDrivers"),  desc: t("setupAddDriversDesc"),  icon: "badge",          done: drivers.length > 0,          path: "/admin/drivers",  needs: "buses" },
    { label: t("setupAddRoutes"),   desc: t("setupAddRoutesDesc"),   icon: "map",            done: routes.length > 0,           path: "/admin/routes",   needs: "drivers" },
    { label: t("setupAddTrips"),    desc: t("setupAddTripsDesc"),    icon: "event_seat",     done: activeTrips.length > 0,      path: "/admin/trips",    needs: "routes" },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const showGuide = doneCount < 5;
  // First incomplete step is the "next" action
  const nextStepIndex = steps.findIndex((s) => !s.done);

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
      <section className="animate-in stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
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

      {/* ── Analytics Charts ─────────────────────────────────────────── */}
      {(occupancyData.length > 0 || routeDistribution.length > 0) && (
        <section
          className="animate-in"
          style={{
            display: "grid",
            gridTemplateColumns: routeDistribution.length > 0 ? "1.5fr 1fr" : "1fr",
            gap: "var(--space-4)",
          }}
        >
          {/* Bar chart — Seat occupancy per trip */}
          {occupancyData.length > 0 && (
            <article
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border, var(--line))",
                borderRadius: 12,
                padding: "var(--space-5, 20px)",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6, color: "var(--blue)" }}>bar_chart</span>
                Seat Occupancy by Trip
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={occupancyData} margin={{ top: 4, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--line, #e5e7eb)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--mid)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--mid)" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="booked" stackId="seats" fill="#6366f1" name="Booked" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="available" stackId="seats" fill="#22c55e" name="Available" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </article>
          )}

          {/* Pie chart — Reservations by route */}
          {routeDistribution.length > 0 && (
            <article
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border, var(--line))",
                borderRadius: 12,
                padding: "var(--space-5, 20px)",
              }}
            >
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: "middle", marginRight: 6, color: "var(--amber)" }}>pie_chart</span>
                Reservations by Route
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={routeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "var(--mid)" }}
                    style={{ fontSize: 11 }}
                  >
                    {routeDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </article>
          )}
        </section>
      )}

      {/* Getting Started workflow guide */}
      {showGuide && (
        <section
          className="animate-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border, var(--line))",
            borderRadius: 12,
            padding: "var(--space-5, 20px)",
            display: "grid",
            gap: "var(--space-4, 16px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t("setupTitle")}</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--mid)" }}>
                {t("setupSubtitle")}
              </p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--blue)" }}>
              {doneCount}/{steps.length} {t("setupStepsComplete")}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: 3, background: "var(--surface2, #e5e7eb)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(doneCount / steps.length) * 100}%`,
                background: "var(--blue)",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          {/* Steps */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3, 12px)" }}>
            {steps.map((step, i) => {
              const isNext = i === nextStepIndex;
              const isLocked = !step.done && i > nextStepIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !isLocked && navigate(step.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: step.done
                      ? "1px solid var(--green, #22c55e)"
                      : isNext
                      ? "2px solid var(--blue)"
                      : "1px solid var(--line, #e5e7eb)",
                    background: step.done
                      ? "color-mix(in srgb, var(--green, #22c55e) 8%, transparent)"
                      : isNext
                      ? "color-mix(in srgb, var(--blue) 6%, transparent)"
                      : "transparent",
                    opacity: isLocked ? 0.45 : step.done ? 0.75 : 1,
                    cursor: isLocked ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                >
                  {/* Step number badge */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      background: step.done
                        ? "var(--green, #22c55e)"
                        : isNext
                        ? "var(--blue)"
                        : "var(--surface2, #e5e7eb)",
                      color: step.done || isNext ? "#fff" : "var(--mid)",
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {step.done ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : isLocked ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: step.done ? "var(--green, #22c55e)" : isNext ? "var(--blue)" : "var(--text-primary, var(--ink))" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--mid)", marginTop: 2 }}>
                      {step.done ? t("setupDone") : isLocked ? t("setupNeedsFirst").replace("{{deps}}", t(`nav${step.needs.charAt(0).toUpperCase() + step.needs.slice(1)}`)) : step.desc}
                    </div>
                  </div>
                  {isNext && (
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--blue)", marginLeft: "auto", flexShrink: 0 }}>
                      arrow_forward
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Tonight's trips table */}
      <section className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
        <PageHeader title="Tonight's Trips" subtitle="Upcoming non-archived departures, sorted by time" />
        {!tonight.length ? (
          <EmptyState icon="event_seat" title="No trips scheduled" subtitle="Create a trip from the Trips page." />
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Departure</th>
                <th scope="col">Route</th>
                <th scope="col">Bus</th>
                <th scope="col">Seats</th>
              </tr>
            </thead>
            <tbody>
              {tonight.map((trip) => {
                const cap  = Number(trip.bus_seat_capacity || 0);
                const left = Number(trip.seats_left ?? 0);
                return (
                  <tr key={trip.id} className="animate-in">
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
