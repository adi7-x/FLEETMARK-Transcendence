import React from "react";

const palette = {
  green: { bg: "var(--green-bg)", ink: "var(--green)", border: "var(--green)" },
  amber: { bg: "rgba(255, 212, 122, 0.12)", ink: "var(--amber)", border: "var(--amber)" },
  red: { bg: "rgba(238, 125, 119, 0.12)", ink: "var(--red)", border: "var(--red)" },
  blue: { bg: "rgba(173, 198, 255, 0.12)", ink: "var(--blue)", border: "var(--blue)" },
  dim: { bg: "rgba(118, 117, 117, 0.14)", ink: "var(--mid)", border: "var(--dim)" },
};

export default function Badge({ variant = "dim", children }) {
  const current = palette[variant] || palette.dim;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        borderRadius: "999px",
        padding: "4px 10px",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        background: current.bg,
        color: current.ink,
        border: `1px solid ${current.border}`,
      }}
    >
      {children}
    </span>
  );
}
