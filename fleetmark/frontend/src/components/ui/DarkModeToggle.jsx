import React from "react";
import { useTheme } from "../../context/ThemeContext";
import Toggle from "./Toggle";

export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--mid)" }}>{isDark ? "Dark" : "Light"}</span>
      <Toggle checked={isDark} onChange={toggleTheme} />
    </div>
  );
}
