import React from "react";

/**
 * UserIdentity — displays avatar + login + role.
 * Used in sidebar bottom of both Admin and Student layouts.
 *
 * login: string (42 Intra login)
 * role:  string (optional, e.g. "admin", "passenger")
 * compact: boolean — hide name/role, show avatar only (for collapsed sidebar)
 */
export default function UserIdentity({ login = "—", role, compact = false }) {
  const initials = login ? login.slice(0, 2).toUpperCase() : "??";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-2) var(--space-3)",
        borderRadius: "var(--radius-md)",
        minWidth: 0,
      }}
    >
      {/* Avatar circle */}
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--blue-mid)",
          color: "var(--blue)",
          display: "grid",
          placeItems: "center",
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-bold)",
          flexShrink: 0,
          userSelect: "none",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>

      {/* Name + role */}
      {!compact && (
        <div style={{ minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-semibold)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {login}
          </div>
          {role && (
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-tertiary)",
                textTransform: "capitalize",
                marginTop: 1,
              }}
            >
              {role}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
