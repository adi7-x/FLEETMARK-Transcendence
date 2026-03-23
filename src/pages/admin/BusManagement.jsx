import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const res = await fetch(`${API_BASE}/buses/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load buses.");
        const data = await res.json();
        if (active) setBuses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load buses.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner text="Loading buses..." />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Bus Management</h1>
      {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--line2)", borderRadius: 10, overflow: "hidden" }}>
        <thead>
          <tr style={{ textAlign: "left", background: "var(--surface)" }}>
            <th style={{ padding: 10 }}>Name</th>
            <th style={{ padding: 10 }}>Plate</th>
            <th style={{ padding: 10 }}>Seat Capacity</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus) => (
            <tr key={bus.id} style={{ borderTop: "1px solid var(--line2)" }}>
              <td style={{ padding: 10 }}>{bus.name}</td>
              <td className="mono" style={{ padding: 10 }}>{bus.plate}</td>
              <td className="mono" style={{ padding: 10 }}>{bus.seat_capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
