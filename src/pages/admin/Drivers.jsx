import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const res = await fetch(`${API_BASE}/drivers/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load drivers.");
        const data = await res.json();
        if (active) setDrivers(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load drivers.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner text="Loading drivers..." />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Drivers</h1>
      {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
        {drivers.map((driver) => (
          <article key={driver.id} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
            <h3 style={{ margin: 0 }}>{driver.name}</h3>
            <p className="mono" style={{ margin: "var(--space-2) 0", color: "var(--mid)" }}>@{driver.username}</p>
            <Badge variant={driver.status === "active" ? "green" : "dim"}>{driver.status || "unknown"}</Badge>
          </article>
        ))}
      </div>
    </div>
  );
}
