import React, { useEffect, useRef, useState } from "react";

const EXIT_MS = 180;

/**
 * Modal — accessible dialog with focus management, keyboard close,
 * and enter/exit scale + fade animations (Fix 1c).
 */
export default function Modal({ open, title, onClose, footer, children }) {
  const dialogRef = useRef(null);
  const [rendered, setRendered] = useState(open);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef(null);

  useEffect(() => {
    if (open) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setRendered(true);
      setExiting(false);
      return;
    }
    if (!rendered) return;
    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setRendered(false);
      setExiting(false);
      exitTimerRef.current = null;
    }, EXIT_MS);
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered || exiting) return;
    dialogRef.current?.focus();

    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [rendered, exiting, onClose]);

  if (!rendered) return null;

  const backdropClass = exiting ? "modal-backdrop modal-backdrop-exit" : "modal-backdrop modal-backdrop-anim";
  const panelClass = exiting ? "modal modal-exit" : "modal modal-anim";

  return (
    <div
      className={backdropClass}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={panelClass}
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
