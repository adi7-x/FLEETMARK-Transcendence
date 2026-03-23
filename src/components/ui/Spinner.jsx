import React from "react";

export default function Spinner({ size = 36, text = "Loading..." }) {
  const borderSize = Math.max(2, Math.round(size / 10));

  return (
    <div
      style={{
        minHeight: "220px",
        width: "100%",
        display: "grid",
        placeItems: "center",
        gap: "var(--space-4)",
        color: "var(--mid)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "999px",
          border: `${borderSize}px solid var(--line)`,
          borderTopColor: "var(--blue)",
          animation: "fleetmark-spin 0.8s linear infinite",
        }}
      />
      {text ? (
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--mid)",
          }}
        >
          {text}
        </p>
      ) : null}
      <style>{`
        @keyframes fleetmark-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
