import React from "react";

/**
 * SkeletonCard — loading placeholder for a KPI/data card.
 *
 * rows: number of skeleton text lines to show below the heading
 *
 * Replaces the blank-page-while-loading pattern with a
 * content-shaped shimmer that communicates structure.
 */
export default function SkeletonCard({ rows = 2, style }) {
  return (
    <div className="card" style={{ display: "grid", gap: "var(--space-3)", ...style }}>
      <div className="skeleton skeleton-heading" style={{ width: "45%" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === rows - 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}
