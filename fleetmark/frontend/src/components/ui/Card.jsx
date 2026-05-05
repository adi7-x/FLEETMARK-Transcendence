import React from "react";

/**
 * Card — wraps content in a consistently styled surface.
 *
 * variant: "default"   — standard elevated card (white on off-white bg)
 *          "subtle"    — nested/secondary content, no shadow
 *          "highlight" — primary/hero panel with stronger shadow
 *
 * Use `as` prop to render as <article>, <section>, etc.
 */
export default function Card({
  variant = "default",
  as: Tag = "div",
  className = "",
  style,
  children,
}) {
  const cls = {
    default: "card",
    subtle: "card-subtle",
    highlight: "card-highlight",
  }[variant] ?? "card";

  return (
    <Tag className={`${cls} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
