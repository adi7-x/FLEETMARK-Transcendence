import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import { API_BASE } from "../../services/api";


const emptyForm = { name: "", plate: "", seat_capacity: "" };

export default function BusManagement() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("fleetmark_access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/buses/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load buses.");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(bus) {
    setEditing(bus);
    setForm({
      name: bus.name || "",
      plate: bus.plate || "",
      seat_capacity: String(bus.seat_capacity ?? ""),
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
      const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.plate?.[0] || `Save failed (${res.status}).`);
      }
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

  if (loading) return <Spinner text="Loading buses..." />;

  return (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

      <div style={{ background: "color-mix(in srgb, var(--surface) 30%, transparent)", border: "1px solid color-mix(in srgb, var(--line) 30%, transparent)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid color-mix(in srgb, var(--line) 30%, transparent)" }}>
              <th style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Name</th>
              <th style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Plate</th>
              <th style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Seat Capacity</th>
              <th style={{ padding: "14px 16px", fontSize: 10, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {buses.map((bus) => (
              <tr key={bus.id} style={{ borderTop: "1px solid color-mix(in srgb, var(--line) 20%, transparent)" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700 }}>{bus.name}</td>
                <td className="mono" style={{ padding: "12px 16px" }}>{bus.plate}</td>
                <td className="mono" style={{ padding: "12px 16px" }}>{bus.seat_capacity}</td>
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
            ))}
            {!buses.length ? (
              <tr>
                <td colSpan={4} style={{ padding: "24px 16px", textAlign: "center", color: "var(--mid)" }}>No buses registered.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {open ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(520px,92vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0 }}>{editing ? "Edit Bus" : "Add New Bus"}</h3>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Bus Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Apollo-9"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
            </div>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>License Plate</label>
              <input
                value={form.plate}
                onChange={(e) => setForm((p) => ({ ...p, plate: e.target.value }))}
                placeholder="e.g. AB-1234-CD"
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
                placeholder="e.g. 48"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
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
