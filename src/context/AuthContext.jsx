import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("fleetmark_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser());

  const value = useMemo(
    () => ({
      user,
      setUser: (nextUser) => {
        setUser(nextUser);
        if (nextUser) localStorage.setItem("fleetmark_user", JSON.stringify(nextUser));
        else localStorage.removeItem("fleetmark_user");
      },
      logout: () => {
        localStorage.removeItem("fleetmark_access");
        localStorage.removeItem("fleetmark_refresh");
        localStorage.removeItem("fleetmark_user");
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
