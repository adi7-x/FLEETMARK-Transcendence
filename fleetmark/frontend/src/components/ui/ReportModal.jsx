import React, { useState } from "react";
import { API_BASE } from "../../services/api";

export default function ReportModal({ trip, onClose, onExpectedSuccess }) {
  const [category, setCategory] = useState("late");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({
          trip: trip.id || trip.trip_id || trip.trip,
          category,
          description
        })
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.detail || "Failed to submit report.");
      }

      onExpectedSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  return (
    <div className="modal-backdrop-anim" style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", 
      display: "grid", placeItems: "center", zIndex: 1000
    }}>
      <div style={{
        width: "min(400px, 90vw)", background: "var(--surface)", 
        borderRadius: "var(--radius-md)", padding: "var(--space-6)",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Report Issue</h3>
          <button type="button" onClick={onClose} style={{
             background: "none", border: "none", cursor: "pointer", color: "var(--dim)"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        <div style={{ marginBottom: 16, padding: 12, background: "var(--surface2)", borderRadius: 8, fontSize: 13, color: "var(--mid)" }}>
          Reporting an issue for Trip: <strong>{trip.route_name || "Assigned Shuttle"}</strong><br/>
          Departure: {new Date(trip.departure_datetime || trip.created_at).toLocaleString()}
        </div>

        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Issue Type</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)" }}
            >
              <option value="late">Bus is Late</option>
              <option value="no_show">Bus Did Not Show Up</option>
              <option value="full">Bus was Full</option>
              <option value="accident">Accident / Breakdown</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details..."
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink)", minHeight: 80, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{
              padding: "8px 16px", borderRadius: 8, background: "transparent", 
              border: "1px solid var(--line)", cursor: "pointer", fontWeight: 700
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              padding: "8px 16px", borderRadius: 8, background: "var(--red)", color: "white",
              border: "none", cursor: "pointer", fontWeight: 700
            }}>
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
