import React from "react";

export default function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        position: "relative",
        width: "48px",
        height: "28px",
        borderRadius: "999px",
        border: "1px solid var(--line)",
        background: checked ? "var(--blue-bg)" : "var(--surface2)",
        cursor: "pointer",
        transition: "background 0.2s ease",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "3px",
          left: checked ? "24px" : "3px",
          width: "20px",
          height: "20px",
          borderRadius: "999px",
          background: checked ? "var(--blue)" : "var(--mid)",
          transition: "left 0.2s ease, background 0.2s ease",
        }}
      />
    </button>
  );
}
