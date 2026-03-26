import React from "react";

/**
 * Badge — status pill used in tables and cards.
 * Uses design system token variables so it responds
 * correctly to light/dark theme switching.
 */
const palette = {
  green: { bg: "var(--green-light)",  ink: "var(--green)",  border: "var(--green-border)" },
  amber: { bg: "var(--amber-light)",  ink: "var(--amber)",  border: "var(--amber-border)" },
  red:   { bg: "var(--red-light)",    ink: "var(--red)",    border: "var(--red-border)"   },
  blue:  { bg: "var(--blue-light)",   ink: "var(--blue)",   border: "var(--blue-border)"  },
  dim:   { bg: "var(--surface2)",     ink: "var(--text-secondary)", border: "var(--border)" },
};

export default function Badge({ variant = "dim", children }) {
  const current = palette[variant] ?? palette.dim;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-semibold)",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: current.bg,
        color: current.ink,
        border: `1px solid ${current.border}`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
