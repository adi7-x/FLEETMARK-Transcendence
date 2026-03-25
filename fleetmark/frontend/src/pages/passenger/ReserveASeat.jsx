import React, { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { API_BASE, getUser } from "../../services/api";



export default function ReserveASeat() {
  const user = useMemo(() => getUser(), []);
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [reservedTripIds, setReservedTripIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("fleetmark_access");
      const [t, r, b] = await Promise.all([
        fetch(`${API_BASE}/trips/available/?station_id=${encodeURIComponent(user.station)}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/reservations/?user_id=${encodeURIComponent(user.id)}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/buses/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!t.ok || !r.ok || !b.ok) throw new Error("Failed to load trips.");
      const [tData, rData, bData] = await Promise.all([t.json(), r.json(), b.json()]);
      setTrips(Array.isArray(tData) ? tData : []);
      setBuses(Array.isArray(bData) ? bData : []);
      setReservedTripIds((Array.isArray(rData) ? rData : []).map((item) => item.trip_details?.id || item.trip));
    } catch (err) {
      setError(err.message || "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.station]);

  useEffect(() => {
    load();
  }, [load]);

  // Listen for header refresh button
  useEffect(() => {
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, [load]);

  async function reserve(tripId) {
    setSavingId(tripId);
    setError("");
    setToast("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/reservations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trip: tripId, user_id: user.id }),
      });
      if (!res.ok) throw new Error("Reservation failed.");
      setReservedTripIds((prev) => [...new Set([...prev, tripId])]);
      setToast("Seat reserved successfully.");
      setTimeout(() => setToast(""), 2300);
    } catch (err) {
      setError(err.message || "Unable to reserve this trip.");
    } finally {
      setSavingId("");
    }
  }

  function seatColor(seatsLeft, capacity) {
    if (!capacity || capacity <= 0) return "var(--mid)";
    const pct = seatsLeft / capacity;
    if (pct <= 0.2) return "var(--red)";
    if (pct <= 0.5) return "#e67e22";
    return "var(--green)";
  }

  if (loading) return <Spinner text="Loading available trips..." />;
  if (error && !trips.length) return <EmptyState icon="⚠️" title="Trip feed unavailable" subtitle={error} />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      {/* Header with refresh */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Available Trips</h2>
        <button
          type="button"
          onClick={load}
          style={{
            border: "1px solid var(--line2)",
            background: "var(--surface)",
            color: "var(--dim)",
            borderRadius: "50%",
            width: 34,
            height: 34,
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
        </button>
      </div>

      {toast ? (
        <div style={{ border: "1px solid var(--green)", color: "var(--green)", background: "var(--green-bg)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
          {toast}
        </div>
      ) : null}
      {error ? <div style={{ color: "var(--red)" }}>{error}</div> : null}

      {!trips.length ? (
        <EmptyState icon="🚌" title="No upcoming trips" subtitle="Try again later or update your home station." />
      ) : (
        trips.map((trip) => {
          const alreadyReserved = reservedTripIds.includes(trip.id);
          const isFull = typeof trip.seats_left === "number" && trip.seats_left <= 0;
          const state = alreadyReserved ? "Reserved" : isFull ? "Full" : "Reserve →";
          const cap = Number(buses.find((bus) => bus.id === trip.bus)?.seat_capacity ?? trip.bus_seat_capacity ?? 0);
          const left = Number(trip.seats_left ?? 0);
          return (
            <article
              key={trip.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface)",
                padding: "var(--space-5)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--space-4)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{trip.route_name || "Shuttle Trip"}</h3>
                <p className="mono" style={{ margin: "var(--space-2) 0 0", color: "var(--mid)", fontSize: 13 }}>
                  {new Date(trip.departure_datetime).toLocaleString()}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
                  {trip.bus_name ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mid)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>directions_bus</span>
                      {trip.bus_name}
                    </span>
                  ) : null}
                  {cap > 0 ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: seatColor(left, cap), fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event_seat</span>
                      {left}/{cap} seats
                    </span>
                  ) : typeof trip.seats_left === "number" ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mid)", fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event_seat</span>
                      {left} seats left
                    </span>
                  ) : null}
                  {trip.route_stops_count ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--mid)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                      {trip.route_stops_count} stops
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                disabled={alreadyReserved || isFull || savingId === trip.id}
                onClick={() => reserve(trip.id)}
                style={{
                  minWidth: 120,
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  background: alreadyReserved ? "var(--green-bg)" : isFull ? "var(--red-bg)" : "var(--blue-bg)",
                  color: alreadyReserved ? "var(--green)" : isFull ? "var(--red)" : "var(--blue)",
                  cursor: alreadyReserved || isFull ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {savingId === trip.id ? "Loading..." : state}
              </button>
            </article>
          );
        })
      )}
    </div>
  );
}
