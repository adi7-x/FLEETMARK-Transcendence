import React, { useMemo, useState, useEffect } from "react";
import StopPicker from "../../components/shared/StopPicker";

import { API_BASE, getUser } from "../../services/api";

const PROFILE_KEY = "fleetmark_student_profile";

function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; }
}
function saveProfile(data) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

function getInitials(login) {
  if (!login) return "?";
  return login.slice(0, 2).toUpperCase();
}

export default function ProfileSettings() {
  const user = useMemo(() => getUser(), []);
  const [selected, setSelected] = useState(user?.station || "");
  const [lang, setLang] = useState(localStorage.getItem("fleetmark_lang") || "en");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [nickname, setNickname] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    const profile = getProfile();
    if (profile.nickname) setNickname(profile.nickname);
  }, []);

  async function saveStation() {
    setError("");
    setSaved(false);
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/me/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ station: selected }),
      });
      if (!res.ok) throw new Error("Failed to update station.");
      const updated = await res.json();
      localStorage.setItem("fleetmark_user", JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err.message || "Update failed.");
    }
  }

  function handleSaveProfile() {
    const profile = getProfile();
    profile.nickname = nickname.trim();
    saveProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1800);
  }

  function signOut() {
    localStorage.removeItem("fleetmark_access");
    localStorage.removeItem("fleetmark_refresh");
    localStorage.removeItem("fleetmark_user");
    window.location.replace("/");
  }

  const login = user?.login_42 || "student";

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-5)", maxWidth: 640 }}>
      {/* ── Avatar + identity card ─────────────── */}
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--surface)",
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--blue), var(--blue2, var(--blue)))",
            display: "grid",
            placeItems: "center",
            margin: "0 auto",
            boxShadow: "0 4px 20px var(--accent-glow, rgba(99,102,241,0.2))",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>
            {getInitials(login)}
          </span>
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
            {nickname || login}
          </h2>
          <p className="mono" style={{ margin: "4px 0 0", color: "var(--mid)", fontSize: 13 }}>
            @{login}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--space-5)",
            padding: "12px 0 4px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Role</span>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 10px",
                  borderRadius: 999,
                  background: "var(--blue-light)",
                  color: "var(--blue)",
                  fontSize: 12,
                  fontWeight: 700,
                  border: "1px solid var(--blue-border)",
                }}
              >
                {user?.role || "Student"}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>ID</span>
            <div className="mono" style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: "var(--mid)" }}>
              #{user?.id ? String(user.id).slice(0, 8) : "—"}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", color: "var(--dim)", fontWeight: 700 }}>Email</span>
            <div style={{ fontSize: 12, fontWeight: 500, marginTop: 4, color: "var(--mid)" }}>
              {user?.email || "N/A"}
            </div>
          </div>
        </div>
      </section>

      {/* ── Nickname ───────────────────────────── */}
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--surface)",
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-3)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nickname</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
          Set a display name. This is saved locally on your device.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={login}
            maxLength={30}
            style={{
              flex: 1,
              background: "var(--surface2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              transition: "border-color 0.15s ease",
            }}
          />
          <button
            type="button"
            onClick={handleSaveProfile}
            style={{
              border: "1px solid var(--blue-border)",
              borderRadius: 10,
              padding: "10px 18px",
              background: "var(--blue-light)",
              color: "var(--blue)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            Save
          </button>
        </div>
        {profileSaved && (
          <span style={{ fontSize: 12, color: "var(--green)", display: "flex", alignItems: "center", gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Saved
          </span>
        )}
      </section>

      {/* ── Home station ───────────────────────── */}
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "var(--surface)",
          padding: "var(--space-6)",
          display: "grid",
          gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Home Station</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
          Select your primary departure campus.
        </p>
        <StopPicker selected={selected} onSelect={setSelected} />
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <button
            type="button"
            onClick={saveStation}
            style={{
              border: "1px solid var(--blue-border)",
              borderRadius: 10,
              padding: "10px 18px",
              background: "var(--blue-light)",
              color: "var(--blue)",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              transition: "all 0.15s ease",
            }}
          >
            Save Station
          </button>
          {saved ? (
            <span style={{ color: "var(--green)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Saved
            </span>
          ) : null}
          {error ? <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span> : null}
        </div>
      </section>

      {/* ── Language ────────────────────────────── */}


      {/* ── Sign out ───────────────────────────── */}
      <section
        style={{
          border: "1px solid var(--red-border)",
          borderRadius: 16,
          background: "var(--red-light)",
          padding: "var(--space-5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--red)" }}>Sign Out</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--mid)" }}>
            This will clear your session.
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          style={{
            border: "1px solid var(--red-border)",
            borderRadius: 10,
            padding: "10px 18px",
            background: "var(--red-light)",
            color: "var(--red)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 14,
            transition: "all 0.15s ease",
          }}
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}
