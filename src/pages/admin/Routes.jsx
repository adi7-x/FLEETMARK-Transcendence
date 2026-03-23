import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const res = await fetch(`${API_BASE}/routes/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load routes.");
        const data = await res.json();
        if (active) {
          const list = Array.isArray(data) ? data : [];
          setRoutes(list);
          setSelected(list[0] || null);
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load routes.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner text="Loading routes..." />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-5)" }}>
      <aside style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-4)" }}>
        <h2 style={{ marginTop: 0 }}>Routes</h2>
        {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelected(route)}
              style={{
                textAlign: "left",
                border: "1px solid var(--line2)",
                borderRadius: "var(--radius-sm)",
                background: selected?.id === route.id ? "var(--blue-bg)" : "var(--surface2)",
                color: selected?.id === route.id ? "var(--blue)" : "var(--ink)",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              {route.name}
            </button>
          ))}
        </div>
      </aside>
      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
        <h2 style={{ marginTop: 0 }}>{selected?.name || "Select a route"}</h2>
        <p style={{ color: "var(--mid)" }}>Window: {selected?.window || "-"}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          {(selected?.stations || []).map((stop) => (
            <span key={`${stop.order}-${stop.station.id}`} className="mono" style={{ border: "1px solid var(--line2)", borderRadius: "999px", padding: "6px 10px", background: "var(--surface2)", color: "var(--ink)", fontSize: 13 }}>
              {stop.order}. {stop.station.name}
            </span>
          ))}
          {!selected?.stations?.length ? <p style={{ color: "var(--mid)" }}>No stops available.</p> : null}
        </div>
      </section>
    </div>
  );
}
