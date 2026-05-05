import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FleetmarkLogo from "../../components/ui/FleetmarkLogo";

export default function ComingSoon() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", display: "grid", placeItems: "center", padding: "var(--space-6)" }}>
      <section style={{ width: "100%", maxWidth: 700, border: "1px solid var(--line2)", borderRadius: "var(--radius-lg)", background: "var(--surface)", padding: "var(--space-8)", textAlign: "center" }}>
        <FleetmarkLogo size="lg" />
        <h1 style={{ fontSize: 44, marginBottom: "var(--space-3)" }}>Driver Portal</h1>
        <p className="mono" style={{ color: "var(--mid)", margin: "0 0 var(--space-6)" }}>Coming soon. Driver workflow screens will be activated in a later release.</p>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 20px",
            background: "var(--red-bg)",
            color: "var(--red)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          Sign out
        </button>
      </section>
    </div>
  );
}
