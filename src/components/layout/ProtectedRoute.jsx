import React from "react";

function roleHome(role) {
  if (role === "LOGISTICS_STAFF") return "/admin";
  if (role === "DRIVER") return "/driver";
  return "/passenger";
}

export default function ProtectedRoute({ role, user, children }) {
  if (!user) {
    window.location.replace("/");
    return null;
  }

  if (role && user.role !== role) {
    window.location.replace(roleHome(user.role));
    return null;
  }

  return children;
}
