import React from "react";

/**
 * Fix 5b + 6a — Custom empty state illustrations for admin pages.
 * Each variant has a unique inline SVG illustration.
 */

function TripIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Bus body */}
      <rect x="15" y="20" width="55" height="32" rx="6" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Windows */}
      <rect x="20" y="26" width="10" height="10" rx="2" fill="var(--accent-light, rgba(99,102,241,0.1))" />
      <rect x="33" y="26" width="10" height="10" rx="2" fill="var(--accent-light, rgba(99,102,241,0.1))" />
      <rect x="46" y="26" width="10" height="10" rx="2" fill="var(--accent-light, rgba(99,102,241,0.1))" />
      {/* Headlight */}
      <rect x="62" y="30" width="6" height="5" rx="1.5" fill="var(--accent, #818cf8)" opacity="0.6" />
      {/* Wheels */}
      <circle cx="28" cy="56" r="5" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      <circle cx="56" cy="56" r="5" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Road */}
      <line x1="5" y1="63" x2="95" y2="63" stroke="var(--border, #21262d)" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Question mark */}
      <circle cx="78" cy="28" r="12" fill="var(--accent-light, rgba(99,102,241,0.1))" stroke="var(--accent, #818cf8)" strokeWidth="1.5" />
      <text x="78" y="33" textAnchor="middle" fill="var(--accent, #818cf8)" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">?</text>
    </svg>
  );
}

function BusIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Garage */}
      <rect x="15" y="15" width="70" height="55" rx="4" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Garage door lines */}
      <line x1="22" y1="28" x2="78" y2="28" stroke="var(--border, #21262d)" strokeWidth="1" />
      <line x1="22" y1="38" x2="78" y2="38" stroke="var(--border, #21262d)" strokeWidth="1" />
      <line x1="22" y1="48" x2="78" y2="48" stroke="var(--border, #21262d)" strokeWidth="1" />
      <line x1="22" y1="58" x2="78" y2="58" stroke="var(--border, #21262d)" strokeWidth="1" />
      {/* Parking spot P */}
      <circle cx="50" cy="43" r="14" fill="none" stroke="var(--accent, #818cf8)" strokeWidth="1.5" opacity="0.5" />
      <text x="50" y="49" textAnchor="middle" fill="var(--accent, #818cf8)" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif" opacity="0.7">P</text>
      {/* Roof accent */}
      <rect x="15" y="12" width="70" height="6" rx="3" fill="var(--accent, #818cf8)" opacity="0.2" />
    </svg>
  );
}

function RouteIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Map background */}
      <rect x="10" y="10" width="80" height="70" rx="8" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Grid lines */}
      <line x1="10" y1="35" x2="90" y2="35" stroke="var(--border, #21262d)" strokeWidth="0.8" opacity="0.5" />
      <line x1="10" y1="55" x2="90" y2="55" stroke="var(--border, #21262d)" strokeWidth="0.8" opacity="0.5" />
      <line x1="40" y1="10" x2="40" y2="80" stroke="var(--border, #21262d)" strokeWidth="0.8" opacity="0.5" />
      <line x1="65" y1="10" x2="65" y2="80" stroke="var(--border, #21262d)" strokeWidth="0.8" opacity="0.5" />
      {/* Empty path dots */}
      <circle cx="30" cy="25" r="4" fill="var(--accent, #818cf8)" opacity="0.3" />
      <circle cx="52" cy="45" r="4" fill="var(--accent, #818cf8)" opacity="0.3" />
      <circle cx="75" cy="65" r="4" fill="var(--accent, #818cf8)" opacity="0.3" />
      {/* Dashed line (no real path drawn) */}
      <path d="M 30 25 L 52 45 L 75 65" stroke="var(--accent, #818cf8)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.2" />
      {/* No-path indicator */}
      <circle cx="52" cy="45" r="16" fill="none" stroke="var(--accent, #818cf8)" strokeWidth="1" opacity="0.2" strokeDasharray="3 2" />
    </svg>
  );
}

function StationIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Station building */}
      <rect x="20" y="18" width="60" height="50" rx="4" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Roof */}
      <path d="M15 20 L50 5 L85 20" stroke="var(--accent, #818cf8)" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* Door */}
      <rect x="40" y="42" width="20" height="26" rx="3" fill="var(--accent-light, rgba(99,102,241,0.1))" stroke="var(--accent, #818cf8)" strokeWidth="1" opacity="0.5" />
      {/* Windows */}
      <rect x="27" y="28" width="12" height="10" rx="2" fill="var(--accent-light, rgba(99,102,241,0.1))" />
      <rect x="61" y="28" width="12" height="10" rx="2" fill="var(--accent-light, rgba(99,102,241,0.1))" />
      {/* Platform line */}
      <line x1="10" y1="70" x2="90" y2="70" stroke="var(--border, #21262d)" strokeWidth="2" />
      {/* Pin marker */}
      <circle cx="50" cy="14" r="4" fill="var(--accent, #818cf8)" opacity="0.4" />
    </svg>
  );
}

function DriverIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Person head */}
      <circle cx="50" cy="28" r="14" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Cap visor */}
      <path d="M36 25 Q50 18 64 25" stroke="var(--accent, #818cf8)" strokeWidth="2" fill="none" opacity="0.6" />
      <line x1="36" y1="25" x2="64" y2="25" stroke="var(--accent, #818cf8)" strokeWidth="1.5" opacity="0.4" />
      {/* Body */}
      <path d="M30 72 Q30 48 50 45 Q70 48 70 72" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Steering wheel */}
      <circle cx="50" cy="62" r="8" fill="none" stroke="var(--accent, #818cf8)" strokeWidth="1.5" opacity="0.3" />
      <line x1="50" y1="54" x2="50" y2="70" stroke="var(--accent, #818cf8)" strokeWidth="1" opacity="0.3" />
      <line x1="42" y1="62" x2="58" y2="62" stroke="var(--accent, #818cf8)" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function AnnouncementIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Megaphone body */}
      <path d="M25 35 L60 22 L60 62 L25 49 Z" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Handle */}
      <rect x="15" y="35" width="12" height="14" rx="3" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Sound waves */}
      <path d="M65 30 Q75 42 65 54" stroke="var(--accent, #818cf8)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M72 24 Q85 42 72 60" stroke="var(--accent, #818cf8)" strokeWidth="1.5" fill="none" opacity="0.3" />
      <path d="M79 18 Q95 42 79 66" stroke="var(--accent, #818cf8)" strokeWidth="1.5" fill="none" opacity="0.15" />
      {/* Small lines (notification marks) */}
      <line x1="68" y1="42" x2="74" y2="42" stroke="var(--accent, #818cf8)" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function ReportIllustration() {
  return (
    <svg width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Paper */}
      <rect x="22" y="8" width="56" height="72" rx="4" fill="var(--surface3, #212836)" stroke="var(--border, #21262d)" strokeWidth="1.5" />
      {/* Chart bars */}
      <rect x="32" y="50" width="8" height="18" rx="2" fill="var(--accent, #818cf8)" opacity="0.3" />
      <rect x="46" y="38" width="8" height="30" rx="2" fill="var(--accent, #818cf8)" opacity="0.5" />
      <rect x="60" y="28" width="8" height="40" rx="2" fill="var(--accent, #818cf8)" opacity="0.7" />
      {/* Header lines */}
      <line x1="30" y1="18" x2="55" y2="18" stroke="var(--border, #21262d)" strokeWidth="2" />
      <line x1="30" y1="24" x2="44" y2="24" stroke="var(--border, #21262d)" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

const VARIANTS = {
  trips: {
    illustration: TripIllustration,
    title: "No trips scheduled yet",
    subtitle: "Create your first trip to start managing shuttle departures.",
    ctaLabel: "New Trip",
    ctaIcon: "add_box",
  },
  buses: {
    illustration: BusIllustration,
    title: "No buses registered",
    subtitle: "Add a bus to your fleet to start assigning them to trips.",
    ctaLabel: "Add Bus",
    ctaIcon: "directions_bus",
  },
  routes: {
    illustration: RouteIllustration,
    title: "No routes created",
    subtitle: "Define a route with stops to create trip schedules.",
    ctaLabel: "Create Route",
    ctaIcon: "route",
  },
  stations: {
    illustration: StationIllustration,
    title: "No stations registered",
    subtitle: "Add a station to define stops on your shuttle routes.",
    ctaLabel: "New Station",
    ctaIcon: "add_location",
  },
  drivers: {
    illustration: DriverIllustration,
    title: "No drivers registered",
    subtitle: "Add a driver to assign them to trips and manage schedules.",
    ctaLabel: "New Driver",
    ctaIcon: "person_add",
  },
  announcements: {
    illustration: AnnouncementIllustration,
    title: "No announcements yet",
    subtitle: "Use the form above to publish your first announcement.",
    ctaLabel: null,
    ctaIcon: null,
  },
  reports: {
    illustration: ReportIllustration,
    title: "No reports submitted",
    subtitle: "Incident reports from passengers will appear here.",
    ctaLabel: null,
    ctaIcon: null,
  },
};

/**
 * AdminEmptyState — contextual empty state for admin pages.
 * @param {string} variant - "trips" | "buses" | "routes"
 * @param {function} onAction - callback when CTA is clicked
 */
export default function AdminEmptyState({ variant = "trips", onAction }) {
  const v = VARIANTS[variant] || VARIANTS.trips;
  const Illustration = v.illustration;

  return (
    <div
      className="animate-in"
      style={{
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--surface)",
        padding: "var(--space-8) var(--space-6)",
        textAlign: "center",
        display: "grid",
        placeItems: "center",
        gap: "var(--space-3)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Illustration />
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
        {v.title}
      </h3>
      <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", maxWidth: 340 }}>
        {v.subtitle}
      </p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--accent, var(--blue))",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "10px 20px",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            marginTop: 4,
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
          >
            {v.ctaIcon}
          </span>
          {v.ctaLabel}
        </button>
      )}
    </div>
  );
}
