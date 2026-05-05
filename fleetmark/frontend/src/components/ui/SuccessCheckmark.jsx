import React from "react";

/**
 * Fix 1e — Animated SVG checkmark shown on reservation success.
 * Stroke-draw animation: circle draws first, then the check path.
 */
export default function SuccessCheckmark({ size = 64 }) {
  return (
    <svg
      className="success-checkmark"
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Success"
    >
      <circle
        cx="26"
        cy="26"
        r="25"
        fill="none"
        stroke="var(--green, #16a34a)"
        strokeWidth="2"
      />
      <path
        d="M14.1 27.2l7.1 7.2 16.7-16.8"
        fill="none"
        stroke="var(--green, #16a34a)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
