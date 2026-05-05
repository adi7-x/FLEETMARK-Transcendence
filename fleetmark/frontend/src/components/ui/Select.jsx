import React from "react";

/**
 * Select — styled <select> with optional label and error.
 * Extends .input + .input-select CSS classes.
 */
export default function Select({
  label,
  error,
  id,
  className = "",
  style,
  children,
  ...rest
}) {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <select id={id} className={`input input-select ${className}`} {...rest}>
        {children}
      </select>
      {error && (
        <span
          style={{
            color: "var(--red)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
