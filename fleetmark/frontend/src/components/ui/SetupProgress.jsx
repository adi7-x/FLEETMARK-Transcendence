import React from "react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { key: "stations", label: "Add stations",   path: "/admin/stations",  icon: "location_on",   desc: "Define pick-up & drop-off points" },
  { key: "buses",    label: "Register buses",  path: "/admin/buses",     icon: "directions_bus", desc: "Add your fleet vehicles" },
  { key: "routes",   label: "Create routes",   path: "/admin/routes",    icon: "map",            desc: "Link stations into routes" },
  { key: "trips",    label: "Schedule trips",   path: "/admin/trips",     icon: "event_seat",     desc: "Assign bus + route + time" },
];

/**
 * Shows inline setup progress on each admin page.
 *   currentStep — "stations" | "buses" | "routes" | "trips"
 *   done       — true if this page's step has data
 */
export default function SetupProgress({ currentStep, done }) {
  const navigate = useNavigate();
  const idx = STEPS.findIndex((s) => s.key === currentStep);
  if (idx < 0) return null;

  const next = idx < STEPS.length - 1 ? STEPS[idx + 1] : null;
  const stepNum = idx + 1;

  // If current step done and there IS a next step → show "next step" banner
  if (done && next) {
    return (
      <div
        style={{
          background: "color-mix(in srgb, var(--green, #22c55e) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--green, #22c55e) 25%, var(--line))",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--green, #22c55e)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>check</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong style={{ fontSize: 13, color: "var(--green, #22c55e)" }}>
            Step {stepNum} complete!
          </strong>
          <span style={{ fontSize: 13, color: "var(--mid)", marginLeft: 8 }}>
            Next up: {next.desc}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate(next.path)}
          style={{
            border: "1px solid var(--blue-bdr, var(--blue))",
            background: "var(--blue-bg)",
            color: "var(--blue)",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            transition: "opacity 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{next.icon}</span>
          {next.label}
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
        </button>
      </div>
    );
  }

  // If current step done and no next step → all done!
  if (done && !next) {
    return (
      <div
        style={{
          background: "color-mix(in srgb, var(--green, #22c55e) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--green, #22c55e) 25%, var(--line))",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--green, #22c55e)", fontVariationSettings: "'FILL' 1" }}>
          celebration
        </span>
        <div>
          <strong style={{ fontSize: 13, color: "var(--green, #22c55e)" }}>Setup complete!</strong>
          <span style={{ fontSize: 13, color: "var(--mid)", marginLeft: 8 }}>
            Your shuttle system is ready to go.
          </span>
        </div>
      </div>
    );
  }

  // Not done → show current step indicator with progress dots
  return (
    <div
      style={{
        background: "color-mix(in srgb, var(--blue) 6%, transparent)",
        border: "1px solid color-mix(in srgb, var(--blue) 18%, var(--line))",
        borderRadius: 10,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "var(--blue)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {stepNum}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 13, color: "var(--blue)" }}>
          Step {stepNum} of {STEPS.length}
        </strong>
        <span style={{ fontSize: 13, color: "var(--mid)", marginLeft: 8 }}>
          {STEPS[idx].desc}
        </span>
      </div>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === idx ? 16 : 6,
              height: 6,
              borderRadius: 3,
              background: i < idx ? "var(--green, #22c55e)" : i === idx ? "var(--blue)" : "var(--line, #e5e7eb)",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
