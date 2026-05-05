import React, { useEffect, useState } from "react";
import Spinner from "../components/ui/Spinner";
import { auth as apiAuth } from "../services/api";
import { API_BASE } from "../services/api";


function redirectByRole(user) {
  if (!user) {
    window.location.replace("/?error=auth_failed");
    return;
  }

  if (user.role === "LOGISTICS_STAFF") {
    window.location.replace("/admin");
    return;
  }

  if (user.role === "DRIVER") {
    window.location.replace("/driver");
    return;
  }

  if (user.role === "STUDENT") {
    if (!user.station) window.location.replace("/onboarding");
    else window.location.replace("/passenger");
    return;
  }

  window.location.replace("/?error=auth_failed");
}

export default function AuthCallback() {
  const [totpRequired, setTotpRequired] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  async function verifyTotpAndContinue() {
    setTotpLoading(true);
    setTotpError("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/auth/2fa/verify/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-API-Key": import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify({ code: totpCode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Invalid code.");
      }
      redirectByRole(pendingUser);
    } catch (err) {
      setTotpError(err.message || "Verification failed.");
    } finally {
      setTotpLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const hashAccess = hashParams.get("access");
        const hashRefresh = hashParams.get("refresh");
        const hashRole = hashParams.get("role");
        const hashLogin = hashParams.get("login");
        const hashTotp = hashParams.get("totp");

        if (hashAccess && hashRefresh) {
          const meRes = await fetch(`${API_BASE}/auth/me/`, {
            headers: { Authorization: `Bearer ${hashAccess}`, "X-API-Key": import.meta.env.VITE_API_KEY },
          });
          if (!meRes.ok) throw new Error("Failed to fetch user profile.");
          const user = await meRes.json();

          localStorage.setItem("fleetmark_access", hashAccess);
          localStorage.setItem("fleetmark_refresh", hashRefresh);
          localStorage.setItem(
            "fleetmark_user",
            JSON.stringify({
              ...user,
              role: user.role || hashRole || "STUDENT",
              login_42: user.login_42 || hashLogin || "",
            })
          );

          window.history.replaceState({}, "", "/auth/callback");

          // Check if 2FA verification is required
          if (hashTotp === "1" && active) {
            setPendingUser(user);
            setTotpRequired(true);
            return;
          }

          if (active) redirectByRole(user);
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) throw new Error("Missing OAuth code.");

        const data = await apiAuth.handleCallback(code);
        const access = data?.access;
        const refresh = data?.refresh;
        const user = data?.user;
        const totp = data?.totp_required;

        if (!access || !refresh || !user) throw new Error("Incomplete callback payload.");

        localStorage.setItem("fleetmark_access", access);
        localStorage.setItem("fleetmark_refresh", refresh);
        localStorage.setItem("fleetmark_user", JSON.stringify(user));

        if (totp && active) {
          setPendingUser(user);
          setTotpRequired(true);
          return;
        }

        if (active) redirectByRole(user);
      } catch (err) {
        console.error("[AuthCallback] Auth failed:", err?.message || err);
        if (active) window.location.replace("/?error=auth_failed");
      }
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  if (totpRequired) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "var(--bg)",
          padding: "var(--space-6)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "var(--space-8)",
            textAlign: "center",
            display: "grid",
            gap: "var(--space-4)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 48, color: "var(--blue)", justifySelf: "center" }}
          >
            security
          </span>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            Two-Factor Authentication
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "var(--mid)" }}>
            Enter the 6-digit code from your authenticator app.
          </p>
          <input
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && totpCode.length === 6) verifyTotpAndContinue();
            }}
            style={{
              width: "100%",
              background: "var(--surface2)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "14px",
              fontSize: 24,
              fontFamily: "monospace",
              letterSpacing: "0.3em",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />
          {totpError && (
            <span style={{ fontSize: 13, color: "var(--red)", display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>error</span>
              {totpError}
            </span>
          )}
          <button
            type="button"
            onClick={verifyTotpAndContinue}
            disabled={totpLoading || totpCode.length !== 6}
            style={{
              border: "none",
              borderRadius: 12,
              padding: "14px",
              background: totpCode.length === 6 ? "var(--blue)" : "var(--surface2)",
              color: totpCode.length === 6 ? "#fff" : "var(--dim)",
              fontWeight: 700,
              fontSize: 15,
              cursor: totpCode.length === 6 ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            {totpLoading ? "Verifying…" : "Verify & Continue"}
          </button>
        </div>
      </div>
    );
  }

  return <Spinner size={42} text="Finalizing 42 authentication..." />;
}
