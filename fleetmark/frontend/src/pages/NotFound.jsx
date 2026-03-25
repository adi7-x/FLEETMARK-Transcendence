import React from "react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)", display: "grid", placeItems: "center", padding: "var(--space-6)" }}>
      <section style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-7)", textAlign: "center", maxWidth: 520 }}>
        <h1 style={{ margin: 0, fontSize: 56, letterSpacing: "-0.04em" }}>404</h1>
        <p style={{ color: "var(--mid)" }}>The requested page does not exist.</p>
        <a href="/" style={{ display: "inline-block", marginTop: "var(--space-3)", border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: "var(--radius-sm)", padding: "9px 14px", fontWeight: 700 }}>
          Go home
        </a>
      </section>
    </div>
  );
}
