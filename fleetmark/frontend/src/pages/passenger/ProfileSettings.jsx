import React, { useMemo, useState } from "react";
import StopPicker from "../../components/shared/StopPicker";
import LanguageSwitcher from "../../components/shared/LanguageSwitcher";
import { API_BASE, getUser } from "../../services/api";



export default function ProfileSettings() {
  const user = useMemo(() => getUser(), []);
  const [selected, setSelected] = useState(user?.station || "");
  const [lang, setLang] = useState(localStorage.getItem("fleetmark_lang") || "en");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

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

  function signOut() {
    localStorage.removeItem("fleetmark_access");
    localStorage.removeItem("fleetmark_refresh");
    localStorage.removeItem("fleetmark_user");
    window.location.replace("/");
  }

  return (
    <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: 900 }}>
      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-6)" }}>
        <h2 style={{ margin: 0 }}>Account</h2>
        <p className="mono" style={{ color: "var(--mid)" }}>Login: {user?.login_42 || "unknown"}</p>
        <p style={{ color: "var(--mid)" }}>Role: {user?.role || "unknown"}</p>
        <p style={{ color: "var(--mid)" }}>Email: {user?.email || "not available"}</p>
      </section>

      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
        <h2 style={{ margin: 0 }}>Home station</h2>
        <StopPicker selected={selected} onSelect={setSelected} />
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <button type="button" onClick={saveStation} style={{ border: "1px solid var(--blue-bdr)", borderRadius: "var(--radius-sm)", padding: "9px 14px", background: "var(--blue-bg)", color: "var(--blue)", fontWeight: 700, cursor: "pointer" }}>
            Save station
          </button>
          {saved ? <span style={{ color: "var(--green)" }}>Saved</span> : null}
          {error ? <span style={{ color: "var(--red)" }}>{error}</span> : null}
        </div>
      </section>

      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
        <h2 style={{ margin: 0 }}>Language</h2>
        <LanguageSwitcher
          variant="full"
          value={lang}
          onChange={(value) => {
            setLang(value);
            localStorage.setItem("fleetmark_lang", value);
            document.documentElement.setAttribute("data-lang", value);
          }}
        />
      </section>

      <section style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", borderRadius: "var(--radius-md)", background: "var(--red-bg)", padding: "var(--space-6)" }}>
        <button type="button" onClick={signOut} style={{ border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)", borderRadius: "var(--radius-sm)", padding: "9px 14px", background: "var(--red-bg)", color: "var(--red)", cursor: "pointer", fontWeight: 700 }}>
          Sign out
        </button>
      </section>
    </div>
  );
}
