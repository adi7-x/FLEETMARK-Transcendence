import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import { API_BASE } from "../../services/api";


export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const headers = { Authorization: `Bearer ${token}` };
        const [rRes, uRes] = await Promise.all([
          fetch(`${API_BASE}/reservations/`, { headers }),
          fetch(`${API_BASE}/auth/users/`, { headers }),
        ]);
        if (!rRes.ok || !uRes.ok) throw new Error("Failed to load reservations.");
        const [rData, uData] = await Promise.all([rRes.json(), uRes.json()]);
        if (active) {
          setReservations(Array.isArray(rData) ? rData : []);
          setUsers(Array.isArray(uData) ? uData : []);
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
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return reservations;
    return reservations.filter((reservation) => {
      const user = users.find((item) => item.id === reservation.student);
      const login = (user?.login_42 || "").toLowerCase();
      return login.includes(term);
    });
  }, [query, reservations, users]);

  if (loading) return <Spinner text="Loading reservations..." />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Reservations</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by student login"
        style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line2)", borderRadius: "var(--radius-sm)", padding: "10px 12px", maxWidth: 360 }}
      />
      {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--line2)", borderRadius: 10, overflow: "hidden" }}>
        <thead>
          <tr style={{ textAlign: "left", background: "var(--surface)" }}>
            <th style={{ padding: 10 }}>Student</th>
            <th style={{ padding: 10 }}>Trip</th>
            <th style={{ padding: 10 }}>Booked At</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((reservation) => {
            const user = users.find((item) => item.id === reservation.student);
            return (
              <tr key={reservation.id} style={{ borderTop: "1px solid var(--line2)" }}>
                <td style={{ padding: 10 }}>{user?.login_42 || reservation.student}</td>
                <td style={{ padding: 10 }}>{reservation.trip_details?.route_name || reservation.trip}</td>
                <td className="mono" style={{ padding: 10 }}>{reservation.created_at ? new Date(reservation.created_at).toLocaleString() : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
