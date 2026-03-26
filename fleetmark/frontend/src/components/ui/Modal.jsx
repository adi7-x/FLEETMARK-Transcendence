import React, { useEffect, useRef } from "react";

/**
 * Modal — accessible dialog with focus management and keyboard close.
 *
 * Fixes audit issues:
 *  - role="dialog" + aria-modal="true"
 *  - Escape key closes modal
 *  - Click-outside closes modal
 *  - tabIndex={-1} so focus moves into the modal on open
 *
 * title:   heading shown at the top
 * footer:  React node rendered in the footer row (usually buttons)
 * onClose: called on Escape or backdrop click
 * open:    controls visibility
 */
export default function Modal({ open, title, onClose, footer, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Move focus into the modal
    dialogRef.current?.focus();

    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="modal"
        ref={dialogRef}
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        {title && (
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
        )}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
