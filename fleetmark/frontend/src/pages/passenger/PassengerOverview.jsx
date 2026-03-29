import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";
import RouteMap from "../../components/ui/RouteMap";
import useCountUp from "../../hooks/useCountUp";
import { API_BASE, getUser } from "../../services/api";
import { useTranslation } from "../../context/TranslationContext";

function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return "greetMorning";
  if (hour < 18) return "greetAfternoon";
  return "greetEvening";
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ── Skeleton loader — only for trip card + stats ── */
function TripCardSkeleton() {
  return (
    <div className="skeleton-card trip-card-inner" style={{ padding: 0, borderRadius: 14, display: "grid", gridTemplateColumns: "2fr 1fr", overflow: "hidden" }}>
      <div style={{ padding: "28px 28px", display: "grid", gap: 18 }}>
        <div>
          <div className="skeleton-bar" style={{ width: "20%", height: 12 }} />
          <div className="skeleton-bar" style={{ width: "50%", height: 38, marginTop: 8 }} />
          <div className="skeleton-bar" style={{ width: "70%", height: 14, marginTop: 8 }} />
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div className="skeleton-bar" style={{ width: 120, height: 48 }} />
          <div className="skeleton-bar" style={{ width: 90, height: 14 }} />
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", gap: 30 }}>
          <div className="skeleton-bar" style={{ width: 40, height: 32 }} />
          <div className="skeleton-bar" style={{ width: 50, height: 32 }} />
          <div className="skeleton-bar" style={{ width: 30, height: 32 }} />
        </div>
      </div>
      <div style={{ background: "var(--surface2)", borderLeft: "1px solid var(--border)", padding: 24, display: "grid", alignContent: "center", gap: 18 }}>
        <div className="skeleton-bar" style={{ width: "100%", aspectRatio: "1/1", borderRadius: 12 }} />
        <div className="skeleton-bar" style={{ width: "100%", height: 44, borderRadius: 10 }} />
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
            <div className="skeleton-bar" style={{ width: 16, height: 16, borderRadius: "50%" }} />
            <div className="skeleton-bar" style={{ width: "40%", height: 12 }} />
          </div>
          <div className="skeleton-bar" style={{ width: "50%", height: 36 }} />
          <div className="skeleton-bar" style={{ width: "60%", height: 12, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

function PassengerStatCard({ label, value, sub, icon, color, countUp }) {
  const n = Number(value);
  const canCount = countUp && Number.isFinite(n);
  const animated = useCountUp(canCount ? n : 0, 650);
  const display = canCount ? String(animated) : value;

  return (
    <article
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "20px 20px",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 14, color, fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <span style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
          {label}
        </span>
      </div>
      <h3 className="mono" style={{ margin: 0, fontSize: 36, lineHeight: 1 }}>
        {display}
      </h3>
      {sub ? (
        <p className="mono" style={{ margin: "6px 0 0", color: "var(--mid)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {sub}
        </p>
      ) : null}
    </article>
  );
}

export default function PassengerOverview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => getUser());
  const [trips, setTrips] = useState([]);
  const [buses, setBuses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      if (!token) throw new Error("Please log in to view your dashboard.");

      const headers = { Authorization: `Bearer ${token}` };

      const fetchWithTimeout = async (url) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        try {
          const r = await fetch(url, { headers, signal: controller.signal });
          clearTimeout(id);
          return r.ok ? r.json() : [];
        } catch {
          clearTimeout(id);
          return [];
        }
      };

      // Fetch fresh profile in parallel — with its own timeout, never blocks
      const mePromise = fetchWithTimeout(`${API_BASE}/auth/me/`);

      // Start trips/reservations/buses using cached user while profile loads
      let cachedUser = getUser();

      const [meData, resData, busData, annData] = await Promise.all([
        mePromise,
        cachedUser?.id
          ? fetchWithTimeout(`${API_BASE}/reservations/?user_id=${encodeURIComponent(cachedUser.id)}`)
          : Promise.resolve([]),
        fetchWithTimeout(`${API_BASE}/buses/`),
        fetchWithTimeout(`${API_BASE}/announcements/`),
      ]);

      // Update user if fresh profile came back
      let activeUser = cachedUser;
      if (meData && meData.id) {
        localStorage.setItem("fleetmark_user", JSON.stringify(meData));
        activeUser = meData;
        if (aliveRef.current) setUser(meData);
      }

      // Fetch trips now that we have the definitive station
      const tripData = activeUser?.station
        ? await fetchWithTimeout(`${API_BASE}/trips/available/?station_id=${encodeURIComponent(activeUser.station)}`)
        : [];

      if (aliveRef.current) {
        setTrips(Array.isArray(tripData) ? tripData : []);
        setReservations(Array.isArray(resData) ? resData : []);
        setBuses(Array.isArray(busData) ? busData : []);
        setUrgentAlerts(Array.isArray(annData) ? annData.filter(a => a.priority === "urgent" && !a.is_dismissed) : []);
      }
    } catch (err) {
      if (aliveRef.current) setError(err.message || "Unable to load overview.");
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, [load]);

  const tonightTrip = trips[0];
  const hasReservedTonight = tonightTrip
    ? reservations.some((r) => (r.trip_details?.id || r.trip) === tonightTrip.id)
    : false;
  const tonightBus = tonightTrip ? buses.find((b) => b.id === tonightTrip.bus) : null;
  const cap = tonightBus ? Number(tonightBus.seat_capacity ?? 0) : Number(tonightTrip?.bus_seat_capacity ?? 0);
  const left = tonightTrip ? Number(tonightTrip.seats_left ?? 0) : 0;
  const ridesThisMonth = reservations.filter((r) => {
    const date = r.created_at ? new Date(r.created_at) : null;
    if (!date) return false;
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;


  const userName = user?.login_42 || "there";

  return (
    <div style={{ display: "grid", gap: 28 }}>
      {/* ── Greeting — always visible ─────────── */}
      <section className="animate-in">
        <h1
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          {t(getGreetingKey())}, {userName}{" "}
          <span style={{ fontSize: 26 }}>👋</span>
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--mid)" }}>
          {t("dashSubtitle")}
        </p>
      </section>

      {/* ── Quick Actions — always visible ─────── */}
      <section className="animate-in" style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button
          type="button"
          className="student-quick-action"
          onClick={() => navigate("/passenger/reserve")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--blue)" }}>event_seat</span>
          {t("quickBookSeat")}
        </button>
        <button
          type="button"
          className="student-quick-action"
          onClick={() => navigate("/passenger/live-map")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--green)" }}>directions_bus</span>
          {t("quickTrackBus")}
        </button>
        <button
          type="button"
          className="student-quick-action"
          onClick={() => navigate("/passenger/history")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--amber)" }}>calendar_month</span>
          {t("quickMyTrips")}
        </button>
      </section>

      {/* ── Urgent announcement banner ────────── */}
      {urgentAlerts.length > 0 && (
        <section
          style={{
            background: "color-mix(in srgb, var(--red) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--red) 25%, var(--border))",
            borderRadius: 14,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--red)",
              animation: "fm-pulse 1.8s ease-in-out infinite",
              flexShrink: 0,
            }}
          />
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, color: "var(--red)", fontVariationSettings: "'FILL' 1", flexShrink: 0 }}
          >
            warning
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ fontSize: 13, color: "var(--red)" }}>{urgentAlerts[0].title}</strong>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--mid)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {urgentAlerts[0].message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/passenger/notifications")}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--red)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {urgentAlerts.length > 1 ? `+${urgentAlerts.length - 1} more` : "View"}
          </button>
        </section>
      )}

      {/* ── Error state with retry ────────────── */}
      {error && (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: 14,
            background: "var(--surface)",
            padding: "var(--space-6)",
            textAlign: "center",
            display: "grid",
            placeItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--amber-light)", display: "grid", placeItems: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, color: "var(--amber)", fontVariationSettings: "'FILL' 1" }}>cloud_off</span>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t("couldntLoad")}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", maxWidth: 320 }}>{error}</p>
          <button
            type="button"
            onClick={load}
            style={{
              border: "1px solid var(--blue-border)",
              background: "var(--blue-light)",
              color: "var(--blue)",
              borderRadius: 10,
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
              marginTop: 4,
            }}
          >
            {t("tryAgain")}
          </button>
        </section>
      )}

      {/* ── Tonight's Trip card ───────────────── */}
      {loading ? (
        <TripCardSkeleton />
      ) : !error && !user?.station ? (
        /* No station set — prompt to go to Onboarding */
        <section className="animate-in" style={{
          border: "1px solid color-mix(in srgb, var(--amber) 30%, transparent)",
          borderRadius: 16,
          background: "linear-gradient(135deg, color-mix(in srgb, var(--amber) 8%, transparent) 0%, var(--surface) 100%)",
          padding: "36px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 14,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "grid", placeItems: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: "var(--amber)", fontVariationSettings: "'FILL' 1" }}>my_location</span>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{t("setStationTitle")}</h3>
            <p style={{ margin: "8px auto 0", fontSize: 14, color: "var(--mid)", maxWidth: 360, lineHeight: 1.6 }}>
              {t("setStationDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            style={{
              border: "none",
              background: "var(--amber)",
              color: "#fff",
              borderRadius: 10,
              padding: "12px 24px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              marginTop: 4,
            }}
          >
            {t("chooseMyStop")}
          </button>
        </section>
      ) : !error && tonightTrip ? (
        <section className="animate-in" style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 16,
              background: "linear-gradient(to right, color-mix(in srgb, var(--blue) 14%, transparent), transparent)",
              filter: "blur(18px)",
              opacity: 0.55,
            }}
          />
          <div
            className="trip-card-inner"
            style={{
              position: "relative",
              border: "1px solid var(--border)",
              borderRadius: 14,
              background: "var(--surface)",
              overflow: "hidden",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div style={{ padding: "28px 28px", display: "grid", gap: 18 }}>
              <div>
                <span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--blue)", fontWeight: 700 }}>
                  {t("tonight")}
                </span>
                <h2 style={{ margin: "8px 0 6px", fontSize: 38, lineHeight: 1, letterSpacing: "-0.04em" }}>
                  {tonightTrip.route_name || "—"}
                </h2>
                <p style={{ margin: 0, color: "var(--mid)", fontSize: 13 }}>
                  The active night loop for your station.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                <span className="mono" style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em" }}>
                  {new Date(tonightTrip.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="mono" style={{ color: "var(--green)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {!hasReservedTonight ? (
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "fm-pulse 1.8s ease-in-out infinite" }} />
                  ) : null}
                  {hasReservedTonight ? `${t("reserved")} ✓` : t("inTransit")}
                </span>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", gap: 30 }}>
                <div>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>{t("seatsLeft")}</span>
                  <div className="mono" style={{ fontSize: 18 }}>{cap > 0 || left >= 0 ? `${left}/${cap || "—"}` : "-"}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>{t("bus")}</span>
                  <div className="mono" style={{ fontSize: 18 }}>{tonightTrip.bus_name || "—"}</div>
                </div>
                <div>
                  <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>{t("stops")}</span>
                  <div className="mono" style={{ fontSize: 18 }}>{tonightTrip.route_stops_count || "—"}</div>
                </div>
              </div>
            </div>

            <div className="trip-card-map-panel" style={{ background: "var(--surface2)", borderLeft: "1px solid var(--border)", padding: 24, display: "grid", alignContent: "center", gap: 18 }}>
              <div style={{ position: "relative", width: "100%", borderRadius: 12, border: "1px solid color-mix(in srgb, var(--border) 50%, transparent)", background: "var(--surface)", overflow: "hidden", display: "grid", placeItems: "center", padding: "16px 8px" }}>
                <RouteMap compact animated currentStop={0} />
              </div>
              <button
                type="button"
                onClick={() => navigate("/passenger/reserve")}
                style={{
                  border: "1px solid var(--blue-bdr)",
                  background: hasReservedTonight ? "var(--green-light)" : "var(--blue-light)",
                  color: hasReservedTonight ? "var(--green)" : "var(--blue)",
                  borderRadius: 10,
                  padding: "14px 12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14,
                  transition: "all 0.18s ease",
                }}
              >
                {hasReservedTonight ? `${t("reserved")} ✓` : t("reserveNow")}
              </button>
            </div>
          </div>
        </section>
      ) : !error ? (
        /* Rich empty state for daytime / no active trips */
        <section style={{ display: "grid", gap: "var(--space-4)" }}>
          <div
            style={{
              border: "1px solid color-mix(in srgb, var(--blue) 25%, transparent)",
              borderRadius: 16,
              background: "linear-gradient(135deg, color-mix(in srgb, var(--blue) 12%, transparent) 0%, var(--surface) 100%)",
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 16,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: "50%", background: "var(--bg)", 
              border: "1px solid var(--border)",
              display: "grid", placeItems: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--blue)", fontVariationSettings: "'FILL' 1" }}>nightlight</span>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>{t("noBusesTitle")}</h3>
              <p style={{ margin: "8px auto 0", fontSize: 14, color: "var(--mid)", maxWidth: 380, lineHeight: 1.6 }}>
                {t("noBusesDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/passenger/reserve")}
              style={{
                marginTop: 8,
                border: "none",
                background: "var(--blue)",
                color: "#fff",
                borderRadius: 10,
                padding: "12px 24px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                boxShadow: "0 4px 12px color-mix(in srgb, var(--blue) 30%, transparent)",
              }}
            >
              {t("browseSchedule")}
            </button>
          </div>
          
          {/* Helpful Tips Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
             <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--green)", fontSize: 20 }}>verified_user</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t("guaranteedSeat")}</h4>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>
                  {t("guaranteedSeatDesc")}
                </p>
             </div>
             <div style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px", background: "var(--surface)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ color: "var(--amber)", fontSize: 20 }}>my_location</span>
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t("liveTracking")}</h4>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>
                  {t("liveTrackingDesc")}
                </p>
             </div>
          </div>
        </section>
      ) : null}

      {/* ── KPI stat cards ────────────────────── */}
      {loading ? (
        <StatsSkeleton />
      ) : !error ? (
        <section className="stat-grid animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
          <PassengerStatCard
            label={t("statMyStop")}
            value={user?.station_name || t("statNotSet")}
            sub=""
            icon="location_on"
            color="var(--green)"
            countUp={false}
          />
          <PassengerStatCard
            label={t("statThisMonth")}
            value={ridesThisMonth}
            sub={t("statRidesMonth")}
            icon="calendar_month"
            color="var(--blue)"
            countUp
          />
          <PassengerStatCard
            label={t("statTotalRides")}
            value={reservations.length}
            sub={t("statLifetime")}
            icon="directions_bus"
            color="var(--amber)"
            countUp
          />
        </section>
      ) : null}

      {/* ── Recent Activity ───────────────────── */}
      {!loading && !error && (
        <section className="animate-in" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h3 style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--dim)" }}>
              Recent Activity
            </h3>
            <button
              type="button"
              onClick={() => navigate("/passenger/history")}
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--blue)" }}
            >
              {t("viewHistory")}
            </button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {reservations.slice(0, 3).map((reservation) => (
              <div
                key={reservation.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--blue-light)", display: "grid", placeItems: "center", color: "var(--blue)", flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{reservation.trip_details?.route_name || "Shuttle Trip"}</p>
                    <p style={{ margin: "3px 0 0", color: "var(--dim)", fontSize: 12 }}>
                      {timeAgo(reservation.trip_details?.departure_datetime || reservation.created_at)}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "var(--green-light)",
                    color: "var(--green)",
                    border: "1px solid var(--green-border)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {t("completed")}
                </span>
              </div>
            ))}
            {!reservations.length ? (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  background: "var(--surface)",
                  padding: "var(--space-6)",
                  textAlign: "center",
                  display: "grid",
                  placeItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--dim)" }}>schedule</span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{t("noRecentActivity")}</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--mid)" }}>{t("ridesAppearHere")}</p>
                <button
                  type="button"
                  onClick={() => navigate("/passenger/reserve")}
                  style={{
                    border: "1px solid var(--blue-border)",
                    background: "var(--blue-light)",
                    color: "var(--blue)",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {t("bookASeat")}
                </button>
              </div>
            ) : null}
          </div>
        </section>
      )}
      {/* ── FAB — Quick reserve ────────────────── */}
      <button
        type="button"
        onClick={() => navigate("/passenger/reserve")}
        aria-label="Book a seat"
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          zIndex: 15,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background: "var(--blue)",
          color: "#fff",
          boxShadow: "0 6px 20px color-mix(in srgb, var(--blue) 40%, transparent)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 26, fontVariationSettings: "'FILL' 1" }}>
          event_seat
        </span>
      </button>
    </div>
  );
}
