import React, { useEffect, useState } from "react";
import AdminEmptyState from "../../components/ui/AdminEmptyState";
import { API_BASE } from "../../services/api";

const emptyForm = { title: "", message: "", priority: "info" };
const PRIORITY_OPTIONS = [
  { value: "info", label: "Info", color: "var(--blue)" },
  { value: "warning", label: "Warning", color: "var(--amber, orange)" },
  { value: "urgent", label: "Urgent", color: "var(--red)" },
];

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("fleetmark_access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/announcements/`, { headers });
      if (!res.ok) throw new Error("Failed to load announcements.");
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => window.removeEventListener("fleetmark:refresh", onRefresh);
  }, []);

  async function publish() {
    if (!form.title.trim() || !form.message.trim()) {
      setError("Title and message are required.");
      return;
    }
    setError("");
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        priority: form.priority,
      };
      const res = await fetch(`${API_BASE}/announcements/`, { method: "POST", headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Publish failed.");
      const newEntry = await res.json();
      setAnnouncements((prev) => [newEntry, ...prev]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || "Publish failed.");
    }
  }

  async function remove(id) {
    try {
      const res = await fetch(`${API_BASE}/announcements/${id}/`, { method: "DELETE", headers });
      if (!res.ok) throw new Error("Delete failed.");
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  if (loading) {
    return (
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid var(--line2)", borderRadius: 10, background: "var(--surface)", padding: "16px 18px", display: "grid", gap: 8 }}>
            <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: "50%", borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 12, width: "80%", borderRadius: 4 }} />
          </div>
        ))}
      </div>
    );
  }

  const priorityMeta = (p) => PRIORITY_OPTIONS.find((o) => o.value === p) || PRIORITY_OPTIONS[0];

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Announcements</h1>

      {/* Compose */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, padding: "var(--space-5, 20px)", display: "grid", gap: "var(--space-3)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Compose Announcement</h3>
        {error ? <p style={{ color: "var(--red)", margin: 0, fontSize: 13 }}>{error}</p> : null}
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. Schedule change tonight"
            style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10 }}
          />
        </div>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Write your announcement here..."
            rows={3}
            style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 8, padding: 10, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mid)", fontWeight: 700 }}>Priority</label>
          <div style={{ display: "flex", gap: 8 }}>
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, priority: opt.value }))}
                style={{
                  border: `1px solid ${form.priority === opt.value ? opt.color : "var(--line)"}`,
                  background: form.priority === opt.value ? `color-mix(in srgb, ${opt.color} 12%, transparent)` : "var(--surface2)",
                  color: form.priority === opt.value ? opt.color : "var(--mid)",
                  borderRadius: 6,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={publish}
            style={{
              border: "1px solid var(--blue-bdr)",
              background: "var(--blue-bg)",
              color: "var(--blue)",
              borderRadius: 8,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
            Publish
          </button>
        </div>
      </div>

      {/* Announcement list */}
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        {announcements.map((a) => {
          const pm = priorityMeta(a.priority);
          return (
            <div
              key={a.id}
              style={{
                border: `1px solid color-mix(in srgb, ${pm.color} 30%, var(--line))`,
                borderLeft: `4px solid ${pm.color}`,
                borderRadius: 10,
                background: "var(--surface)",
                padding: "16px 18px",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: `color-mix(in srgb, ${pm.color} 15%, transparent)`, color: pm.color, borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                      {pm.label}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--mid)" }}>
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h4 style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700 }}>{a.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(a)}
                  style={{ border: "none", background: "transparent", color: "var(--red)", cursor: "pointer", padding: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>{a.message}</p>
            </div>
          );
        })}
        {!announcements.length ? (
          <AdminEmptyState variant="announcements" />
        ) : null}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete ? (
        <div className="modal-backdrop-anim" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 20 }}>
          <div style={{ width: "min(420px,90vw)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
            <h3 style={{ margin: 0 }}>Delete Announcement</h3>
            <p style={{ margin: 0, color: "var(--mid)" }}>
              Delete "<strong>{confirmDelete.title}</strong>"? This cannot be undone.
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
