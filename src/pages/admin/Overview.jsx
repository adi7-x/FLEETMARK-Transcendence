import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

export default function Overview() {
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const headers = { Authorization: `Bearer ${token}` };
        const [t, b, r] = await Promise.all([
          fetch(`${API_BASE}/trips/`, { headers }),
          fetch(`${API_BASE}/buses/`, { headers }),
          fetch(`${API_BASE}/routes/`, { headers }),
        ]);
        if (!t.ok || !b.ok || !r.ok) throw new Error("Failed to load admin overview.");
        const [tData, bData, rData] = await Promise.all([t.json(), b.json(), r.json()]);
        if (active) {
          setTrips(Array.isArray(tData) ? tData : []);
          setBuses(Array.isArray(bData) ? bData : []);
          setRoutes(Array.isArray(rData) ? rData : []);
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
  }, []);

  const tonight = trips
    .filter((trip) => !trip.archived_at)
    .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime))
    .slice(0, 8);

  if (loading) return <Spinner text="Loading admin overview..." />;
  if (error && !trips.length) return <EmptyState icon="⚠️" title="Overview unavailable" subtitle={error} />;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
        {[
          ["Active trips", String(trips.filter((t) => !t.archived_at).length)],
          ["Total seats", String(buses.reduce((sum, bus) => sum + (bus.seat_capacity || 0), 0))],
          ["Routes", String(routes.length)],
        ].map(([label, value]) => (
          <article key={label} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
            <p style={{ margin: 0, color: "var(--mid)", fontSize: 13 }}>{label}</p>
            <h3 className="mono" style={{ margin: "var(--space-2) 0 0", fontSize: 30 }}>{value}</h3>
          </article>
        ))}
      </section>

      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
        <h2 style={{ margin: 0 }}>Tonight&apos;s Trips</h2>
        {!tonight.length ? (
          <p style={{ color: "var(--mid)" }}>No trips scheduled.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "var(--space-4)" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--mid)" }}>
                <th style={{ paddingBottom: 10 }}>Departure</th>
                <th style={{ paddingBottom: 10 }}>Route</th>
                <th style={{ paddingBottom: 10 }}>Seats Left</th>
              </tr>
            </thead>
            <tbody>
              {tonight.map((trip) => (
                <tr key={trip.id} style={{ borderTop: "1px solid var(--line)" }}>
                  <td className="mono" style={{ padding: "10px 0" }}>{new Date(trip.departure_datetime).toLocaleString()}</td>
                  <td style={{ padding: "10px 0" }}>{trip.route_name || trip.route}</td>
                  <td style={{ padding: "10px 0" }}>{trip.seats_left ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
