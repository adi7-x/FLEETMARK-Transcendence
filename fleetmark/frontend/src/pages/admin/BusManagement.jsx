import React, { useEffect, useState } from "react";
import SkeletonTable from "../../components/ui/SkeletonTable";
import SetupProgress from "../../components/ui/SetupProgress";
import AdminEmptyState from "../../components/ui/AdminEmptyState";
import { API_BASE } from "../../services/api";


const emptyForm = { name: "", plate: "", seat_capacity: "", station_id: "" };

function getBusStations() {
  try { return JSON.parse(localStorage.getItem("fleetmark_bus_stations") || "{}"); } catch { return {}; }
}
function setBusStation(busId, stationId) {
  const map = getBusStations();
  if (stationId) map[busId] = stationId; else delete map[busId];
  localStorage.setItem("fleetmark_bus_stations", JSON.stringify(map));
}

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [stationsList, setStationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("fleetmark_access");
  const headers = { 
    Authorization: `Bearer ${token}`, 
    "Content-Type": "application/json",
    "X-API-Key": import.meta.env.VITE_API_KEY
  };

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [bRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/buses/`, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "X-API-Key": import.meta.env.VITE_API_KEY
          } 
        }),
        fetch(`${API_BASE}/stations/`, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            "X-API-Key": import.meta.env.VITE_API_KEY
          } 
        }),
      ]);
      if (!bRes.ok) throw new Error("Failed to load buses.");
      const bData = await bRes.json();
      const sData = sRes.ok ? await sRes.json() : [];
      setBuses(Array.isArray(bData) ? bData : []);
      setStationsList(Array.isArray(sData) ? sData : []);
    } catch (err) {
      setError(err.message || "Unable to load buses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => window.removeEventListener("fleetmark:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(bus) {
    setEditing(bus);
    const bsMap = getBusStations();
    setForm({
      name: bus.name || "",
      plate: bus.plate || "",
      seat_capacity: String(bus.seat_capacity ?? ""),
      station_id: bus.station ? String(bus.station) : (bsMap[bus.id] || ""),
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name || !form.plate || !form.seat_capacity) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        plate: form.plate,
        seat_capacity: Number(form.seat_capacity),
      };
      const endpoint = editing ? `${API_BASE}/buses/${editing.id}/` : `${API_BASE}/buses/`;
      const method = editing ? "PUT" : "POST";
      if (form.station_id) payload.station = Number(form.station_id);
      const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.plate?.[0] || `Save failed (${res.status}).`);
      }
      const saved = await res.json().catch(() => null);
      const busId = saved?.id || editing?.id;
      if (busId) setBusStation(busId, form.station_id);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/buses/${id}/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed.");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  if (loading) return (
    <div style={{ display: "grid", gap: "var(--section-gap)" }}>
      <SkeletonTable cols={5} rows={5} />
    </div>
  );

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      <SetupProgress currentStep="buses" done={buses.length > 0} />
      <div className="animate-in" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Bus Management</h1>
        <button
          type="button"
          onClick={openCreate}
          style={{
            border: "1px solid var(--blue-bdr)",
            background: "var(--blue-bg)",
            color: "var(--blue)",
            borderRadius: 7,
            padding: "8px 14px",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Bus
        </button>
      </div>

      {error ? <p style={{ color: "var(--red)", margin: 0 }}>{error}</p> : null}

      {!buses.length ? (
        <AdminEmptyState variant="buses" onAction={openCreate} />
      ) : (
      <div className="animate-in" style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid color-mix(in srgb, var(--line) 30%, transparent)" }}>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Name</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Plate</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Seat Capacity</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Serves</th>
              <th scope="col" style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => {
              const bsMap = getBusStations();
                const stId = bus.station || bsMap[bus.id];
              const stName = stId ? stationsList.find((s) => String(s.id) === String(stId))?.name : null;
              return (
              <tr key={bus.id} className="animate-in" style={{ borderTop: "1px solid color-mix(in srgb, var(--line) 20%, transparent)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{bus.name}</td>
                <td className="mono" style={{ padding: "12px 16px" }}>{bus.plate}</td>
                <td className="mono" style={{ padding: "12px 16px" }}>{bus.seat_capacity}</td>
                <td style={{ padding: "12px 16px" }}>
                  {stName ? (
                    <span style={{ background: "var(--green-bg, var(--blue-bg))", color: "var(--green, var(--blue))", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 600 }}>{stName}</span>
                  ) : (
                    <span style={{ color: "var(--mid)", fontSize: 13 }}>—</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    <button type="button" onClick={() => openEdit(bus)} style={{ border: "none", background: "transparent", color: "var(--mid)", cursor: "pointer" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(bus)} style={{ border: "none", background: "transparent", color: "var(--red)", cursor: "pointer" }}>
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
      )}

      {open ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(520px,92vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0 }}>{editing ? "Edit Bus" : "Add New Bus"}</h3>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Bus Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Bus 1"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
            </div>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>License Plate</label>
              <input
                value={form.plate}
                onChange={(e) => setForm((p) => ({ ...p, plate: e.target.value }))}
                placeholder="e.g. BUS-001"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
            </div>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Seat Capacity</label>
              <input
                type="number"
                min="1"
                value={form.seat_capacity}
                onChange={(e) => setForm((p) => ({ ...p, seat_capacity: e.target.value }))}
                placeholder="e.g. 50"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
            </div>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Primary Station</label>
              <select
                value={form.station_id}
                onChange={(e) => setForm((p) => ({ ...p, station_id: e.target.value }))}
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              >
                <option value="">None</option>
                {stationsList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: "var(--space-2)" }}>
              <button type="button" onClick={() => setOpen(false)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={save} disabled={saving} style={{ border: "1px solid var(--blue-bdr)", background: "var(--blue-bg)", color: "var(--blue)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {confirmDelete ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Delete Bus</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Are you sure you want to delete <strong>{confirmDelete.name}</strong> ({confirmDelete.plate})?
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setConfirmDelete(null)} style={{ border: "1px solid var(--line)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                Cancel
              </button>
              <button type="button" onClick={() => remove(confirmDelete.id)} style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", background: "var(--red-bg)", color: "var(--red)", borderRadius: 8, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
