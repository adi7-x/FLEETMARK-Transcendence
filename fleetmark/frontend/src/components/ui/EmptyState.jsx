import React from "react";

/**
 * EmptyState — used when a list/table has no data.
 *
 * icon: Material Symbols name string (e.g. "directions_bus").
 *       Falls back to rendering raw strings (emoji) for
 *       backward compatibility during incremental migration.
 */
export default function EmptyState({ icon, title, subtitle }) {
  // Treat single-word strings without spaces as icon names.
  // Multi-word or emoji strings render raw.
  const isIconName = icon && /^[a-z_]+$/.test(icon);

  return (
    <div
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface)",
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        gap: "var(--space-2)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--surface2)",
          display: "grid",
          placeItems: "center",
          marginBottom: "var(--space-1)",
        }}
      >
        {isIconName ? (
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 24, color: "var(--text-tertiary)" }}
          >
            {icon}
          </span>
        ) : (
          <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{icon}</span>
        )}
      </div>
      <h3
        style={{
          margin: 0,
          color: "var(--text-primary)",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--font-semibold)",
        }}
      >
        {title}
      </h3>
      {subtitle ? (
        <p
          style={{
            margin: 0,
            color: "var(--text-secondary)",
            fontSize: "var(--font-size-base)",
            maxWidth: 360,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
