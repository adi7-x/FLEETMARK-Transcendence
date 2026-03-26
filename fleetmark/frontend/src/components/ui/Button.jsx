import React from "react";

/**
 * Reusable Button — replaces all ad-hoc inline button styles.
 *
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * size:    "sm" | "md" | "lg"
 * icon:    Material Symbol name string (optional)
 * iconOnly: true renders a square/circular icon-only button
 */
export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  iconOnly = false,
  className = "",
  children,
  type = "button",
  ...rest
}) {
  const cls = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    iconOnly ? "btn-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : 18;

  return (
    <button type={type} className={cls} {...rest}>
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: iconSize, lineHeight: 1, flexShrink: 0 }}
        >
          {icon}
        </span>
      )}
      {!iconOnly && children}
    </button>
  );
}
