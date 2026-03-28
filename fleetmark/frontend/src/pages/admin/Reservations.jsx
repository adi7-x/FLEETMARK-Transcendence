import React, { useEffect, useMemo, useState } from "react";
import SkeletonTable from "../../components/ui/SkeletonTable";
import EmptyState from "../../components/ui/EmptyState";
import { API_BASE } from "../../services/api";


export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const headers = { Authorization: `Bearer ${token}` };
      const [rRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/reservations/`, { headers }),
        fetch(`${API_BASE}/auth/users/`, { headers }),
      ]);
      if (!rRes.ok || !uRes.ok) throw new Error("Failed to load reservations.");
      const [rData, uData] = await Promise.all([rRes.json(), uRes.json()]);
      setReservations(Array.isArray(rData) ? rData : []);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onRefresh = () => loadReservations();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => window.removeEventListener("fleetmark:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return reservations.filter((reservation) => {
      const user = users.find((item) => item.id === reservation.student);
      const login = (user?.login_42 || "").toLowerCase();
      return login.includes(term);
    });
  }, [query, reservations, users]);

  function getStatus(reservation) {
    const departure = reservation.trip_details?.departure_datetime;
    if (!departure) return { label: "Unknown", color: "var(--mid)" };
    const departureDate = new Date(departure);
    const now = new Date();
    if (departureDate > now) return { label: "Upcoming", color: "var(--blue)" };
    return { label: "Completed", color: "var(--green)" };
  }

  if (loading) return <SkeletonTable cols={5} rows={5} />;

  const hasSearched = query.trim().length > 0;

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Reservations</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a student login to search..."
        style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--line2)", borderRadius: "var(--radius-sm)", padding: "10px 12px", maxWidth: 360 }}
      />
      {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}

      {!hasSearched ? (
        <EmptyState icon="🔍" title="Search for reservations" subtitle={`${reservations.length} total reservations loaded. Type a student login above to filter.`} />
      ) : !filtered.length ? (
        <EmptyState icon="🎫" title="No results" subtitle={`No reservations found for "${query}".`} />
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--line2)", borderRadius: 10, overflow: "hidden" }}>
          <thead>
            <tr style={{ textAlign: "left", background: "var(--surface)" }}>
              <th scope="col" style={{ padding: 10 }}>Student</th>
              <th scope="col" style={{ padding: 10 }}>Trip</th>
              <th scope="col" style={{ padding: 10 }}>Departure</th>
              <th scope="col" style={{ padding: 10 }}>Status</th>
              <th scope="col" style={{ padding: 10 }}>Booked At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((reservation) => {
              const user = users.find((item) => item.id === reservation.student);
              const status = getStatus(reservation);
              const departure = reservation.trip_details?.departure_datetime;
              return (
                <tr key={reservation.id} style={{ borderTop: "1px solid var(--line2)" }}>
                  <td style={{ padding: 10 }}>{user?.login_42 || reservation.student}</td>
                  <td style={{ padding: 10 }}>{reservation.trip_details?.route_name || reservation.trip}</td>
                  <td className="mono" style={{ padding: 10 }}>
                    {departure ? new Date(departure).toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: 10 }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: status.color,
                      background: `color-mix(in srgb, ${status.color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${status.color} 30%, transparent)`,
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td className="mono" style={{ padding: 10 }}>{reservation.created_at ? new Date(reservation.created_at).toLocaleString() : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
