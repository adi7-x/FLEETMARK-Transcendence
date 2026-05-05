import React from "react";

/**
 * Input — controlled text input with optional label and error.
 * Applies .input CSS class from components.css.
 */
export default function Input({
  label,
  error,
  id,
  className = "",
  style,
  ...rest
}) {
  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <input id={id} className={`input ${className}`} {...rest} />
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
