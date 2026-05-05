import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../services/api";
import LanguageSwitcher from "../components/shared/LanguageSwitcher";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import FleetmarkLogoAnimation from "../components/ui/FleetmarkLogoAnimation";
import useInView from "../hooks/useInView";

function RevealSection({ id, children, style, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <section
      id={id}
      ref={ref}
      className={`reveal-section${visible ? " is-visible" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </section>
  );
}

/** Stylized bus + road — hero visual (Fix 8b) */
function HeroBusIllustration() {
  return (
    <svg
      width="min(100%, 420)"
      height="140"
      viewBox="0 0 420 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ maxWidth: 420, marginTop: 8 }}
    >
      <defs>
        <linearGradient id="hero-road" x1="0" y1="0" x2="420" y2="0">
          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--orbit, #7e22ce)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect x="0" y="108" width="420" height="4" rx="2" fill="url(#hero-road)" />
      <line x1="0" y1="110" x2="420" y2="110" stroke="var(--line2)" strokeWidth="1" strokeDasharray="10 14" opacity="0.6" />
      <g style={{ transform: "translateX(0)" }}>
        <rect x="120" y="52" width="180" height="48" rx="10" fill="var(--surface)" stroke="var(--blue)" strokeWidth="1.5" />
        <rect x="132" y="62" width="36" height="16" rx="3" fill="color-mix(in srgb, var(--blue) 15%, transparent)" />
        <rect x="176" y="62" width="36" height="16" rx="3" fill="color-mix(in srgb, var(--blue) 15%, transparent)" />
        <rect x="220" y="62" width="36" height="16" rx="3" fill="color-mix(in srgb, var(--blue) 15%, transparent)" />
        <rect x="264" y="62" width="24" height="16" rx="3" fill="color-mix(in srgb, var(--blue) 15%, transparent)" />
        <circle cx="150" cy="108" r="10" fill="var(--surface2)" stroke="var(--blue)" strokeWidth="1.5" />
        <circle cx="270" cy="108" r="10" fill="var(--surface2)" stroke="var(--blue)" strokeWidth="1.5" />
        <circle cx="300" cy="36" r="5" fill="var(--amber)" opacity="0.85" />
        <circle cx="320" cy="28" r="3" fill="var(--mid)" opacity="0.5" />
        <circle cx="100" cy="44" r="2.5" fill="var(--mid)" opacity="0.35" />
      </g>
    </svg>
  );
}

/** English-first landing copy; fr/ar reuse English for long-form sections where not translated. */
const copy = {
  en: {
    navHow: "How it works",
    navSchedule: "Schedule",
    navTeam: "Team",
    navSignIn: "Sign in with 42",
    heroBadge: "Now accepting reservations · 1337 School",
    heroA: "Night shuttle.",
    heroB: "Reserved.",
    heroText:
      "The official booking platform for 1337 School students. Sign in once with 42 Intra — your seat confirmed before you leave campus.",
    heroBtnPrimary: "Sign in with 42 →",
    heroBtnSecondary: "How it works →",
    heroStats: [
      { value: "400+", label: "STUDENTS" },
      { value: "2", label: "ROUTES" },
      { value: "21PM", label: "FIRST BUS" },
      { value: "6AM", label: "LAST BUS" },
    ],
    howEyebrow: "HOW IT WORKS",
    howTitle: "Three steps. One guaranteed seat.",
    howSteps: [
      {
        title: "Sign in with 42 Intra",
        lines: ["No new account. Your 1337 credentials work instantly."],
      },
      {
        title: "Pick your home stop",
        lines: ["Choose from stations across Ben Guerir.", "Only trips near you are shown."],
      },
      {
        title: "Reserve your seat",
        lines: ["One tap. Confirmed instantly. No more rushing."],
      },
      {
        title: "Show up and ride",
        lines: ["Your seat is waiting. Board the shuttle."],
      },
    ],
    schedEyebrow: "SCHEDULE",
    schedTitle: "Runs all night. Every night.",
    schedDesc: "Two service windows with a break between 1:00 AM and 3:00 AM",
    schedBlocks: [
      {
        bar: "var(--blue)",
        label: "PEAK HOURS",
        time: "21:00 → Midnight",
        icon: "bolt",
        cardTitle: "Peak Hours — Split Routes",
        desc: "Two buses on separate routes for peak traffic.",
        tags: ["🚌 Bus 1 — Route A", "🚌 Bus 2 — Route B"],
      },
      {
        bar: "var(--mid)",
        label: "TRANSITION",
        time: "12:00 AM → 1:00 AM",
        icon: "update",
        cardTitle: "Transition Window",
        desc: "Both buses serve all major stops.",
        tags: ["🔄 Both buses", "Full coverage"],
      },
      {
        bar: "var(--orbit)",
        label: "LATE NIGHT",
        time: "3:00 AM → 6:00 AM",
        icon: "dark_mode",
        cardTitle: "Late Night — Consolidated Run",
        desc: "One bus covers all stops for late students.",
        tags: ["🚌 1 bus", "All stops served"],
      },
    ],
    teamEyebrow: "THE TEAM",
    teamTitle: "Built by 1337 students, for 1337 students.",
    teamSubtitle: "Five students set out to build a smart system for managing their school's bus transportation.",
    teamMembers: [
      {
        name: "Adil Bourji",
        role: "Frontend Developer",
        skills: "React · TypeScript · Vite · Design System",
      },
      {
        name: "Mohamed Lahrech",
        role: "Backend Developer",
        skills: "Django REST · PostgreSQL · API Architecture",
      },
      {
        name: "Abderrahman Chakour",
        role: "Backend · Auth",
        skills: "42 OAuth · JWT · Security · SimpleJWT",
      },
      {
        name: "Ayoub El Haouti",
        role: "Backend · QA",
        skills: "Testing · Django · 86/86 passing",
      },
      {
        name: "Aamir Tahtah",
        role: "DevOps",
        skills: "Docker · Nginx · Prometheus · Grafana",
      },
    ],
    gsEyebrow: "GET STARTED",
    gsTitle: "Your seat is waiting. Claim it now.",
    gsSteps: [
      "Authenticate with your 42 Intra account",
      "Your role is detected automatically",
      "Pick your home stop and start reserving",
    ],
    gsCardTitle: "Access Fleetmark",
    gsCardSub: "1337 School Ben Guerir only. Your role is detected automatically.",
    gsBtn: "Sign in with 42 Intra →",
    gsSecured: "secured by 42 OAuth",
    gsChips: ["No new account", "Instant access", "Auto role detect", "1337 only"],
    gsFootTag: "1337 School · Ben Guerir · Morocco",
    footerSub: "Night shuttle reservation · 1337 School Morocco",
    footerCopy: "© 2026 · Built by 1337/42 students",
    footerTech: "React · Django · PostgreSQL · Docker · 42 OAuth",
  },
  fr: {
    navHow: "Fonctionnement",
    navSchedule: "Horaires",
    navTeam: "Equipe",
    navSignIn: "Connexion 42",
    heroBadge: "Réservations ouvertes · 1337 School",
    heroA: "Navette de nuit.",
    heroB: "Réservée.",
    heroText:
      "Plateforme officielle pour les étudiants 1337. Une connexion 42 Intra — votre place confirmée avant de quitter le campus.",
    heroBtnPrimary: "Connexion 42 →",
    heroBtnSecondary: "Fonctionnement →",
    heroStats: [
      { value: "400+", label: "ÉTUDIANTS" },
      { value: "2", label: "LIGNES" },
      { value: "21h", label: "PREMIER BUS" },
      { value: "6h", label: "DERNIER BUS" },
    ],
    howEyebrow: "COMMENT ÇA MARCHE",
    howTitle: "Trois étapes. Une place assurée.",
    schedEyebrow: "HORAIRES",
    schedTitle: "Toute la nuit. Chaque nuit.",
    schedDesc: "Deux fenêtres de service avec une pause entre 1h00 et 3h00",
    teamEyebrow: "L'ÉQUIPE",
    teamTitle: "Construit par des étudiants 1337, pour des étudiants 1337.",
    teamSubtitle: "Cinq étudiants se sont lancés dans la création d’un système intelligent pour gérer le transport scolaire.",
    gsEyebrow: "COMMENCER",
    gsTitle: "Votre place vous attend. Réclamez-la.",
    gsSteps: [
      "Authentification avec votre compte 42 Intra",
      "Votre rôle est détecté automatiquement",
      "Choisissez votre arrêt et réservez",
    ],
    gsCardTitle: "Accéder à Fleetmark",
    gsCardSub: "1337 School Ben Guerir uniquement. Rôle détecté automatiquement.",
    gsBtn: "Connexion 42 Intra →",
    gsSecured: "sécurisé par OAuth 42",
    gsChips: ["Pas de nouveau compte", "Accès instantané", "Détection du rôle", "1337 uniquement"],
    gsFootTag: "1337 School · Ben Guerir · Maroc",
    footerSub: "Réservation navette nocturne · 1337 School Maroc",
    footerCopy: "© 2026 · Réalisé par des étudiants 1337/42",
    footerTech: "React · Django · PostgreSQL · Docker · OAuth 42",
  },
  ar: {
    navHow: "كيف يعمل",
    navSchedule: "الجدول",
    navTeam: "الفريق",
    navSignIn: "تسجيل الدخول عبر 42",
    heroBadge: "نقبل الحجوزات الآن · مدرسة 1337",
    heroA: "رحلات ليلية.",
    heroB: "محجوزة.",
    heroText:
      "منصة الحجز الرسمية لطلاب 1337. سجّل الدخول مرة واحدة عبر 42 Intra — مقعدك مؤكد قبل مغادرة الحرم.",
    heroBtnPrimary: "تسجيل الدخول عبر 42 ←",
    heroBtnSecondary: "كيف يعمل ←",
    heroStats: [
      { value: "400+", label: "طالب" },
      { value: "2", label: "خطوط" },
      { value: "9م", label: "أول حافلة" },
      { value: "6ص", label: "آخر حافلة" },
    ],
    howEyebrow: "كيف يعمل",
    howTitle: "ثلاث خطوات. مقعد مضمون.",
    schedEyebrow: "الجدول",
    schedTitle: "يعمل طوال الليل. كل ليلة.",
    schedDesc: "فترتا خدمة مع استراحة عند الساعة 2:00 صباحًا",
    teamEyebrow: "الفريق",
    teamTitle: "من طلاب 1337، لطلاب 1337.",
    teamSubtitle: "خمسة طلاب قرروا تطوير نظام ذكي لإدارة حافلات مدرستهم",
    gsEyebrow: "ابدأ",
    gsTitle: "مقعدك ينتظرك. احجزه الآن.",
    gsSteps: [
      "الدخول بحساب 42 Intra",
      "يتم اكتشاف دورك تلقائياً",
      "اختر محطتك وابدأ الحجز",
    ],
    gsCardTitle: "الدخول إلى Fleetmark",
    gsCardSub: "مدرسة 1337 بني جرير فقط. يتم اكتشاف الدور تلقائياً.",
    gsBtn: "تسجيل الدخول عبر 42 Intra ←",
    gsSecured: "مؤمّن عبر OAuth 42",
    gsChips: ["بدون حساب جديد", "وصول فوري", "اكتشاف الدور", "1337 فقط"],
    gsFootTag: "1337 School · بني جرير · المغرب",
    footerSub: "حجز الحافلة الليلية · 1337 School المغرب",
    footerCopy: "© 2026 · من طلاب 1337/42",
    footerTech: "React · Django · PostgreSQL · Docker · OAuth 42",
  },
};

// Share nested data with EN where we don't translate (steps / schedule blocks / team roster)
copy.fr.howSteps = copy.en.howSteps;
copy.fr.schedBlocks = copy.en.schedBlocks;
copy.fr.teamMembers = copy.en.teamMembers;
copy.ar.howSteps = copy.en.howSteps;
copy.ar.schedBlocks = copy.en.schedBlocks;
copy.ar.teamMembers = copy.en.teamMembers;

const wrap = { maxWidth: 1200, margin: "0 auto", padding: "0 32px" };

function scrollToHow(e) {
  e.preventDefault();
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

export default function Landing() {
  const [lang, setLang] = useState(localStorage.getItem("fleetmark_lang") || "en");
  const [error, setError] = useState("");
  const [splashVisible, setSplashVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const text = useMemo(() => copy[lang] || copy.en, [lang]);

  useEffect(() => {
    localStorage.setItem("fleetmark_lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  async function login() {
    setError("");
    try {
      const res = await auth.getLoginUrl();
      if (!res?.authorization_url) throw new Error("Missing OAuth URL.");
      window.location.href = res.authorization_url;
    } catch (err) {
      setError(err.message || "Failed to start authentication.");
    }
  }

  const [navBusVisible, setNavBusVisible] = useState(false);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
      {/* Splash — logo animation only; hero uses static wordmark (Fix 4a) */}
      {splashVisible ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            background: "var(--bg)",
          }}
        >
          <FleetmarkLogoAnimation
            onBusDone={() => {
              setSplashVisible(false);
              setNavBusVisible(true);
            }}
          />
        </div>
      ) : null}

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "color-mix(in srgb, var(--bg) 60%, transparent)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line2)",
        }}
      >
        <div style={{ ...wrap, height: 56, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg
                width="26" height="12" viewBox="0 0 92 42" fill="none"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                style={{
                  opacity: navBusVisible ? 1 : 0,
                  transform: navBusVisible ? "scale(1) translateY(0)" : "scale(0.4) translateY(8px)",
                  transition: "opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  filter: navBusVisible ? "drop-shadow(0 0 6px rgba(99,102,241,0.5))" : "none",
                }}
              >
                <rect x="2" y="3" width="78" height="26" rx="5" fill="var(--card)" stroke="var(--blue)" strokeWidth="1.5"/>
                <rect x="7" y="8" width="56" height="12" rx="2.5" fill="var(--bg)" opacity="0.85"/>
                <rect x="68" y="3" width="12" height="26" rx="3.5" fill="var(--card)" stroke="var(--blue)" strokeWidth="0.8" opacity="0.6"/>
                <rect x="72" y="12" width="7" height="5" rx="1.5" fill="var(--blue)"/>
                <circle cx="18" cy="34" r="6.5" fill="var(--card)" stroke="var(--blue)" strokeWidth="1.2"/>
                <circle cx="62" cy="34" r="6.5" fill="var(--card)" stroke="var(--blue)" strokeWidth="1.2"/>
              </svg>
              <span style={{ color: navBusVisible ? "var(--blue)" : "inherit", transition: "color 0.5s ease" }} dir="ltr">Fleetmark</span>
            </span>
            <div className="landing-nav-links" style={{ display: "flex", gap: 24, fontSize: 14, color: "var(--mid)" }}>
              <a href="#how-it-works">{text.navHow}</a>
              <a href="#schedule">{text.navSchedule}</a>
              <a href="#team">{text.navTeam}</a>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              className="landing-hamburger"
              aria-expanded={menuOpen}
              aria-label="Open menu"
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: "none",
                placeItems: "center",
                width: 40,
                height: 40,
                borderRadius: 10,
                border: "1px solid var(--line2)",
                background: "var(--surface)",
                color: "var(--ink)",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{menuOpen ? "close" : "menu"}</span>
            </button>

            <LanguageSwitcher variant="full" value={lang} onChange={setLang} />
            <DarkModeToggle />
            <button
              type="button"
              onClick={login}
              style={{
                border: "1px solid var(--blue-bdr)",
                background: "var(--blue-bg)",
                color: "var(--blue)",
                borderRadius: 7,
                padding: "8px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {text.navSignIn}
            </button>
          </div>
        </div>
      </nav>

      <div className={`landing-mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{text.navHow}</a>
        <a href="#schedule" onClick={() => setMenuOpen(false)}>{text.navSchedule}</a>
        <a href="#team" onClick={() => setMenuOpen(false)}>{text.navTeam}</a>
        <a href="#get-started" onClick={() => setMenuOpen(false)}>{text.gsEyebrow}</a>
        <button type="button" onClick={() => { setMenuOpen(false); login(); }}>{text.navSignIn}</button>
      </div>

      <main>
        {/* Hero — static wordmark + headline focus (Fix 4a, 4d, 2a) */}
        <section
          style={{
            width: "100%",
            backgroundColor: "var(--bg)",
            minHeight: "min(100vh, 900px)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            position: "relative",
            paddingTop: 88,
            paddingBottom: 72,
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--ink) 3%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--ink) 3%, transparent) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        >
          <div style={{ ...wrap, width: "100%" }}>
          <div
            style={{
              position: "absolute",
              right: "8%",
              top: "18%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: "color-mix(in srgb, var(--blue) 8%, transparent)",
              filter: "blur(120px)",
              pointerEvents: "none",
            }}
          />
          <div>
            <div
              dir="ltr"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "clamp(18px, 4vw, 28px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--ink)",
                marginBottom: 20,
                lineHeight: 1,
              }}
            >
              FLEETMARK
            </div>
            <HeroBusIllustration />
            <div
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid color-mix(in srgb, var(--green) 35%, transparent)",
                borderRadius: 999,
                padding: "6px 14px",
                color: "var(--green)",
                marginBottom: 20,
                marginTop: 8,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 12px color-mix(in srgb, var(--green) 50%, transparent)" }} />
              {text.heroBadge}
            </div>
            <h1 style={{ margin: 0, fontSize: "clamp(36px, 10vw, 80px)", lineHeight: 1.05, letterSpacing: "-0.05em", textShadow: "0 0 30px color-mix(in srgb, var(--blue) 30%, transparent)" }}>
              <span style={{ color: "var(--hero-gradient-start)" }}>{text.heroA}</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(to right, var(--hero-gradient-start), var(--blue))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {text.heroB}
              </span>
            </h1>
            <p style={{ maxWidth: 560, margin: "24px auto 0", color: "var(--mid)", fontSize: 18, lineHeight: 1.65 }}>
              {text.heroText}
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={login} style={{ border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: 8, padding: "14px 28px", fontWeight: 700, cursor: "pointer" }}>
                {text.heroBtnPrimary}
              </button>
              <button type="button" onClick={scrollToHow} style={{ border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "14px 28px", fontWeight: 700, cursor: "pointer" }}>
                {text.heroBtnSecondary}
              </button>
            </div>
            <div style={{ marginTop: 28, display: "flex", justifyContent: "center", width: "100%" }}>
              <div
                role="group"
                aria-label="Fleetmark at a glance"
                style={{
                  display: "inline-flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "stretch",
                  border: "1px solid var(--line2)",
                  borderRadius: 999,
                  background: "color-mix(in srgb, var(--surface) 92%, transparent)",
                  padding: "6px 10px",
                  maxWidth: "100%",
                }}
              >
                {text.heroStats.map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "12px clamp(14px, 3vw, 28px)",
                      borderLeft: i > 0 ? "1px solid color-mix(in srgb, var(--line2) 80%, transparent)" : "none",
                      minWidth: 72,
                    }}
                  >
                    <span className="mono" style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.03em" }}>
                      {stat.value}
                    </span>
                    <span className="mono" style={{ fontSize: 10, fontWeight: 700, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {error ? <p style={{ color: "var(--red)", marginTop: 16 }}>{error}</p> : null}
          </div>
          </div>
        </section>

        <RevealSection id="how-it-works" className="landing-two-col" style={{ width: "100%", padding: "96px 0", backgroundColor: "var(--bg)" }}>
          <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <span className="mono" style={{ color: "var(--blue)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, display: "block", marginBottom: 16 }}>
              {text.howEyebrow}
            </span>
            <h2 style={{ fontSize: 42, margin: "0 0 48px", letterSpacing: "-0.02em" }}>{text.howTitle}</h2>
            <div style={{ display: "grid", gap: 40 }}>
              {text.howSteps.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 24 }}>
                  <strong className="mono" style={{ color: "var(--blue)", fontSize: 20, fontWeight: 700, flexShrink: 0, lineHeight: 1.4 }}>
                    {String(idx + 1).padStart(2, "0")}
                  </strong>
                  <div>
                    <h3 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700 }}>{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} style={{ margin: i === 0 ? 0 : "6px 0 0", color: "var(--mid)", fontSize: 14, lineHeight: 1.6 }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: 14,
                background: "linear-gradient(to right, color-mix(in srgb, var(--blue) 20%, transparent), transparent)",
                filter: "blur(24px)",
                opacity: 0.85,
              }}
            />
            <div style={{ position: "relative", borderRadius: 12, border: "1px solid color-mix(in srgb, var(--ink) 7%, transparent)", background: "var(--surface)", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
              <div style={{ height: 32, background: "var(--surface2)", display: "flex", alignItems: "center", padding: "0 16px", gap: 6, borderBottom: "1px solid color-mix(in srgb, var(--ink) 5%, transparent)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "color-mix(in srgb, var(--red) 50%, transparent)" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "color-mix(in srgb, var(--amber) 55%, transparent)" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "color-mix(in srgb, var(--green) 50%, transparent)" }} />
              </div>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Reservation mockup header */}
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>Night Shuttle — Route A</div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--mid)", marginTop: 4 }}>OCP Saka → Nakhil → 1337</div>
                </div>
                {/* Stat boxes */}
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ v: "32 seats", icon: "event_seat" }, { v: "11:00 PM", icon: "schedule" }, { v: "19 stops", icon: "pin_drop" }].map((s) => (
                    <div key={s.v} style={{ flex: 1, background: "var(--surface2)", borderRadius: 8, padding: "12px 10px", textAlign: "center", border: "1px solid color-mix(in srgb, var(--line) 20%, transparent)" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16, color: "var(--blue)", display: "block", marginBottom: 4 }}>{s.icon}</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{s.v}</span>
                    </div>
                  ))}
                </div>
                {/* Reserve button */}
                <button type="button" style={{ width: "100%", border: "none", borderRadius: 8, padding: "12px 16px", background: "var(--blue)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Reserve My Seat →
                </button>
                {/* Green confirmation row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, background: "color-mix(in srgb, var(--green) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--green) 30%, transparent)", borderRadius: 8, padding: "10px 14px" }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--green)", fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green)" }}>Seat confirmed! Route A · 11:00 PM</span>
                </div>
                {/* Footer tag */}
                <div className="mono" style={{ fontSize: 11, color: "var(--blue)", background: "color-mix(in srgb, var(--blue) 10%, transparent)", padding: "8px 16px", borderRadius: 8, fontWeight: 700, textAlign: "center" }}>
                  FLEETMARK · 1337
                </div>
              </div>
            </div>
          </div>
          </div>
        </RevealSection>

        <RevealSection id="schedule" style={{ width: "100%", padding: "96px 0", backgroundColor: "var(--bg)", borderTop: "1px solid color-mix(in srgb, var(--ink) 5%, transparent)" }}>
          <div style={wrap}>
          <div style={{ marginBottom: 40 }}>
            <span className="mono" style={{ color: "var(--blue)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, display: "block", marginBottom: 16 }}>
              {text.schedEyebrow}
            </span>
            <h2 style={{ fontSize: 42, margin: "0 0 16px", letterSpacing: "-0.02em" }}>{text.schedTitle}</h2>
            <p style={{ margin: 0, color: "var(--mid)", fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>{text.schedDesc}</p>
          </div>
          <div className="landing-schedule-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 24 }}>
            {text.schedBlocks.map((block) => (
              <article
                key={block.label}
                style={{
                  border: "1px solid color-mix(in srgb, var(--ink) 7%, transparent)",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "var(--surface)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ height: 4, background: block.bar, width: "100%" }} />
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 8 }}>
                    <span className="mono" style={{ color: block.bar, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
                      {block.label}
                    </span>
                    <span className="material-symbols-outlined" style={{ color: block.bar, fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                      {block.icon}
                    </span>
                  </div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--hero-gradient-start)" }}>
                    {block.time}
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{block.cardTitle}</h3>
                  <p style={{ margin: "0 0 16px", color: "var(--mid)", fontSize: 14, lineHeight: 1.55 }}>{block.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {block.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11,
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "var(--surface2)",
                          border: "1px solid var(--line2)",
                          color: "var(--ink2)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          </div>
        </RevealSection>

        <RevealSection id="team" style={{ width: "100%", padding: "96px 0", backgroundColor: "var(--bg)" }}>
          <div style={wrap}>
          <span className="mono" style={{ color: "var(--blue)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, display: "block", marginBottom: 16 }}>
            {text.teamEyebrow}
          </span>
          <h2 style={{ fontSize: 42, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{text.teamTitle}</h2>
          <p style={{ margin: "0 0 48px", color: "var(--mid)", fontSize: 16, maxWidth: 520 }}>{text.teamSubtitle}</p>
          <div style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 48, scrollbarWidth: "thin" }}>
            {text.teamMembers.map((member, idx) => {
              const avatarGradients = [
                "linear-gradient(135deg, #667eea, #764ba2)",
                "linear-gradient(135deg, #11998e, #38ef7d)",
                "linear-gradient(135deg, #f12711, #f5af19)",
                "linear-gradient(135deg, #667eea, #764ba2)",
                "linear-gradient(135deg, #0d9488, #10b981)",
              ];
              const initials = member.name.split(" ").map((w) => w[0]).join("").toUpperCase();
              return (
                <article
                  key={member.name}
                  style={{
                    position: "relative",
                    minWidth: 300,
                    minHeight: 420,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "var(--surface2)",
                    border: "1px solid var(--line2)",
                    flexShrink: 0,
                    transition: "transform 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "color-mix(in srgb, var(--blue) 35%, transparent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "var(--line2)";
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, color-mix(in srgb, var(--surface2) 30%, transparent) 0%, var(--bg) 100%)",
                      opacity: 0.5,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, var(--bg) 0%, color-mix(in srgb, var(--bg) 50%, transparent) 50%, transparent 100%)",
                      opacity: 0.85,
                    }}
                  />
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--green)" }} />
                  {/* Avatar */}
                  <div style={{ position: "relative", display: "flex", justifyContent: "center", paddingTop: 48 }}>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: avatarGradients[idx % avatarGradients.length],
                        display: "grid",
                        placeItems: "center",
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      }}
                    >
                      {initials}
                    </div>
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 }}>
                    <h4 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>{member.name}</h4>
                    <p style={{ margin: "0 0 10px", color: "var(--blue)", fontSize: 13, fontWeight: 600 }}>{member.role}</p>
                    <p className="mono" style={{ margin: "0 0 16px", color: "var(--mid)", fontSize: 11, lineHeight: 1.5 }}>
                      {member.skills}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, fontWeight: 700 }}>
                      <a href="#" style={{ color: "var(--blue)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                        GitHub
                      </a>
                      <span style={{ color: "var(--dim)" }}>·</span>
                      <a href="#" style={{ color: "var(--blue)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                        LinkedIn
                      </a>
                      <span style={{ color: "var(--dim)" }}>·</span>
                      <a href={`mailto:${member.name.split(" ")[0].toLowerCase()}@student.1337.ma`} style={{ color: "var(--blue)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                        Email
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          </div>
        </RevealSection>

        <RevealSection id="get-started" className="landing-two-col" style={{ width: "100%", padding: "96px 0", backgroundColor: "var(--bg)" }}>
          <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <span className="mono" style={{ color: "var(--blue)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, display: "block", marginBottom: 16 }}>
              {text.gsEyebrow}
            </span>
            <h2 style={{ fontSize: 42, margin: "0 0 28px", letterSpacing: "-0.02em" }}>{text.gsTitle}</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 20 }}>
              {text.gsSteps.map((item, idx) => (
                <li key={idx} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span className="mono" style={{ minWidth: 24, height: 24, borderRadius: "50%", border: "1px solid var(--blue-bdr)", color: "var(--blue)", display: "grid", placeItems: "center", fontSize: 10, flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ color: "var(--mid)", fontSize: 15, lineHeight: 1.55 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            style={{
              borderRadius: 16,
              padding: 2,
              background: "linear-gradient(135deg, color-mix(in srgb, var(--blue) 55%, transparent), color-mix(in srgb, var(--orbit, #7e22ce) 45%, transparent))",
              boxShadow: "0 0 40px color-mix(in srgb, var(--blue) 18%, transparent)",
            }}
          >
            <div
              style={{
                background: "var(--surface-2, var(--surface2))",
                color: "var(--ink)",
                borderRadius: 14,
                padding: 34,
                border: "1px solid color-mix(in srgb, var(--line) 40%, transparent)",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "color-mix(in srgb, var(--blue) 15%, transparent)",
                  color: "var(--blue)",
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 22,
                  marginBottom: 20,
                  border: "1px solid color-mix(in srgb, var(--blue) 25%, transparent)",
                }}
              >
                42
              </div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{text.gsCardTitle}</h3>
              <p style={{ color: "var(--mid)", marginTop: 10, fontSize: 14, lineHeight: 1.55 }}>
                {text.gsCardSub}
              </p>
              <button
                type="button"
                onClick={login}
                style={{
                  marginTop: 20,
                  width: "100%",
                  border: "1px solid color-mix(in srgb, var(--blue) 35%, transparent)",
                  borderRadius: 8,
                  padding: "14px 16px",
                  background: "color-mix(in srgb, var(--blue) 12%, transparent)",
                  color: "var(--blue)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {text.gsBtn}
              </button>
              <p className="mono" style={{ margin: "12px 0 0", fontSize: 11, color: "var(--dim)", textAlign: "center" }}>
                {text.gsSecured}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
                {text.gsChips.map((chip) => (
                  <span
                    key={chip}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "var(--surface-3, var(--surface3))",
                      border: "1px solid var(--line2)",
                      color: "var(--ink2)",
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <p className="mono" style={{ margin: "24px 0 0", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--dim)", textAlign: "center" }}>
                {text.gsFootTag}
              </p>
            </div>
          </div>
          </div>
        </RevealSection>
      </main>

      {/* FIX 6 — Footer */}
      <footer
        style={{
          width: "100%",
          backgroundColor: "var(--bg)",
          borderTop: "1px solid color-mix(in srgb, var(--ink) 5%, transparent)",
        }}
      >
        <div style={{ ...wrap, padding: "48px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }} dir="ltr">Fleetmark</div>
            <p className="mono" style={{ margin: "8px 0 0", color: "var(--mid)", fontSize: 11, letterSpacing: "0.06em" }}>
              {text.footerSub}
            </p>
          </div>
          <div className="mono" style={{ color: "var(--dim)", fontSize: 11, letterSpacing: "0.06em" }}>
            {text.footerCopy}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <p className="mono" style={{ margin: 0, color: "var(--dim)", fontSize: 11, letterSpacing: "0.04em" }}>
            {text.footerTech}
          </p>
          <span style={{ color: "var(--dim)", fontSize: 11 }}>·</span>
          <a href="/privacy" style={{ fontSize: 11, color: "var(--dim)", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</a>
          <span style={{ color: "var(--dim)", fontSize: 11 }}>·</span>
          <a href="/terms" style={{ fontSize: 11, color: "var(--dim)", fontWeight: 600, textDecoration: "none" }}>Terms of Service</a>
        </div>
        </div>
      </footer>
    </div>
  );
}
