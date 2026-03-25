import React, { useState } from "react";
import StopPicker from "../../components/shared/StopPicker";
import Spinner from "../../components/ui/Spinner";
import { API_BASE } from "../../services/api";


export default function Onboarding() {
  const [selectedStation, setSelectedStation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!selectedStation) return;
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("fleetmark_access");
      if (!token) throw new Error("Missing access token.");

      const res = await fetch(`${API_BASE}/auth/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ station: selectedStation }),
      });

      if (!res.ok) throw new Error(`Failed to set station (${res.status}).`);
      const updated = await res.json();
      localStorage.setItem("fleetmark_user", JSON.stringify(updated));
      window.location.replace("/passenger");
    } catch (err) {
      setError(err.message || "Failed to save station.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Spinner size={36} text="Saving your station..." />;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bg)", color: "var(--ink)", padding: "var(--space-6)" }}>
      <section style={{ width: "100%", maxWidth: 760, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "var(--space-7)" }}>
        <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.03em" }}>Choose your home station</h1>
        <p style={{ color: "var(--mid)", marginTop: "var(--space-2)" }}>
          Select the station that should be used for your available trip feed.
        </p>

        <div style={{ marginTop: "var(--space-6)" }}>
          <StopPicker selected={selectedStation} onSelect={setSelectedStation} />
        </div>

        {error ? <p style={{ color: "var(--red)", marginTop: "var(--space-4)" }}>{error}</p> : null}

        <div style={{ marginTop: "var(--space-6)", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            disabled={!selectedStation}
            onClick={handleSave}
            style={{
              border: "1px solid var(--blue-bdr)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 16px",
              background: selectedStation ? "var(--blue-bg)" : "var(--surface2)",
              color: selectedStation ? "var(--blue)" : "var(--dim)",
              fontWeight: 700,
              cursor: selectedStation ? "pointer" : "not-allowed",
            }}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
}
