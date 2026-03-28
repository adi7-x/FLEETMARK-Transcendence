import React, { useCallback, useEffect, useMemo, useState } from "react";
import SuccessCheckmark from "../../components/ui/SuccessCheckmark";
import AdminEmptyState from "../../components/ui/AdminEmptyState";
import { API_BASE, getUser } from "../../services/api";

/** Skeleton matching reserve page layout (Fix 7a) */
function ReserveSeatSkeleton() {
  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="skeleton-bar" style={{ width: 180, height: 22, borderRadius: 6 }} />
        <div className="skeleton-bar" style={{ width: 34, height: 34, borderRadius: "50%" }} />
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="skeleton-card"
          style={{
            padding: "var(--space-5)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-4)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ flex: 1, display: "grid", gap: 10 }}>
            <div className="skeleton-bar" style={{ width: "55%", height: 18 }} />
            <div className="skeleton-bar" style={{ width: "40%", height: 14 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <div className="skeleton-bar" style={{ width: 80, height: 12 }} />
              <div className="skeleton-bar" style={{ width: 70, height: 12 }} />
            </div>
          </div>
          <div className="skeleton-bar" style={{ width: 120, height: 40, borderRadius: "var(--radius-sm)" }} />
        </div>
      ))}
    </div>
  );
}

export default function ReserveASeat() {
  const user = useMemo(() => getUser(), []);
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [reservedTripIds, setReservedTripIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  /** null | 'check' (1.5s SVG) | 'toast' — Fix 1e */
  const [successPhase, setSuccessPhase] = useState(null);

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

  useEffect(() => {
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, [load]);

  async function reserve(tripId) {
    setSavingId(tripId);
    setError("");
    setToast("");
    setSuccessPhase(null);
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
      setSuccessPhase("check");
      setTimeout(() => {
        setSuccessPhase("toast");
        setToast("reserved");
        setTimeout(() => {
          setToast("");
          setSuccessPhase(null);
        }, 2200);
      }, 1500);
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

  if (loading) return <ReserveSeatSkeleton />;

  if (error && !trips.length) return <AdminEmptyState variant="trips" onAction={() => window.location.reload()} />;

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      {successPhase === "check" ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            background: "color-mix(in srgb, var(--bg) 75%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "grid", placeItems: "center", gap: 16 }}>
            <SuccessCheckmark size={72} />
            <span className="mono" style={{ fontSize: 12, color: "var(--mid)", fontWeight: 600 }}>Confirming your seat…</span>
          </div>
        </div>
      ) : null}

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

      {successPhase === "toast" && toast === "reserved" ? (
        <div
          className="animate-in"
          style={{
            border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)",
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span className="material-symbols-outlined" style={{ color: "var(--green)", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>Seat reserved successfully!</p>
        </div>
      ) : null}
      {error ? <div style={{ color: "var(--red)" }}>{error}</div> : null}

      {!trips.length ? (
        <AdminEmptyState variant="trips" onAction={() => (window.location.href = "/passenger/settings")} />
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
              className="animate-in"
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
                disabled={alreadyReserved || isFull || savingId === trip.id || successPhase === "check"}
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
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {savingId === trip.id ? (
                  <span className="spinner-border" style={{ width: 16, height: 16, borderWidth: 2 }} aria-hidden />
                ) : (
                  state
                )}
              </button>
            </article>
          );
        })
      )}
    </div>
  );
}
