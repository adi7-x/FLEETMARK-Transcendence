import React from "react";

/**
 * Admin Settings
 *
 * The configurable flags are not yet backed by API endpoints.
 * Rather than shipping a page with visually-disabled controls
 * (opacity 0.6, pointer-events none), these items are shown
 * in a transparent roadmap callout so the UX is honest.
 */
export default function Settings() {
  const roadmap = [
    {
      label: "Trip notifications",
      help: "Push outbound notifications when a trip status changes.",
      icon: "notifications",
    },
    {
      label: "Student self-service station changes",
      help: "Let passengers update their home stop without admin involvement.",
      icon: "edit_location",
    },
    {
      label: "Maintenance mode",
      help: "Display a maintenance banner across all student screens.",
      icon: "construction",
    },
  ];

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-6)", maxWidth: 640 }}>
      {/* Info banner */}
      <div className="alert alert-info" style={{ alignItems: "flex-start" }}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20, flexShrink: 0, marginTop: 1, fontVariationSettings: "'FILL' 1" }}
        >
          info
        </span>
        <div>
          <strong style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-semibold)" }}>
            Settings are coming in v2.0
          </strong>
          <p style={{ margin: "var(--space-1) 0 0", fontSize: "var(--font-size-sm)", color: "var(--text-secondary)" }}>
            The following controls are planned for the next backend release.
            They&apos;re listed here for visibility — none of them are wired up yet.
          </p>
        </div>
      </div>

      {/* Roadmap items */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {roadmap.map((item, i) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "var(--space-4)",
              padding: "var(--space-5)",
              borderTop: i > 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                background: "var(--surface2)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 18, color: "var(--text-secondary)" }}
              >
                {item.icon}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-semibold)",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: "var(--font-size-xs)",
                    background: "var(--surface2)",
                    color: "var(--text-tertiary)",
                    border: "1px solid var(--border)",
                    borderRadius: 999,
                    padding: "1px 8px",
                    fontWeight: "var(--font-medium)",
                  }}
                >
                  Planned
                </span>
              </div>
              <p
                style={{
                  margin: "var(--space-1) 0 0",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  lineHeight: "var(--leading-normal)",
                }}
              >
                {item.help}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
