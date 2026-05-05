import React from "react";
import { Navigate } from "react-router-dom";

function roleHome(role) {
  if (role === "LOGISTICS_STAFF") return "/admin";
  if (role === "DRIVER") return "/driver";
  return "/passenger";
}

export default function ProtectedRoute({ role, user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  return children;
}
