import React, { useEffect } from "react";
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
  useEffect(() => {
    let active = true;

    async function run() {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const hashAccess = hashParams.get("access");
        const hashRefresh = hashParams.get("refresh");
        const hashRole = hashParams.get("role");
        const hashLogin = hashParams.get("login");

        if (hashAccess && hashRefresh) {
          const meRes = await fetch(`${API_BASE}/auth/me/`, {
            headers: { Authorization: `Bearer ${hashAccess}` },
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

        if (!access || !refresh || !user) throw new Error("Incomplete callback payload.");

        localStorage.setItem("fleetmark_access", access);
        localStorage.setItem("fleetmark_refresh", refresh);
        localStorage.setItem("fleetmark_user", JSON.stringify(user));

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

  return <Spinner size={42} text="Finalizing 42 authentication..." />;
}
