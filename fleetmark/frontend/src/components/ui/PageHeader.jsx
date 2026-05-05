import React from "react";

/**
 * PageHeader — consistent page-level heading block.
 *
 * eyebrow: small uppercase label above the title (optional)
 * title:   primary h1 heading
 * subtitle: secondary description line (optional)
 * actions: right-side slot for buttons (optional React node)
 */
export default function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: subtitle || eyebrow ? "flex-start" : "center",
        gap: "var(--space-4)",
      }}
    >
      <div>
        {eyebrow && (
          <span
            style={{
              display: "block",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-semibold)",
              color: "var(--blue)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "var(--space-1)",
            }}
          >
            {eyebrow}
          </span>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-bold)",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: "var(--leading-snug)",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "var(--space-1) 0 0",
              fontSize: "var(--font-size-base)",
              color: "var(--text-secondary)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexShrink: 0,
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
