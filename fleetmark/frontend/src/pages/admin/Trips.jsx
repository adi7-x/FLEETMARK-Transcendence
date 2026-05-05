import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SkeletonTable from "../../components/ui/SkeletonTable";
import SetupProgress from "../../components/ui/SetupProgress";
import AdminEmptyState from "../../components/ui/AdminEmptyState";
import useCountUp from "../../hooks/useCountUp";
import { API_BASE } from "../../services/api";


const emptyForm = { route: "", bus: "", driver: "", departure_datetime: "" };

/** Stat card with count-up — must be a separate component (rules of hooks). */
function TripStatCard({ label, numericTarget, suffix, decimals = 0 }) {
  const n = numericTarget == null || Number.isNaN(Number(numericTarget)) ? null : Number(numericTarget);
  const animated = useCountUp(n ?? 0, 650);
  const display =
    n == null ? "—" : decimals > 0 ? animated.toFixed(decimals) : String(animated);

  return (
    <article
      style={{
        background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)",
        borderRadius: 8,
        padding: "16px 16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 108,
      }}
    >
      <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--mid)" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span className="mono" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{display}</span>
        {suffix ? (
          <span className="mono" style={{ fontSize: 11, color: "var(--mid)", paddingBottom: 2 }}>
            {suffix}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export default function Trips() {
  const location = useLocation();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmArchive, setConfirmArchive] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkType, setBulkType] = useState("regular");
  const [bulkForm, setBulkForm] = useState({ start_date: "", end_date: "", dates: "", route: "", bus: "", driver: "", skip_weekends: true });

  const token = localStorage.getItem("fleetmark_access");
  const headers = useMemo(() => ({ 
    Authorization: `Bearer ${token}`, 
    "Content-Type": "application/json",
    "X-API-Key": import.meta.env.VITE_API_KEY
  }), [token]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [t, r, b, d] = await Promise.all([
        fetch(`${API_BASE}/trips/`, { headers }),
        fetch(`${API_BASE}/routes/`, { headers }),
        fetch(`${API_BASE}/buses/`, { headers }),
        fetch(`${API_BASE}/drivers/`, { headers }),
      ]);
      if (!t.ok || !r.ok || !b.ok || !d.ok) throw new Error("Failed to load trips.");
      const [tData, rData, bData, dData] = await Promise.all([t.json(), r.json(), b.json(), d.json()]);
      setTrips(tData || []);
      setRoutes(rData || []);
      setBuses(bData || []);
      setDrivers(dData || []);
    } catch (err) {
      setError(err.message || "Trip page load failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.state?.openTripForm) {
      openCreate();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openTripForm, location.pathname, navigate]);

  useEffect(() => {
    window.addEventListener("fleetmark:new-trip", openCreate);
    return () => window.removeEventListener("fleetmark:new-trip", openCreate);
  }, []);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => window.removeEventListener("fleetmark:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getCountdown(departureStr) {
    const ms = new Date(departureStr) - new Date();
    if (ms < 0) return "Departed";
    const mins = Math.floor(ms / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `in ${h}h ${m}m`;
    return `in ${m}m`;
  }

  function getRowStatus(trip) {
    if (trip.archived_at) return "archived";
    const seatsLeft = Number(trip.seats_left ?? 0);
    const capacity = Number(trip.bus_seat_capacity || 0);
    if (seatsLeft <= 0) return "full";
    if (capacity > 0 && seatsLeft / capacity <= 0.2) return "near_full";
    return "scheduled";
  }

  function capacityForTrip(trip) {
    const direct = Number(trip.bus_seat_capacity ?? trip.seat_capacity ?? 0);
    if (direct > 0) return direct;
    const bus = buses.find((item) => item.id === trip.bus);
    return Number(bus?.seat_capacity ?? bus?.capacity ?? 0);
  }

  const filtered = trips.filter((trip) => {
    const rowStatus = getRowStatus(trip);
    if (statusFilter !== "all" && statusFilter !== rowStatus) return false;
    if (routeFilter !== "all" && trip.route !== routeFilter) return false;
    return true;
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(trip) {
    setEditing(trip);
    setForm({
      route: trip.route,
      bus: trip.bus,
      driver: trip.driver,
      departure_datetime: new Date(trip.departure_datetime).toISOString().slice(0, 16),
    });
    setOpen(true);
  }

  function openBulkCreate(type) {
    setBulkType(type);
    setBulkForm({ start_date: "", end_date: "", dates: "", route: "", bus: "", driver: "", skip_weekends: true });
    setBulkOpen(true);
  }

  function openGenerateWeekly() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
    
    // Find current week's Monday (or most recent)
    const nextMonday = new Date(today);
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    nextMonday.setDate(today.getDate() + diff);
    
    // Sunday is 6 days after Monday
    const nextSunday = new Date(nextMonday);
    nextSunday.setDate(nextMonday.getDate() + 6);
    
    // Format to YYYY-MM-DD local
    const toYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setBulkType("regular");
    setBulkForm({ 
      start_date: toYMD(nextMonday), 
      end_date: toYMD(nextSunday), 
      dates: "", 
      route: "", 
      bus: "", 
      driver: "", 
      skip_weekends: false  // Weekends matter for Mon-Sun
    });
    setBulkOpen(true);
  }

  async function saveBulk() {
    setLoading(true);
    setError("");

    // ── 1. Validate date range ──────────────────────────────────
    if (bulkType === "regular" && bulkForm.end_date) {
      const eDate = new Date(bulkForm.end_date);
      const today = new Date();
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 15);
      if (eDate > maxDate) {
        setError("You cannot generate trips further than 15 days from today.");
        setLoading(false);
        return;
      }
    }

    try {
      // ── 2. Build the list of target dates ─────────────────────
      let datesToGenerate = [];

      if (bulkType === "regular") {
        if (!bulkForm.start_date || !bulkForm.end_date) {
          setError("Start and end dates are required.");
          setLoading(false);
          return;
        }
        const start = new Date(bulkForm.start_date + "T00:00:00");
        const end   = new Date(bulkForm.end_date   + "T00:00:00");
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
          if (bulkForm.skip_weekends && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
          datesToGenerate.push(new Date(d));
        }
      } else {
        // specific dates
        if (!bulkForm.dates) {
          setError("Please enter at least one date.");
          setLoading(false);
          return;
        }
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 15);
        const items = bulkForm.dates.split(",").map(s => s.trim()).filter(Boolean);
        for (const ds of items) {
          const parsed = new Date(ds + "T00:00:00");
          if (isNaN(parsed.getTime())) continue;
          if (parsed > maxDate) {
            setError("You cannot generate trips further than 15 days from today.");
            setLoading(false);
            return;
          }
          datesToGenerate.push(parsed);
        }
      }

      if (!datesToGenerate.length) {
        setError("No valid dates in the selected range.");
        setLoading(false);
        return;
      }

      // ── 3. Resolve routes / buses / driver by name ────────────
      const find = (arr, ...names) => arr.find(item =>
        names.some(n => (item.name || "").toLowerCase().includes(n.toLowerCase()))
      );

      const routeOcp     = find(routes, "OCP");
      const routeCb      = find(routes, "Coin Blue", "CoinBlue");
      const routeUnified = find(routes, "Unified", "Night Route");

      const busOcp     = find(buses, "OCP");
      const busCb      = find(buses, "Coin Blue", "CoinBlue", "CB");
      const busUnified = find(buses, "Unified", "Night Route", "UNI");

      const defaultDriver = drivers[0] || null;

      // Fallbacks: use first available if specific ones not found
      const fallbackRoute = routes[0];
      const fallbackBus   = buses[0];

      if (!fallbackRoute || !fallbackBus) {
        setError("You need at least 1 route and 1 bus before generating a schedule.");
        setLoading(false);
        return;
      }

      // ── 4. Build trip payloads ────────────────────────────────
      // Hours: 21, 22, 23, 0, 1, 3, 4, 5, 6  (02:00 is excluded)
      const HOURS = [21, 22, 23, 0, 1, 3, 4, 5, 6];
      const PEAK  = new Set([21, 22, 1]);

      const payloads = [];

      for (const targetDate of datesToGenerate) {
        for (const h of HOURS) {
          // For hours after midnight (0-6), the calendar day is target_date + 1
          const actualDate = new Date(targetDate);
          if (h < 12) actualDate.setDate(actualDate.getDate() + 1);

          const departureISO = new Date(
            actualDate.getFullYear(),
            actualDate.getMonth(),
            actualDate.getDate(),
            h, 0, 0
          ).toISOString();

          if (PEAK.has(h)) {
            // Peak: 2 trips — OCP Route + Coin Blue Route
            payloads.push({
              route:              (routeOcp || fallbackRoute).id,
              bus:                (busOcp   || fallbackBus).id,
              driver:             defaultDriver?.id || "",
              departure_datetime: departureISO,
            });
            payloads.push({
              route:              (routeCb || routeUnified || fallbackRoute).id,
              bus:                (busCb   || busUnified   || fallbackBus).id,
              driver:             defaultDriver?.id || "",
              departure_datetime: departureISO,
            });
          } else {
            // Normal: 1 trip — Unified Night Route
            payloads.push({
              route:              (routeUnified || fallbackRoute).id,
              bus:                (busUnified   || fallbackBus).id,
              driver:             defaultDriver?.id || "",
              departure_datetime: departureISO,
            });
          }
        }
      }

      // ── 5. Deduplicate against existing trips ─────────────────
      const existingKeys = new Set(
        trips.map((t) => `${t.route}|${t.departure_datetime}`)
      );

      const newPayloads = payloads.filter((p) => {
        const key = `${p.route}|${p.departure_datetime}`;
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);   // also deduplicate within the batch
        return true;
      });

      if (!newPayloads.length) {
        setError("All trips for this range already exist — nothing new to generate.");
        setLoading(false);
        return;
      }

      // ── 6. Create trips (batched, 5 at a time) ────────────────
      let created = 0;
      const BATCH = 5;
      for (let i = 0; i < newPayloads.length; i += BATCH) {
        const batch = newPayloads.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          batch.map((p) =>
            fetch(`${API_BASE}/trips/`, {
              method: "POST",
              headers,
              body: JSON.stringify(p),
            })
          )
        );
        created += results.filter((r) => r.status === "fulfilled" && r.value.ok).length;
      }

      setBulkOpen(false);
      await load();
      // brief success feedback via the error state (green-ish in the UI)
      if (created > 0) setError("");
    } catch (err) {
      setError(err.message || "Schedule generation failed.");
      setLoading(false);
    }
  }

  async function save() {
    try {
      const payload = { ...form, departure_datetime: new Date(form.departure_datetime).toISOString() };
      const endpoint = editing ? `${API_BASE}/trips/${editing.id}/` : `${API_BASE}/trips/`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed.");
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
  }

  async function deleteAll() {
    if (!window.confirm("⚠️ DANGER: Are you entirely sure you want to DELETE ALL trips from the system? This will wipe the active transit registry!")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/trips/bulk-delete/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete all failed.");
      await load();
    } catch (err) {
      setError(err.message || "Delete all failed.");
      setLoading(false);
    }
  }

  async function archive(trip) {
    try {
      const res = await fetch(`${API_BASE}/trips/${trip.id}/`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          route: trip.route,
          bus: trip.bus,
          driver: trip.driver,
          departure_datetime: trip.departure_datetime,
          archived_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Archive failed.");
      await load();
    } catch (err) {
      setError(err.message || "Archive failed.");
    }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/trips/${id}/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed.");
      await load();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  if (loading) return (
    <div style={{ display: "grid", gap: "var(--section-gap)" }}>
      <SkeletonTable cols={6} rows={6} />
    </div>
  );

  return (
    <div className="animate-in" style={{ position: "relative", display: "grid", gap: 26 }}>
      <SetupProgress currentStep="trips" done={trips.filter(t => !t.archived_at).length > 0} />
      <style>{`
        .trip-row .row-actions { opacity: 0; transition: opacity 0.2s; }
        .trip-row:hover .row-actions { opacity: 1; }
      `}</style>
      <div className="animate-in" style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span className="mono" style={{ color: "var(--blue)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>
            System Registry
          </span>
          <h2 style={{ margin: "8px 0 0", fontSize: 42, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Active Transit Shuttles
          </h2>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={deleteAll}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface)",
              color: "var(--red)",
              border: "1px solid color-mix(in srgb, var(--red) 30%, transparent)",
              borderRadius: 10,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>delete_sweep</span>
            Delete All
          </button>
          <button
            type="button"
            onClick={openGenerateWeekly}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid color-mix(in srgb, var(--line) 50%, transparent)",
              borderRadius: 10,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>date_range</span>
            Weekly Mon-Sun
          </button>
          <button
            type="button"
            onClick={() => openBulkCreate("regular")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid color-mix(in srgb, var(--line) 50%, transparent)",
              borderRadius: 10,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "var(--shadow-sm)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>event</span>
            Custom Dates
          </button>
          <button
            type="button"
            onClick={openCreate}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--blue)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 20px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "var(--shadow-md), 0 4px 12px color-mix(in srgb, var(--blue) 30%, transparent)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>add_box</span>
            New Trip
          </button>
        </div>
      </div>

      <div className="animate-in" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", borderBottom: "1px solid color-mix(in srgb, var(--line) 30%, transparent)" }}>
        <div style={{ display: "flex", alignItems: "center", background: "var(--surface)", padding: 4, borderRadius: 8 }}>
          {[
            ["all", "All"],
            ["scheduled", "Scheduled"],
            ["full", "Full"],
            ["near_full", "Near Full"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              style={{
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                background: statusFilter === value ? "var(--blue-bg)" : "transparent",
                color: statusFilter === value ? "var(--blue)" : "var(--mid)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: "color-mix(in srgb, var(--line) 40%, transparent)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", color: "var(--mid)", letterSpacing: "0.12em" }}>
            Route:
          </span>
          <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", borderRadius: 6, padding: "7px 10px" }}>
            <option value="all">All routes</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <p style={{ color: "var(--red)", margin: 0 }}>{error}</p> : null}

      {!filtered.length && trips.length === 0 ? (
        <AdminEmptyState variant="trips" onAction={openCreate} />
      ) : (
      <>
      <div className="animate-in trips-table-desktop" style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid color-mix(in srgb, var(--line) 30%, transparent)" }}>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Departure</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Route</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Bus & Driver</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Capacity</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Status</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((trip) => {
              const rowStatus = getRowStatus(trip);
              const cap = capacityForTrip(trip);
              const left = Number(trip.seats_left ?? 0);
              const used = cap > 0 ? Math.max(0, cap - left) : 0;
              const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0;
              const b = buses.find((item) => item.id === trip.bus);
              const d = drivers.find((item) => item.id === trip.driver);
              return (
                <tr key={trip.id} className="trip-row" style={{ borderTop: "1px solid color-mix(in srgb, var(--line) 20%, transparent)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="mono" style={{ color: "var(--blue)", fontSize: 14 }}>
                        {new Date(trip.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="mono" style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "var(--surface2)", color: "var(--ink2)", fontWeight: 700 }}>
                        {getCountdown(trip.departure_datetime)}
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--dim)", textTransform: "uppercase", marginTop: 4 }}>
                      {new Date(trip.departure_datetime).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{trip.route_name || trip.route}</div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--mid)", textTransform: "uppercase" }}>
                      {String(trip.id ?? "").slice(0, 8)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                    <div style={{ display: "grid", gap: 4, maxWidth: 220 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>
                        {b?.name || trip.bus_name || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--mid)", lineHeight: 1.35 }}>
                        <span style={{ opacity: 0.75 }}>Driver</span>{" "}
                        <span style={{ fontWeight: 600, color: "var(--ink2)" }}>{d?.name || trip.driver_name || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", width: 180, verticalAlign: "top" }}>
                    <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--mid)", marginBottom: 6 }}>
                      <span>
                        {cap > 0 ? `${used} / ${cap}` : "—"}
                      </span>
                      <span>{cap > 0 ? `${pct}%` : ""}</span>
                    </div>
                    <div style={{ height: 5, width: "100%", background: "var(--surface2)", borderRadius: 999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: cap > 0 ? `${pct}%` : "0%",
                          background:
                            rowStatus === "full" || rowStatus === "near_full"
                              ? "var(--red)"
                              : "var(--blue)",
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      className="mono"
                      style={{
                        borderRadius: 4,
                        padding: "2px 8px",
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 700,
                        border:
                          rowStatus === "full" || rowStatus === "near_full"
                            ? "1px solid color-mix(in srgb, var(--red) 40%, transparent)"
                            : "1px solid color-mix(in srgb, var(--blue) 40%, transparent)",
                        background:
                          rowStatus === "full" || rowStatus === "near_full"
                            ? "var(--red-bg)"
                            : "color-mix(in srgb, var(--blue) 10%, transparent)",
                        color:
                          rowStatus === "full" || rowStatus === "near_full"
                            ? "var(--red)"
                            : "var(--blue)",
                      }}
                    >
                      {rowStatus === "near_full" ? "NEAR_FULL" : rowStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div className="row-actions" style={{ display: "inline-flex", gap: 6 }}>
                      <button type="button" onClick={() => openEdit(trip)} style={{ border: "none", background: "transparent", color: "var(--mid)", cursor: "pointer" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                      </button>
                      {!trip.archived_at ? (
                        <button type="button" onClick={() => setConfirmArchive(trip)} style={{ border: "none", background: "transparent", color: "var(--mid)", cursor: "pointer" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>package_2</span>
                        </button>
                      ) : null}
                      <button type="button" onClick={() => setConfirmDelete(trip)} style={{ border: "none", background: "transparent", color: "var(--red)", cursor: "pointer" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="animate-in trips-cards-mobile">
        {filtered.map((trip) => {
          const rowStatus = getRowStatus(trip);
          const cap = capacityForTrip(trip);
          const left = Number(trip.seats_left ?? 0);
          const used = cap > 0 ? Math.max(0, cap - left) : 0;
          const b = buses.find((item) => item.id === trip.bus);
          const d = drivers.find((item) => item.id === trip.driver);
          return (
            <div key={trip.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{trip.route_name || trip.route}</div>
                  <div className="mono" style={{ color: "var(--blue)", fontSize: 13, marginTop: 4 }}>
                    {new Date(trip.departure_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span
                  className="mono"
                  style={{ borderRadius: 4, padding: "2px 6px", fontSize: 9, textTransform: "uppercase", fontWeight: 700, 
                  border: rowStatus === "full" || rowStatus === "near_full" ? "1px solid color-mix(in srgb, var(--red) 40%, transparent)" : "1px solid color-mix(in srgb, var(--blue) 40%, transparent)",
                  background: rowStatus === "full" || rowStatus === "near_full" ? "var(--red-bg)" : "var(--blue-light)",
                  color: rowStatus === "full" || rowStatus === "near_full" ? "var(--red)" : "var(--blue)" }}
                >
                  {rowStatus}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13, background: "var(--surface2)", padding: 12, borderRadius: 8 }}>
                <div>
                  <span style={{ color: "var(--mid)", display: "block", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Bus</span>
                  {b?.name || trip.bus_name || "—"}
                </div>
                <div>
                  <span style={{ color: "var(--mid)", display: "block", fontSize: 10, textTransform: "uppercase", fontWeight: 700 }}>Capacity</span>
                  {cap > 0 ? `${used} / ${cap}` : "—"}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 12, color: "var(--mid)" }}>{d?.name || trip.driver_name || "No driver"}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span className="material-symbols-outlined" onClick={() => openEdit(trip)} style={{ fontSize: 18, color: "var(--mid)", cursor: "pointer" }}>edit</span>
                  {!trip.archived_at && <span className="material-symbols-outlined" onClick={() => setConfirmArchive(trip)} style={{ fontSize: 18, color: "var(--mid)", cursor: "pointer" }}>package_2</span>}
                  <span className="material-symbols-outlined" onClick={() => setConfirmDelete(trip)} style={{ fontSize: 18, color: "var(--red)", cursor: "pointer" }}>delete</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      <section className="animate-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
        {(() => {
          const activeTrips = trips.filter((t) => !t.archived_at);
          const totalCap = activeTrips.reduce((sum, t) => sum + capacityForTrip(t), 0);
          const totalUsed = activeTrips.reduce((sum, t) => {
            const cap = capacityForTrip(t);
            const left = Number(t.seats_left ?? 0);
            return sum + (cap > 0 ? Math.max(0, cap - left) : 0);
          }, 0);
          const utilNum = totalCap > 0 ? Math.round((totalUsed / totalCap) * 100) : null;
          const totalReserved = totalUsed;
          return [
            { label: "Fleet Utilization", numericTarget: utilNum, suffix: totalCap > 0 ? "%" : "", decimals: 0 },
            { label: "Booked Seats", numericTarget: totalReserved, suffix: "active", decimals: 0 },
            { label: "Drivers", numericTarget: drivers.length, suffix: "registered", decimals: 0 },
            { label: "Active Trips", numericTarget: activeTrips.length, suffix: "tonight", decimals: 0 },
          ];
        })().map((item) => (
          <TripStatCard key={item.label} label={item.label} numericTarget={item.numericTarget} suffix={item.suffix} decimals={item.decimals} />
        ))}
      </section>

      {bulkOpen ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(520px,92vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0 }}>{bulkType === "regular" ? "Generate Schedule" : "Generate Specific Events"}</h3>
            <p style={{ margin: 0, color: "var(--mid)", fontSize: 13, lineHeight: 1.4 }}>
              {bulkType === "regular" 
                ? "Generate night shift shuttles for the selected date range. 02:00 is automatically disabled."
                : "Generate shuttles on specific exact dates. Type target dates separated by commas (ex. 2024-12-25, 2024-12-31)."}
            </p>

            <div style={{ background: "color-mix(in srgb, var(--blue) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--blue) 30%, transparent)", borderRadius: 8, padding: 12, display: "grid", gap: 6 }}>
              <strong style={{ fontSize: 12, color: "var(--blue)", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>info</span>
                Automatic Routing Applied
              </strong>
              <p style={{ margin: 0, fontSize: 12, color: "var(--mid)" }}>
                <strong>Peak Hours (21:00, 22:00, 01:00):</strong> Generates 2 trips (OCP Route + Coin Blue Route).<br/>
                <strong>Normal Hours:</strong> Generates 1 trip (Unified Night Route).
              </p>
            </div>

            {bulkType === "regular" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Start Date</label>
                    <input type="date" value={bulkForm.start_date} onChange={(e) => setBulkForm((p) => ({ ...p, start_date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>End Date</label>
                    <input type="date" value={bulkForm.end_date} onChange={(e) => setBulkForm((p) => ({ ...p, end_date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", marginTop: 4 }}>
                  <input type="checkbox" checked={bulkForm.skip_weekends} onChange={(e) => setBulkForm((p) => ({ ...p, skip_weekends: e.target.checked }))} />
                  <span>Skip Weekends (Saturday & Sunday)</span>
                </label>
              </>
            ) : (
              <div>
                <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Specific Dates (comma-separated YYYY-MM-DD)</label>
                <input type="text" placeholder="e.g. 2024-12-25, 2024-12-31" value={bulkForm.dates} onChange={(e) => setBulkForm((p) => ({ ...p, dates: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
              </div>
            )}

            {error && <p style={{ color: "var(--red)", fontSize: 13, margin: 0 }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => setBulkOpen(false)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={saveBulk} disabled={loading} style={{ border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Generating..." : "Generate Schedule"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(520px,92vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0 }}>{editing ? "Edit trip" : "Create trip"}</h3>
            <select value={form.route} onChange={(e) => setForm((p) => ({ ...p, route: e.target.value }))} style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              <option value="">Route</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
            <select value={form.bus} onChange={(e) => setForm((p) => ({ ...p, bus: e.target.value }))} style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              <option value="">Bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.id}>
                  {bus.name} ({bus.plate})
                </option>
              ))}
            </select>
            <select value={form.driver} onChange={(e) => setForm((p) => ({ ...p, driver: e.target.value }))} style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}>
              <option value="">Driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <input type="datetime-local" value={form.departure_datetime} onChange={(e) => setForm((p) => ({ ...p, departure_datetime: e.target.value }))} style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setOpen(false)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px" }}>
                Cancel
              </button>
              <button type="button" onClick={save} style={{ border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: 8, padding: "9px 12px", fontWeight: 700 }}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {confirmDelete ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Delete Trip</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Are you sure you want to delete this trip? All reservations for it will be cancelled. This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(null)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={() => { remove(confirmDelete.id); setConfirmDelete(null); }} style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", background: "var(--red-bg)", color: "var(--red)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Archive Confirmation Modal */}
      {confirmArchive ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Archive Trip</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Are you sure you want to archive this trip? It will no longer appear in active listings.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setConfirmArchive(null)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={() => { archive(confirmArchive); setConfirmArchive(null); }} style={{ border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                Archive
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
