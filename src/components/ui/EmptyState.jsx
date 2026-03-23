import React from "react";

export default function EmptyState({ icon, title, subtitle }) {
  return (
    <div
      style={{
        border: "1px dashed var(--line)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface)",
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.9rem", marginBottom: "var(--space-3)" }}>{icon}</div>
      <h3 style={{ margin: 0, color: "var(--ink)", fontSize: "1.1rem" }}>{title}</h3>
      {subtitle ? (
        <p style={{ margin: "var(--space-2) 0 0", color: "var(--mid)", fontSize: "0.92rem" }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
