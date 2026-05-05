import React from "react";

/**
 * Fix 5a + 8a + 8c — Reusable SVG route map showing stops
 * with an animated bus dot traveling along the path.
 *
 * Props:
 * - stops: array of stop name strings (default: OCP Saka → Nakhil → 1337)
 * - currentStop: 0-indexed currently-active stop
 * - animated: whether the bus dot animates (default true)
 * - compact: smaller sizing for card embedding
 */
export default function RouteMap({
  stops = ["1337 School", "OCP Saka", "Café Grind"],
  currentStop = 0,
  animated = true,
  compact = false,
}) {
  const height = compact ? 180 : 240;
  const width = compact ? 260 : 360;
  const padX = 30;
  const padY = compact ? 24 : 36;
  const usableWidth = width - padX * 2;
  const centerY = height / 2;

  // Position each stop evenly along the horizontal
  const stopPositions = stops.map((_, i) => ({
    x: padX + (usableWidth / (stops.length - 1)) * i,
    y: centerY,
  }));

  // Build the curved path between stops
  const pathD = stopPositions
    .map((pos, i) => {
      if (i === 0) return `M ${pos.x} ${pos.y}`;
      const prev = stopPositions[i - 1];
      const cpX = (prev.x + pos.x) / 2;
      const cpY1 = prev.y - 28;
      const cpY2 = pos.y - 28;
      return `C ${cpX} ${cpY1}, ${cpX} ${cpY2}, ${pos.x} ${pos.y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Route map: ${stops.join(" → ")}`}
      style={{ width: "100%", height: "auto", maxWidth: width }}
    >
      {/* Background glow */}
      <defs>
        <linearGradient id="route-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent, #818cf8)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--accent, #818cf8)" stopOpacity="0.05" />
        </linearGradient>
        <filter id="route-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Dashed route path — background */}
      <path
        d={pathD}
        stroke="var(--border, #21262d)"
        strokeWidth="2"
        strokeDasharray="6 4"
        fill="none"
      />

      {/* Completed path — solid from start to current stop */}
      {currentStop > 0 && (() => {
        const completedD = stopPositions
          .slice(0, currentStop + 1)
          .map((pos, i) => {
            if (i === 0) return `M ${pos.x} ${pos.y}`;
            const prev = stopPositions[i - 1];
            const cpX = (prev.x + pos.x) / 2;
            return `C ${cpX} ${prev.y - 28}, ${cpX} ${pos.y - 28}, ${pos.x} ${pos.y}`;
          })
          .join(" ");
        return (
          <path
            d={completedD}
            stroke="var(--accent, #818cf8)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        );
      })()}

      {/* Glow path */}
      <path
        d={pathD}
        stroke="var(--accent, #818cf8)"
        strokeWidth="4"
        fill="none"
        opacity="0.15"
        filter="url(#route-glow)"
      />

      {/* Stop circles + labels */}
      {stopPositions.map((pos, i) => {
        const isActive = i === currentStop;
        const isPast = i < currentStop;
        const labelY = i % 2 === 0 ? pos.y + 28 : pos.y + 28;
        return (
          <g key={i}>
            {/* Ring glow for active */}
            {isActive && (
              <circle
                cx={pos.x}
                cy={pos.y}
                r="14"
                fill="none"
                stroke="var(--accent, #818cf8)"
                strokeWidth="1"
                opacity="0.3"
              >
                {animated && (
                  <animate
                    attributeName="r"
                    values="10;16;10"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
            )}
            {/* Stop dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={isActive ? 7 : 5}
              fill={
                isPast
                  ? "var(--green, #16a34a)"
                  : isActive
                  ? "var(--accent, #818cf8)"
                  : "var(--surface3, #212836)"
              }
              stroke={
                isPast
                  ? "var(--green, #16a34a)"
                  : isActive
                  ? "var(--accent, #818cf8)"
                  : "var(--border, #21262d)"
              }
              strokeWidth="2"
            />
            {/* Checkmark for past stops */}
            {isPast && (
              <text
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize="7"
                fontWeight="700"
              >
                ✓
              </text>
            )}
            {/* Stop label */}
            <text
              x={pos.x}
              y={labelY}
              textAnchor="middle"
              fill={isActive ? "var(--text-primary, #e6edf3)" : "var(--text-tertiary, #8b949e)"}
              fontSize={compact ? "9" : "10"}
              fontWeight={isActive ? "700" : "500"}
              fontFamily="Inter, sans-serif"
            >
              {stops[i]}
            </text>
          </g>
        );
      })}

      {/* Animated bus dot along route */}
      {animated && (
        <circle r="5" fill="var(--accent, #818cf8)" stroke="#fff" strokeWidth="1.5" opacity="0.95">
          <animateMotion dur="4s" repeatCount="indefinite" path={pathD} />
        </circle>
      )}
    </svg>
  );
}
