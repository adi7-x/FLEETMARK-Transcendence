import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { API_BASE, getUser } from "../../services/api";



export default function MyReservations() {
  const user = useMemo(() => getUser(), []);
  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("fleetmark_access");
        const [uRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/reservations/?user_id=${encodeURIComponent(user.id)}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/reservations/history/?user_id=${encodeURIComponent(user.id)}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!uRes.ok || !pRes.ok) throw new Error("Failed to load reservations.");
        const [uData, pData] = await Promise.all([uRes.json(), pRes.json()]);
        if (active) {
          setUpcoming(Array.isArray(uData) ? uData : []);
          setPast(Array.isArray(pData) ? pData : []);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load reservations.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function cancelReservation(id) {
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/reservations/${id}/?user_id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to cancel reservation.");
      setUpcoming((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Unable to cancel reservation.");
    }
  }

  const current = tab === "upcoming" ? upcoming : past;
  if (loading) return <Spinner text="Loading reservations..." />;
  if (error && !current.length) return <EmptyState icon="⚠️" title="Reservations unavailable" subtitle={error} />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <div style={{ display: "inline-flex", border: "1px solid var(--line2)", borderRadius: "999px", overflow: "hidden" }}>
        {[
          ["upcoming", `Upcoming (${upcoming.length})`],
          ["past", `Past (${past.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              border: "none",
              padding: "9px 14px",
              cursor: "pointer",
              background: tab === id ? "var(--blue-bg)" : "var(--surface2)",
              color: tab === id ? "var(--blue)" : "var(--mid)",
              fontWeight: 700,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p style={{ color: "var(--red)", margin: 0 }}>{error}</p> : null}

      {!current.length ? (
        <EmptyState icon="🎫" title={tab === "upcoming" ? "No upcoming reservations" : "No past reservations"} />
      ) : (
        current.map((item) => {
          const departure = item.trip_details?.departure_datetime || null;
          return (
            <article key={item.id} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)" }}>
              <div>
                <h3 style={{ margin: 0 }}>{item.trip_details?.route_name || "Trip"}</h3>
                <p className="mono" style={{ margin: "var(--space-2) 0 0", color: "var(--mid)" }}>
                  {departure ? new Date(departure).toLocaleString() : "Time not available"}
                </p>
              </div>
              {tab === "upcoming" ? (
                <button
                  type="button"
                  onClick={() => cancelReservation(item.id)}
                  style={{
                    border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)",
                    background: "var(--red-bg)",
                    color: "var(--red)",
                    borderRadius: "var(--radius-sm)",
                    padding: "9px 12px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </article>
          );
        })
      )}
    </div>
  );
}
