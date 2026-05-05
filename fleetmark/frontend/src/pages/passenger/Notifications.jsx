import React, { useEffect, useState } from "react";
import { useTranslation } from "../../context/TranslationContext";
import { API_BASE } from "../../services/api";
const PRIORITY_COLORS = {
  urgent: "var(--red)",
  warning: "var(--amber, orange)",
  info: "var(--blue)",
};

const PRIORITY_ICONS = {
  urgent: "error",
  warning: "warning",
  info: "info",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Notifications() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [tab, setTab] = useState("all");
  const token = localStorage.getItem("fleetmark_access");

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/announcements/`, {
        headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY }
      });
      if (res.ok) {
        setAnnouncements(await res.json());
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    load();
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function dismiss(id) {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_dismissed: true } : a));
    window.dispatchEvent(new CustomEvent("fleetmark:refresh"));
    if (token) {
      await fetch(`${API_BASE}/announcements/${id}/dismiss/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY }
      }).catch(() => {});
    }
  }

  const unread = announcements.filter((a) => !a.is_dismissed);
  const urgent = announcements.filter((a) => a.priority === "urgent" && !a.is_dismissed);

  // Determine visible list based on tab
  let visible;
  if (tab === "unread") visible = unread;
  else if (tab === "urgent") visible = urgent;
  else visible = announcements;

  const tabs = [
    { id: "all", label: t("notifAll"), count: announcements.length },
    { id: "unread", label: t("notifUnread"), count: unread.length },
    { id: "urgent", label: t("notifUrgent"), count: urgent.length },
  ];

  const emptyMessages = {
    all: { icon: "notifications_none", title: t("notifEmptyAllTitle"), sub: t("notifEmptyAllSub") },
    unread: { icon: "mark_email_read", title: t("notifEmptyUnreadTitle"), sub: t("notifEmptyUnreadSub") },
    urgent: { icon: "verified", title: t("notifEmptyUrgentTitle"), sub: t("notifEmptyUrgentSub") },
  };

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-5)" }}>
      {/* ── Header + Tab bar ──────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t("notifTitle")}</h1>
        {unread.length > 0 && tab !== "unread" && (
          <button
            type="button"
            onClick={async () => {
              const pending = unread.map(u => fetch(`${API_BASE}/announcements/${u.id}/dismiss/`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY } }).catch(()=>{}));
              setAnnouncements(prev => prev.map(a => ({ ...a, is_dismissed: true })));
              window.dispatchEvent(new CustomEvent("fleetmark:refresh"));
              await Promise.all(pending);
            }}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--blue)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("notifMarkRead")}
          </button>
        )}
      </div>

      <div className="tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-bar-item${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`tab-badge ${t.id === "urgent" ? "tab-badge-red" : "tab-badge-blue"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification list ─────────────────── */}
      {!visible.length ? (
        <div
          style={{
            padding: "var(--space-8) var(--space-4)",
            textAlign: "center",
            display: "grid",
            placeItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--surface2)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: "var(--dim)" }}>
              {emptyMessages[tab].icon}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{emptyMessages[tab].title}</h3>
          <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", maxWidth: 300 }}>
            {emptyMessages[tab].sub}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {visible.map((a) => {
            const isRead = a.is_dismissed;
            const prColor = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.info;
            const prIcon = PRIORITY_ICONS[a.priority] || "info";

            return (
              <div
                key={a.id}
                role={!isRead ? "button" : undefined}
                tabIndex={!isRead ? 0 : undefined}
                onClick={() => { if (!isRead) dismiss(a.id); }}
                onKeyDown={(e) => { if (!isRead && (e.key === "Enter" || e.key === " ")) dismiss(a.id); }}
                style={{
                  border: `1px solid ${isRead ? "var(--border)" : `color-mix(in srgb, ${prColor} 25%, var(--border))`}`,
                  borderLeft: isRead ? "1px solid var(--border)" : `4px solid ${prColor}`,
                  borderRadius: 14,
                  background: "var(--surface)",
                  padding: "16px 20px",
                  display: "grid",
                  gap: 8,
                  opacity: isRead ? 0.6 : 1,
                  cursor: isRead ? "default" : "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isRead ? "none" : "var(--shadow-sm)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
                    {!isRead && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: `color-mix(in srgb, ${prColor} 10%, transparent)`,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: prColor, fontVariationSettings: "'FILL' 1" }}>
                          {prIcon}
                        </span>
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: isRead ? "var(--mid)" : prColor,
                            padding: "2px 8px",
                            borderRadius: 4,
                            background: isRead ? "transparent" : `color-mix(in srgb, ${prColor} 10%, transparent)`,
                          }}
                        >
                          {a.priority}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--dim)" }}>
                          {timeAgo(a.created_at)}
                        </span>
                      </div>
                      <h4 style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 700 }}>{a.title}</h4>
                    </div>
                  </div>
                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismiss(a.id);
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "var(--mid)",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        flexShrink: 0,
                        padding: "4px 8px",
                        borderRadius: 6,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {t("notifDismiss")}
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "var(--mid)", lineHeight: 1.5 }}>{a.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
