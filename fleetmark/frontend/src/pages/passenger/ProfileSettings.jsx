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
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.totp_enabled || false);
  const [twoFASetup, setTwoFASetup] = useState(null); // { secret, provisioning_uri }
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMsg, setTwoFAMsg] = useState("");

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
          Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY,
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

  async function handleExportData() {
    setExporting(true);
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/me/export/`, {
        headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY },
      });
      if (!res.ok) throw new Error("Export failed.");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fleetmark-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export data.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/me/delete/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY },
      });
      if (!res.ok) throw new Error("Deletion failed.");
      signOut();
    } catch {
      setError("Failed to delete account.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function handleSetup2FA() {
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/2fa/setup/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "X-API-Key": import.meta.env.VITE_API_KEY },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Setup failed.");
      }
      const data = await res.json();
      setTwoFASetup(data);
    } catch (err) {
      setTwoFAMsg(err.message || "Failed to setup 2FA.");
    } finally {
      setTwoFALoading(false);
    }
  }

  async function handleVerify2FA() {
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/2fa/verify/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-Key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ code: twoFACode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid code.");
      }
      setTwoFAEnabled(true);
      setTwoFASetup(null);
      setTwoFACode("");
      setTwoFAMsg("2FA enabled successfully!");
      setTimeout(() => setTwoFAMsg(""), 3000);
    } catch (err) {
      setTwoFAMsg(err.message || "Verification failed.");
    } finally {
      setTwoFALoading(false);
    }
  }

  async function handleDisable2FA() {
    setTwoFALoading(true);
    setTwoFAMsg("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/2fa/disable/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-Key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ code: twoFACode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid code.");
      }
      setTwoFAEnabled(false);
      setTwoFACode("");
      setTwoFAMsg("2FA disabled.");
      setTimeout(() => setTwoFAMsg(""), 3000);
    } catch (err) {
      setTwoFAMsg(err.message || "Failed to disable 2FA.");
    } finally {
      setTwoFALoading(false);
    }
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
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Language</h3>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
          Choose your preferred interface language.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ id: "en", label: "English", flag: "🇬🇧" }, { id: "fr", label: "Français", flag: "🇫🇷" }, { id: "ar", label: "العربية", flag: "🇲🇦" }].map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                setLang(l.id);
                localStorage.setItem("fleetmark_lang", l.id);
                document.documentElement.setAttribute("data-lang", l.id);
              }}
              style={{
                flex: 1,
                border: lang === l.id ? "2px solid var(--blue)" : "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 8px",
                background: lang === l.id ? "var(--blue-light)" : "var(--surface2)",
                color: lang === l.id ? "var(--blue)" : "var(--text-primary)",
                fontWeight: lang === l.id ? 700 : 500,
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                transition: "all 0.15s ease",
              }}
            >
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      </section>


      {/* ── Two-Factor Authentication ──────────── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: twoFAEnabled ? "var(--green)" : "var(--amber)" }}>
            {twoFAEnabled ? "verified_user" : "security"}
          </span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Two-Factor Authentication</h3>
          {twoFAEnabled && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--green)",
                background: "color-mix(in srgb, var(--green) 10%, transparent)",
                border: "1px solid var(--green)",
                borderRadius: 999,
                padding: "2px 10px",
              }}
            >
              Enabled
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
          {twoFAEnabled
            ? "Your account is protected with TOTP two-factor authentication."
            : "Add an extra layer of security using a TOTP authenticator app."}
        </p>

        {/* Setup flow — show QR provisioning URI */}
        {twoFASetup && !twoFAEnabled && (
          <div
            style={{
              padding: "var(--space-4)",
              borderRadius: 12,
              background: "var(--surface2)",
              border: "1px solid var(--line2)",
              display: "grid",
              gap: "var(--space-3)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>
              Scan this with your authenticator app:
            </p>
            <div
              style={{
                padding: "var(--space-3)",
                borderRadius: 8,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontFamily: "monospace",
                fontSize: 12,
                wordBreak: "break-all",
                color: "var(--mid)",
              }}
            >
              {twoFASetup.secret}
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "var(--dim)" }}>
              Or enter this secret manually in your authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>
        )}

        {/* Code input for verify / disable */}
        {(twoFASetup || twoFAEnabled) && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit code"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              style={{
                width: 120,
                background: "var(--surface2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 16,
                fontFamily: "monospace",
                letterSpacing: "0.2em",
                textAlign: "center",
              }}
            />
            {twoFASetup && !twoFAEnabled && (
              <button
                type="button"
                onClick={handleVerify2FA}
                disabled={twoFALoading || twoFACode.length !== 6}
                style={{
                  border: "1px solid var(--green, #22c55e)",
                  borderRadius: 10,
                  padding: "10px 18px",
                  background: "color-mix(in srgb, var(--green) 10%, transparent)",
                  color: "var(--green)",
                  fontWeight: 700,
                  cursor: twoFACode.length === 6 ? "pointer" : "not-allowed",
                  fontSize: 14,
                  opacity: twoFACode.length !== 6 ? 0.5 : 1,
                }}
              >
                {twoFALoading ? "Verifying…" : "Enable 2FA"}
              </button>
            )}
            {twoFAEnabled && (
              <button
                type="button"
                onClick={handleDisable2FA}
                disabled={twoFALoading || twoFACode.length !== 6}
                style={{
                  border: "1px solid var(--red-border)",
                  borderRadius: 10,
                  padding: "10px 18px",
                  background: "var(--red-light)",
                  color: "var(--red)",
                  fontWeight: 700,
                  cursor: twoFACode.length === 6 ? "pointer" : "not-allowed",
                  fontSize: 14,
                  opacity: twoFACode.length !== 6 ? 0.5 : 1,
                }}
              >
                {twoFALoading ? "Disabling…" : "Disable 2FA"}
              </button>
            )}
          </div>
        )}

        {/* Setup button when not started */}
        {!twoFASetup && !twoFAEnabled && (
          <button
            type="button"
            onClick={handleSetup2FA}
            disabled={twoFALoading}
            style={{
              border: "1px solid var(--blue-border)",
              borderRadius: 10,
              padding: "10px 18px",
              background: "var(--blue-light)",
              color: "var(--blue)",
              fontWeight: 700,
              cursor: twoFALoading ? "wait" : "pointer",
              fontSize: 14,
              justifySelf: "start",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
            {twoFALoading ? "Setting up…" : "Setup 2FA"}
          </button>
        )}

        {twoFAMsg && (
          <span
            style={{
              fontSize: 12,
              color: twoFAMsg.includes("success") || twoFAMsg.includes("enabled") ? "var(--green)" : "var(--red)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>
              {twoFAMsg.includes("success") || twoFAMsg.includes("enabled") || twoFAMsg.includes("disabled") ? "check_circle" : "error"}
            </span>
            {twoFAMsg}
          </span>
        )}
      </section>

      {/* ── Your Data (GDPR) ───────────────────── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "var(--blue)" }}>shield</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Your Data</h3>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--mid)" }}>
          Export all your personal data or request account deletion under GDPR.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            style={{
              border: "1px solid var(--blue-border)",
              borderRadius: 10,
              padding: "10px 18px",
              background: "var(--blue-light)",
              color: "var(--blue)",
              fontWeight: 700,
              cursor: exporting ? "wait" : "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: exporting ? 0.6 : 1,
              transition: "all 0.15s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            {exporting ? "Exporting…" : "Export My Data"}
          </button>
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                border: "1px solid var(--red-border)",
                borderRadius: 10,
                padding: "10px 18px",
                background: "var(--red-light)",
                color: "var(--red)",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "all 0.15s ease",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_forever</span>
              Delete My Account
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "8px 14px",
                border: "1px solid var(--red-border)",
                borderRadius: 10,
                background: "var(--red-light)",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600 }}>Are you sure?</span>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  border: "none",
                  borderRadius: 8,
                  padding: "6px 14px",
                  background: "var(--red)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: deleting ? "wait" : "pointer",
                  fontSize: 12,
                }}
              >
                {deleting ? "Deleting…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--mid)",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>

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
