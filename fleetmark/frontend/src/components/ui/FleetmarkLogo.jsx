import React from "react";

const sizes = {
  sm: { icon: 20, text: "1rem" },
  md: { icon: 24, text: "1.2rem" },
  lg: { icon: 30, text: "1.55rem" },
};

const themes = {
  default: { iconBg: "var(--surface2)", iconInk: "var(--blue)", text: "var(--ink)" },
  white: { iconBg: "rgba(255,255,255,0.15)", iconInk: "#fff", text: "#fff" },
  blue: { iconBg: "var(--blue-bg)", iconInk: "var(--blue)", text: "var(--blue)" },
};

export default function FleetmarkLogo({ size = "md", variant = "default" }) {
  const sizeConfig = sizes[size] || sizes.md;
  const theme = themes[variant] || themes.default;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <div
        aria-hidden="true"
        style={{
          width: `${sizeConfig.icon + 8}px`,
          height: `${sizeConfig.icon + 8}px`,
          borderRadius: "8px",
          border: "1px solid var(--line)",
          display: "grid",
          placeItems: "center",
          background: theme.iconBg,
          color: theme.iconInk,
          fontSize: `${sizeConfig.icon}px`,
          lineHeight: 1,
        }}
      >
        🚌
      </div>
      <span
        style={{
          fontSize: sizeConfig.text,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: theme.text,
        }}
      >
        Fleetmark
      </span>
    </div>
  );
}
