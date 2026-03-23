import React, { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import { API_BASE } from "../../services/api";


const emptyForm = { name: "", window: "peak" };

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("fleetmark_access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load(preserveSelectionId = null) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/routes/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load routes.");
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setRoutes(list);
      if (preserveSelectionId) {
        setSelected(list.find((r) => r.id === preserveSelectionId) || list[0] || null);
      } else {
        setSelected(list[0] || null);
      }
    } catch (err) {
      setError(err.message || "Unable to load routes.");
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

  function openEdit(route) {
    setEditing(route);
    setForm({
      name: route.name || "",
      window: route.window || "peak",
    });
    setOpen(true);
  }

  async function save() {
    if (!form.name || !form.window) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form };
      const endpoint = editing ? `${API_BASE}/routes/${editing.id}/` : `${API_BASE}/routes/`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || data?.name?.[0] || `Save failed (${res.status}).`);
      }
      const savedRoute = await res.json();
      setOpen(false);
      await load(savedRoute.id);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/routes/${id}/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed.");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  if (loading) return <Spinner text="Loading routes..." />;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "var(--space-5)" }}>
      {/* Sidebar with Route List */}
      <aside style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Routes</h2>
          <button
            type="button"
            onClick={openCreate}
            style={{
              border: "1px solid var(--blue-bdr)",
              background: "var(--blue-bg)",
              color: "var(--blue)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            New
          </button>
        </div>
        
        {error ? <p style={{ color: "var(--red)", margin: 0, fontSize: 14 }}>{error}</p> : null}
        
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          {routes.map((route) => (
            <button
              key={route.id}
              type="button"
              onClick={() => setSelected(route)}
              style={{
                textAlign: "left",
                border: "1px solid var(--line2)",
                borderRadius: "var(--radius-sm)",
                background: selected?.id === route.id ? "var(--blue-bg)" : "var(--surface2)",
                color: selected?.id === route.id ? "var(--blue)" : "var(--ink)",
                padding: "10px 12px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{route.name}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: selected?.id === route.id ? "var(--blue)" : "var(--dim)" }}>chevron_right</span>
            </button>
          ))}
          {!routes.length ? <p style={{ color: "var(--mid)", margin: 0, fontSize: 14 }}>No routes found.</p> : null}
        </div>
      </aside>

      {/* Main Content Area */}
      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
        {selected ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
              <div>
                <h2 style={{ margin: "0 0 var(--space-2) 0" }}>{selected.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: "var(--mid)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Window:</span>
                  <span style={{ 
                    background: "var(--surface2)", 
                    padding: "2px 8px", 
                    borderRadius: 4, 
                    fontSize: 12, 
                    textTransform: "capitalize",
                    color: "var(--ink)"
                  }}>
                    {selected.window || "-"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => openEdit(selected)} style={{ border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--ink)", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                  Edit
                </button>
                <button type="button" onClick={() => setConfirmDelete(selected)} style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", background: "var(--red-bg)", color: "var(--red)", borderRadius: 6, padding: "6px 12px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  Delete
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: 14, color: "var(--mid)", marginTop: "var(--space-6)", marginBottom: "var(--space-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Route Stations</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {(selected.stations || []).map((stop) => (
                <span key={`${stop.order}-${stop.station.id}`} className="mono" style={{ border: "1px solid var(--line2)", borderRadius: "999px", padding: "6px 10px", background: "var(--surface2)", color: "var(--ink)", fontSize: 13 }}>
                  {stop.order}. {stop.station.name}
                </span>
              ))}
              {!selected.stations?.length ? <p style={{ color: "var(--mid)", margin: 0, fontSize: 14 }}>No stops configured for this route.</p> : null}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--mid)", textAlign: "center" }}>
            <div>
              <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5, marginBottom: 16 }}>map</span>
              <p style={{ margin: 0 }}>Select a route to view details.</p>
            </div>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {open ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(480px,92vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
            <h3 style={{ margin: 0 }}>{editing ? "Edit Route" : "Add New Route"}</h3>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Route Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Downtown Express"
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              />
            </div>
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Service Window</label>
              <select
                value={form.window}
                onChange={(e) => setForm((p) => ({ ...p, window: e.target.value }))}
                style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
              >
                <option value="peak">Peak</option>
                <option value="consolidated">Consolidated</option>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Delete Route</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Are you sure you want to delete route <strong>{confirmDelete.name}</strong>?
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
