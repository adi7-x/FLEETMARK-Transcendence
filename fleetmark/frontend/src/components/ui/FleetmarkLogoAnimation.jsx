import React, { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   FleetmarkLogoAnimation
   "F1337-MARK" ──bus──▶ "FLEETMARK"

   Timing is driven by React useEffect + setTimeout so it is
   100 % reliable. No CSS animation-delay hacks.
───────────────────────────────────────────────────────────── */

// hit = ms after mount when bus passes this character
const CHARS = [
  { f: "F",  t: "F",  hit: null },
  { f: "1",  t: "L",  hit: 720  },
  { f: "3",  t: "E",  hit: 960  },
  { f: "3",  t: "E",  hit: 1200 },
  { f: "7",  t: "T",  hit: 1440 },
  { f: "-",  t: null, hit: 1610 }, // vanishes
  { f: "M",  t: "M",  hit: null },
  { f: "A",  t: "A",  hit: null },
  { f: "R",  t: "R",  hit: null },
  { f: "K",  t: "K",  hit: null },
];

const BUS_DURATION = 2200; // ms for bus to travel across
const BUS_FADE     = 2500; // ms when bus shrinks away (after end of travel)
const SUB_DELAY    = 2000; // ms before subtitle fades in

// Subtitle words colored sequentially by the bus sweep
// Each word lights up at this ms after mount
const SUB_WORDS = [
  { text: "SSBS",   hit: 2200, em: true },
  { text: "—",      hit: 2300, sep: true },
  { text: "Smart",  hit: 2400 },
  { text: "School", hit: 2550 },
  { text: "Bus",    hit: 2700 },
  { text: "System", hit: 2850 },
];

// ── Embedded styles ───────────────────────────────────────────
const CSS = `
/* ── Root card ──────────────────────────────────── */
.fla-root {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  background: #0d1117;
  padding: 56px 52px 44px;
  border-radius: 24px;
  position: relative;
  overflow: visible;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}
.fla-root::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: radial-gradient(
    ellipse 75% 50% at 50% 60%,
    rgba(99, 102, 241, 0.07) 0%,
    transparent 72%
  );
  pointer-events: none;
}

/* ── Wordmark row ────────────────────────────────── */
.fla-wordmark-area {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.fla-wordmark {
  display: flex;
  align-items: baseline;
  perspective: 600px;
}
.fla-char {
  display: inline-block;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  font-size: 64px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.01em;
  color: #e6edf3;
}

/* ── Flip wrapper ────────────────────────────────── */
.fla-flip-wrap {
  position: relative;
}

/* FROM — visible by default, flips away on .is-flipped */
.fla-flip-from {
  display: inline-block;
  color: #c9d1d9;
  transform-origin: center center;
  transform: rotateX(0deg);
  opacity: 1;
  transition: transform 0.28s ease-in, opacity 0.18s ease-in;
}
.fla-flip-wrap.is-flipped .fla-flip-from {
  transform: rotateX(-80deg);
  opacity: 0;
}

/* TO — hidden by default, flips in on .is-flipped */
.fla-flip-to {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%) rotateX(90deg);
  opacity: 0;
  color: #818cf8;
  transform-origin: center center;
  text-shadow: none;
  /* 0.15s delay lets FROM flip away first */
  transition: transform 0.34s ease-out 0.15s,
              opacity   0.26s ease-out 0.15s,
              text-shadow 0.3s ease-out 0.15s;
}
.fla-flip-wrap.is-flipped .fla-flip-to {
  transform: translateX(-50%) rotateX(0deg);
  opacity: 1;
  text-shadow: 0 0 18px rgba(99, 102, 241, 0.65),
               0 0 36px rgba(139, 92, 246, 0.28);
}

/* ── Dash vanish ─────────────────────────────────── */
.fla-vanish {
  display: inline-block;
  color: #484f58;
  overflow: hidden;
  max-width: 0.6em;
  opacity: 1;
  transition: max-width 0.28s ease-out, opacity 0.22s ease-out;
}
.fla-vanish.is-flipped {
  max-width: 0;
  opacity: 0;
}

/* ── Bus ─────────────────────────────────────────── */
.fla-bus {
  position: absolute;
  top: 50%;
  left: 0;
  z-index: 20;
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(0 0 6px rgba(99, 102, 241, 0.55))
          drop-shadow(4px 0 10px rgba(99, 102, 241, 0.18));
  transform: translateX(-60px) translateY(-50%);
  opacity: 1;
  transition: transform ${BUS_DURATION}ms cubic-bezier(0.38, 0, 0.28, 1);
}
/* Bus is travelling */
.fla-bus.bus-moving {
  transform: translateX(640px) translateY(-50%);
}
/* Bus fades out: scale down + glow burst + opacity 0 */
.fla-bus.bus-done {
  transition: opacity 0.5s ease, transform 0.5s ease, filter 0.4s ease;
  opacity: 0;
  transform: translateX(640px) translateY(-50%) scale(0.5);
  filter: drop-shadow(0 0 24px rgba(99, 102, 241, 0.9))
          drop-shadow(0 0 48px rgba(139, 92, 246, 0.5));
}

/* ── Subtitle ────────────────────────────────────── */
.fla-subtitle {
  font-family: "Inter", system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 0;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fla-subtitle.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Each word in the subtitle */
.fla-sub-word {
  color: #30363d;
  transition: color 0.35s ease, text-shadow 0.35s ease;
}
.fla-sub-word.lit {
  color: #818cf8;
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.35);
}
.fla-sub-word.lit-em {
  color: #6366f1;
  text-shadow: 0 0 12px rgba(99, 102, 241, 0.45);
}
.fla-sub-sep {
  color: #21262d;
  margin: 0 6px;
  letter-spacing: 0;
  transition: color 0.35s ease;
}
.fla-sub-sep.lit {
  color: #484f58;
}
`;

// ── Minimal side-view bus SVG ──────────────────────────────────
function BusSvg() {
  return (
    <svg
      width="48"
      height="22"
      viewBox="0 0 92 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Indigo outer glow on body */}
        <filter id="fla-glow-body" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blurred" />
          <feColorMatrix
            in="blurred" type="matrix"
            values="0.39 0 0 0 0
                    0.40 0 0 0 0
                    0.95 0 0 0 0
                    0    0 0 0.65 0"
            result="colored"
          />
          <feMerge>
            <feMergeNode in="colored" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Stronger glow for headlight */}
        <filter id="fla-glow-light" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blurred" />
          <feColorMatrix
            in="blurred" type="matrix"
            values="0.51 0 0 0 0
                    0.51 0 0 0 0
                    0.97 0 0 0 0
                    0    0 0 0.9 0"
            result="colored"
          />
          <feMerge>
            <feMergeNode in="colored" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Body ──────────────────────────────── */}
      <rect
        x="2" y="3" width="78" height="26" rx="5"
        fill="#161b22" stroke="#6366f1" strokeWidth="1.2"
        filter="url(#fla-glow-body)"
      />

      {/* ── Window strip background ───────────── */}
      <rect x="7" y="8" width="56" height="12" rx="2.5" fill="#0d1117" opacity="0.85" />

      {/* Window panes — indigo tinted */}
      <rect x="8"  y="9" width="14" height="10" rx="1.5" fill="rgba(99,102,241,0.07)" />
      <rect x="24" y="9" width="14" height="10" rx="1.5" fill="rgba(99,102,241,0.05)" />
      <rect x="40" y="9" width="12" height="10" rx="1.5" fill="rgba(99,102,241,0.05)" />

      {/* Window dividers */}
      <line x1="23" y1="8" x2="23" y2="20" stroke="#1c2230" strokeWidth="0.8" />
      <line x1="39" y1="8" x2="39" y2="20" stroke="#1c2230" strokeWidth="0.8" />
      <line x1="53" y1="8" x2="53" y2="20" stroke="#1c2230" strokeWidth="0.8" />

      {/* ── Cabin separator ───────────────────── */}
      <line x1="67" y1="4" x2="67" y2="28" stroke="#6366f1" strokeWidth="0.9" opacity="0.45" />

      {/* Cabin face */}
      <rect
        x="68" y="3" width="12" height="26" rx="3.5"
        fill="#1c2230" stroke="#6366f1" strokeWidth="0.8" opacity="0.6"
      />

      {/* ── Headlight ─────────────────────────── */}
      <rect x="72" y="12" width="7" height="5" rx="1.5" fill="#818cf8" />
      <rect
        x="72" y="12" width="7" height="5" rx="1.5"
        fill="#818cf8" filter="url(#fla-glow-light)" opacity="0.5"
      />

      {/* ── Rear accent ──────────────────────── */}
      <rect x="2" y="9" width="2.5" height="10" rx="1" fill="rgba(99,102,241,0.18)" />

      {/* ── Underside step ───────────────────── */}
      <rect x="2" y="27" width="78" height="2.5" rx="0" fill="#0d1117" opacity="0.6" />

      {/* ── Wheels ────────────────────────────── */}
      {/* Rear wheel */}
      <circle cx="18" cy="34" r="6.5" fill="#161b22" stroke="#6366f1" strokeWidth="1.2" />
      <circle cx="18" cy="34" r="2.8" fill="#6366f1" opacity="0.30" />
      <circle cx="18" cy="34" r="1.1" fill="#818cf8" opacity="0.65" />

      {/* Front wheel */}
      <circle cx="62" cy="34" r="6.5" fill="#161b22" stroke="#6366f1" strokeWidth="1.2" />
      <circle cx="62" cy="34" r="2.8" fill="#6366f1" opacity="0.30" />
      <circle cx="62" cy="34" r="1.1" fill="#818cf8" opacity="0.65" />
    </svg>
  );
}

// ── Component ──────────────────────────────────────────────────
export default function FleetmarkLogoAnimation({
  className = "",
  style,
  onBusDone: onBusDoneCb,
}) {
  const [flipped, setFlipped] = useState(new Set());
  const [subtitleIn, setSubtitleIn] = useState(false);
  const [busMoving, setBusMoving] = useState(false);
  const [busDone, setBusDone] = useState(false);
  const [litWords, setLitWords] = useState(new Set());

  useEffect(() => {
    const timers = [];

    CHARS.forEach((ch, i) => {
      if (ch.hit !== null) {
        timers.push(
          setTimeout(() => {
            setFlipped((prev) => {
              const next = new Set(prev);
              next.add(i);
              return next;
            });
          }, ch.hit)
        );
      }
    });

    // Start bus movement (matches the old 250ms animation-delay)
    timers.push(setTimeout(() => setBusMoving(true), 250));

    // Fade in subtitle
    timers.push(setTimeout(() => setSubtitleIn(true), SUB_DELAY));

    // Light up each subtitle word as bus sweeps through
    SUB_WORDS.forEach((w, i) => {
      timers.push(
        setTimeout(() => {
          setLitWords((prev) => {
            const next = new Set(prev);
            next.add(i);
            return next;
          });
        }, w.hit)
      );
    });

    // Bus shrinks away with glow burst
    timers.push(setTimeout(() => {
      setBusDone(true);
      if (onBusDoneCb) onBusDoneCb();
    }, BUS_FADE));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div
        className={`fla-root${className ? ` ${className}` : ""}`}
        style={style}
      >
        {/* ── Wordmark ──────────────────────────── */}
        <div className="fla-wordmark-area">
          <div className={`fla-bus${busMoving ? " bus-moving" : ""}${busDone ? " bus-done" : ""}`}>
            <BusSvg />
          </div>

          <div className="fla-wordmark" role="img" aria-label="Fleetmark">
            {CHARS.map((ch, i) => {
              if (ch.hit === null) {
                return (
                  <span key={i} className="fla-char">
                    {ch.f}
                  </span>
                );
              }
              if (ch.t === null) {
                return (
                  <span
                    key={i}
                    className={`fla-char fla-vanish${flipped.has(i) ? " is-flipped" : ""}`}
                  >
                    {ch.f}
                  </span>
                );
              }
              return (
                <span
                  key={i}
                  className={`fla-char fla-flip-wrap${flipped.has(i) ? " is-flipped" : ""}`}
                >
                  <span className="fla-flip-from">{ch.f}</span>
                  <span className="fla-flip-to">{ch.t}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* ── Subtitle — words light up one by one ── */}
        <p className={`fla-subtitle${subtitleIn ? " visible" : ""}`}>
          {SUB_WORDS.map((w, i) => {
            const isLit = litWords.has(i);
            if (w.sep) {
              return (
                <span key={i} className={`fla-sub-sep${isLit ? " lit" : ""}`}>
                  {w.text}
                </span>
              );
            }
            const cls = isLit
              ? w.em ? "fla-sub-word lit-em" : "fla-sub-word lit"
              : "fla-sub-word";
            return (
              <span key={i} className={cls}>
                {w.text}{" "}
              </span>
            );
          })}
        </p>
      </div>
    </>
  );
}
