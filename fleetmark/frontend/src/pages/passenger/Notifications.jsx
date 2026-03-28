import React, { useEffect, useState } from "react";

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
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [tab, setTab] = useState("all");

  function load() {
    try {
      setAnnouncements(JSON.parse(localStorage.getItem("fleetmark_announcements") || "[]"));
      setDismissed(JSON.parse(localStorage.getItem("fleetmark_dismissed_announcements") || "[]"));
    } catch { /* ignore */ }
  }

  useEffect(() => {
    load();
    window.addEventListener("fleetmark:refresh", load);
    return () => window.removeEventListener("fleetmark:refresh", load);
  }, []);

  function dismiss(id) {
    const updated = [...dismissed, id];
    setDismissed(updated);
    localStorage.setItem("fleetmark_dismissed_announcements", JSON.stringify(updated));
    // Dispatch refresh so bell badge updates
    window.dispatchEvent(new CustomEvent("fleetmark:refresh"));
  }

  const unread = announcements.filter((a) => !dismissed.includes(a.id));
  const urgent = announcements.filter((a) => a.priority === "urgent" && !dismissed.includes(a.id));

  // Determine visible list based on tab
  let visible;
  if (tab === "unread") visible = unread;
  else if (tab === "urgent") visible = urgent;
  else visible = announcements;

  const tabs = [
    { id: "all", label: "All", count: announcements.length },
    { id: "unread", label: "Unread", count: unread.length },
    { id: "urgent", label: "Urgent", count: urgent.length },
  ];

  const emptyMessages = {
    all: { icon: "notifications_none", title: "No notifications", sub: "You're all caught up. Announcements from the logistics team will appear here." },
    unread: { icon: "mark_email_read", title: "Inbox zero! 🌟", sub: "You've read everything. Nice job staying on top of things." },
    urgent: { icon: "verified", title: "No urgent alerts 🎉", sub: "There are no urgent announcements right now. Relax!" },
  };

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-5)" }}>
      {/* ── Header + Tab bar ──────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Notifications</h1>
        {unread.length > 0 && tab !== "unread" && (
          <button
            type="button"
            onClick={() => {
              unread.forEach((a) => dismiss(a.id));
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
            Mark all as read
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
            const isRead = dismissed.includes(a.id);
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
                      Dismiss
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
