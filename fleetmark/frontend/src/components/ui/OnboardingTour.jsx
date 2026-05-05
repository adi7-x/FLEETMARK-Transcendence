import React, { useEffect, useRef, useState, useCallback } from "react";

const TOUR_COUNT_KEY = "fleetmark_tour_count";
const TOUR_DONE_KEY = "fleetmark_tour_done";

function getTourCount() {
  return Number(localStorage.getItem(TOUR_COUNT_KEY) || "0");
}
function incrementTourCount() {
  const c = getTourCount() + 1;
  localStorage.setItem(TOUR_COUNT_KEY, String(c));
  return c;
}
function isTourDone() {
  return localStorage.getItem(TOUR_DONE_KEY) === "true";
}
function markTourDone() {
  localStorage.setItem(TOUR_DONE_KEY, "true");
}

const ADMIN_STEPS = [
  { title: "Welcome to Fleetmark!", body: "This is your admin dashboard. Let's take a quick tour of the key features.", icon: "waving_hand" },
  { title: "Navigation Sidebar", body: "Use the sidebar to switch between Buses, Stations, Routes, Drivers, and more.", icon: "menu" },
  { title: "Quick Refresh", body: "Hit the refresh button in the header to reload data on any page.", icon: "refresh" },
  { title: "Create Trips", body: "Use the 'New Trip' button to schedule shuttle departures.", icon: "add_circle" },
  { title: "You're all set!", body: "Explore the dashboard and start managing your fleet. Check the Getting Started guide on the Overview page.", icon: "check_circle" },
];

const STUDENT_STEPS = [
  { title: "Welcome aboard!", body: "Fleetmark helps you find and reserve shuttle seats between campuses.", icon: "waving_hand" },
  { title: "Your Dashboard", body: "See tonight's trip, your ride count, and recent activity at a glance.", icon: "dashboard" },
  { title: "Reserve a Seat", body: "Head to Bookings to browse available trips and reserve your seat.", icon: "event_seat" },
  { title: "Stay Updated", body: "Check the notification bell for announcements from the logistics team.", icon: "notifications" },
];

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 9999,
  display: "grid",
  placeItems: "center",
};

const cardStyle = {
  width: "min(440px, 90vw)",
  background: "var(--surface, #fff)",
  border: "1px solid var(--line, #e5e7eb)",
  borderRadius: 14,
  padding: 32,
  display: "grid",
  gap: 16,
  textAlign: "center",
  boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
};

const bannerStyle = {
  background: "color-mix(in srgb, var(--blue) 8%, transparent)",
  border: "1px solid color-mix(in srgb, var(--blue) 20%, var(--line))",
  borderRadius: 10,
  padding: "14px 18px",
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 16,
};

function getFocusable(root) {
  if (!root) return [];
  const sel = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  return Array.from(root.querySelectorAll(sel)).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

export default function OnboardingTour({ role = "STUDENT" }) {
  const [step, setStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [transitionDir, setTransitionDir] = useState("active");
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (transitionDir !== "in") return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setTransitionDir("active"));
    });
    return () => cancelAnimationFrame(id);
  }, [step, transitionDir]);

  useEffect(() => {
    const count = getTourCount();
    const done = isTourDone();

    if (count === 0) {
      incrementTourCount();
      setShowTour(true);
    } else if (count === 1 && done) {
      incrementTourCount();
      setShowBanner(true);
    } else if (!done) {
      setShowTour(true);
    }
  }, []);

  useEffect(() => {
    if (!showTour) return;
    returnFocusRef.current = document.activeElement;
    const t = setTimeout(() => dialogRef.current?.querySelector("button")?.focus(), 50);
    return () => clearTimeout(t);
  }, [showTour]);

  useEffect(() => {
    if (!showTour || !dialogRef.current) return;

    function onKeyDown(e) {
      if (e.key === "Tab") {
        const nodes = getFocusable(dialogRef.current);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showTour, step]);

  const steps = role === "LOGISTICS_STAFF" ? ADMIN_STEPS : STUDENT_STEPS;

  const closeTour = useCallback(() => {
    markTourDone();
    setShowTour(false);
    returnFocusRef.current?.focus?.();
  }, []);

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      setTransitionDir("out");
      setTimeout(() => {
        setStep((s) => s + 1);
        setTransitionDir("in");
      }, 300);
    } else {
      closeTour();
    }
  }, [step, steps.length, closeTour]);

  const skip = useCallback(() => {
    closeTour();
  }, [closeTour]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  if (showBanner) {
    return (
      <div style={bannerStyle}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 22, color: "var(--blue)", fontVariationSettings: "'FILL' 1" }}
        >
          waving_hand
        </span>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: 14 }}>Welcome back!</strong>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--mid)" }}>
            Glad to see you again. Need a refresher? Check the sidebar to navigate.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissBanner}
          style={{ border: "none", background: "transparent", color: "var(--mid)", cursor: "pointer", padding: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      </div>
    );
  }

  if (!showTour) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const stepClass =
    transitionDir === "out" ? "tour-step-exit" : transitionDir === "in" ? "tour-step-enter" : "tour-step-active";

  return (
    <div style={overlayStyle} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        style={{ ...cardStyle, position: "relative", overflow: "hidden", minHeight: 320 }}
      >
        <div
          key={step}
          className={stepClass}
          style={{ position: "relative", width: "100%" }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: 40,
              color: "var(--blue)",
              fontVariationSettings: "'FILL' 1",
              margin: "0 auto",
              display: "block",
            }}
          >
            {current.icon}
          </span>
          <h2 id="tour-title" style={{ margin: "12px 0 0", fontSize: 20, fontWeight: 700 }}>
            {current.title}
          </h2>
          <p style={{ margin: 0, color: "var(--mid)", fontSize: 14, lineHeight: 1.5 }}>{current.body}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "4px 0" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? "var(--blue)" : "var(--line, #e5e7eb)",
                  transition: "width 0.2s ease, background 0.2s ease",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 4 }}>
            {!isLast && (
              <button
                type="button"
                onClick={skip}
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--surface2, #f5f5f5)",
                  color: "var(--mid)",
                  borderRadius: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              style={{
                border: "1px solid var(--blue-bdr, var(--blue))",
                background: "var(--blue-bg)",
                color: "var(--blue)",
                borderRadius: 8,
                padding: "10px 24px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>

          <span style={{ fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
