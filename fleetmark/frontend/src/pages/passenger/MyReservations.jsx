import React, { useCallback, useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import ReportModal from "../../components/ui/ReportModal";
import { API_BASE, getUser } from "../../services/api";

function ReservationsSkeleton() {
  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <div className="skeleton" style={{ height: 38, width: 220, borderRadius: 999 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "grid", gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: 160, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 12, width: 120, borderRadius: 4 }} />
          </div>
          <div className="skeleton" style={{ height: 36, width: 70, borderRadius: "var(--radius-sm)" }} />
        </div>
      ))}
    </div>
  );
}



export default function MyReservations() {
  const user = useMemo(() => getUser(), []);
  const [tab, setTab] = useState("upcoming");
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [reportingTrip, setReportingTrip] = useState(null);

  const load = useCallback(async () => {
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
      setUpcoming(Array.isArray(uData) ? uData : []);
      setPast(Array.isArray(pData) ? pData : []);
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Listen for header refresh button
  useEffect(() => {
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, [load]);

  async function cancelReservation(id) {
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/reservations/${id}/?user_id=${encodeURIComponent(user.id)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to cancel reservation.");
      setUpcoming((prev) => prev.filter((item) => item.id !== id));
      setConfirmCancel(null);
    } catch (err) {
      setError(err.message || "Unable to cancel reservation.");
    }
  }

  const current = tab === "upcoming" ? upcoming : past;
  if (loading) return <ReservationsSkeleton />;
  if (error && !current.length) return <EmptyState icon="⚠️" title="Reservations unavailable" subtitle={error} />;

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      {reportingTrip && (
        <ReportModal 
          trip={reportingTrip.trip_details || reportingTrip} 
          onClose={() => setReportingTrip(null)} 
          onExpectedSuccess={() => {
            setReportingTrip(null);
            alert("Report submitted successfully.");
          }} 
        />
      )}
      
      {/* Header with tabs and refresh */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      {error ? <p style={{ color: "var(--red)", margin: 0 }}>{error}</p> : null}

      {!current.length ? (
        <div
          style={{
            border: "1px dashed var(--border)",
            borderRadius: 14,
            background: "var(--surface)",
            padding: "var(--space-8) var(--space-6)",
            textAlign: "center",
            display: "grid",
            placeItems: "center",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface2)", display: "grid", placeItems: "center" }}>
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🎫</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
            {tab === "upcoming" ? "No upcoming reservations" : "No past reservations"}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", maxWidth: 300 }}>
            {tab === "upcoming" ? "Book a seat to secure your spot on the next shuttle." : "Your completed rides will appear here."}
          </p>
          {tab === "upcoming" && (
            <button
              type="button"
              onClick={() => window.location.href = "/passenger/reserve"}
              style={{
                border: "1px solid var(--blue-border, var(--blue))",
                background: "var(--blue-light)",
                color: "var(--blue)",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 12,
                marginTop: 6,
              }}
            >
              Book a Seat →
            </button>
          )}
        </div>
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
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setReportingTrip(item)}
                  style={{
                    border: "none", background: "transparent", color: "var(--mid)",
                    fontSize: 12, cursor: "pointer", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>report</span>
                  Report
                </button>
              {tab === "upcoming" ? (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(item)}
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
              </div>
            </article>
          );
        })
      )}

      {/* Cancel Confirmation Modal */}
      {confirmCancel ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Cancel Reservation</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Are you sure you want to cancel your reservation for <strong>{confirmCancel.trip_details?.route_name || "this trip"}</strong>?
              Your seat will be released.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setConfirmCancel(null)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Keep
              </button>
              <button type="button" onClick={() => cancelReservation(confirmCancel.id)} style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", background: "var(--red-bg)", color: "var(--red)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
