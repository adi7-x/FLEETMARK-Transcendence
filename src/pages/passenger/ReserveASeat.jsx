import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/+$/, "");

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("fleetmark_user") || "null");
  } catch {
    return null;
  }
}

export default function ReserveASeat() {
  const user = useMemo(() => getUser(), []);
  const [trips, setTrips] = useState([]);
  const [reservedTripIds, setReservedTripIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("fleetmark_access");
        const [t, r] = await Promise.all([
          fetch(`${API_BASE}/trips/available/?station_id=${encodeURIComponent(user.station)}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/reservations/?user_id=${encodeURIComponent(user.id)}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!t.ok || !r.ok) throw new Error("Failed to load trips.");
        const [tData, rData] = await Promise.all([t.json(), r.json()]);
        if (active) {
          setTrips(Array.isArray(tData) ? tData : []);
          setReservedTripIds((Array.isArray(rData) ? rData : []).map((item) => item.trip_details?.id || item.trip));
        }
      } catch (err) {
        if (active) setError(err.message || "Unable to load trips.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.station]);

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

  if (loading) return <Spinner text="Loading available trips..." />;
  if (error && !trips.length) return <EmptyState icon="⚠️" title="Trip feed unavailable" subtitle={error} />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
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
          const state = alreadyReserved ? "Reserved" : isFull ? "Full" : "Reserve";
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
              <div>
                <h3 style={{ margin: 0 }}>Departure</h3>
                <p className="mono" style={{ margin: "var(--space-2) 0 0", color: "var(--mid)" }}>
                  {new Date(trip.departure_datetime).toLocaleString()}
                </p>
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
