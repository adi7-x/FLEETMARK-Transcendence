import React, { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import StudentLayout from "./components/layout/StudentLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Landing from "./pages/Landing";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/student/Onboarding";
import PassengerOverview from "./pages/passenger/PassengerOverview";
import ReserveASeat from "./pages/passenger/ReserveASeat";
import MyReservations from "./pages/passenger/MyReservations";
import ProfileSettings from "./pages/passenger/ProfileSettings";
import AdminOverview from "./pages/admin/Overview";
import AdminTrips from "./pages/admin/Trips";
import BusManagement from "./pages/admin/BusManagement";
import AdminRoutesPage from "./pages/admin/Routes";
import Drivers from "./pages/admin/Drivers";
import AdminReservations from "./pages/admin/Reservations";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import ComingSoon from "./pages/driver/ComingSoon";
import NotFound from "./pages/NotFound";

function StudentShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = localStorage.getItem("fleetmark_lang") || "en";

  return (
    <StudentLayout
      user={user}
      activePath={location.pathname}
      onNavigate={navigate}
      onLogout={() => {
        logout();
        navigate("/");
      }}
      pageTitle="Student Dashboard"
      language={lang}
      onLanguageChange={(next) => {
        localStorage.setItem("fleetmark_lang", next);
        document.documentElement.setAttribute("data-lang", next);
      }}
    >
      {children}
    </StudentLayout>
  );
}

function adminTitleForPath(pathname) {
  if (pathname === "/admin") return "Dashboard";
  if (pathname === "/admin/trips") return "Trips Management";
  if (pathname === "/admin/buses") return "Bus Management";
  if (pathname === "/admin/routes") return "Routes";
  if (pathname === "/admin/drivers") return "Drivers";
  if (pathname === "/admin/reservations") return "History";
  if (pathname === "/admin/reports") return "Reports";
  if (pathname === "/admin/settings") return "Settings";
  return "Admin";
}

function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const lang = localStorage.getItem("fleetmark_lang") || "en";
  const pageTitle = useMemo(() => adminTitleForPath(location.pathname), [location.pathname]);

  function handleNewTrip() {
    if (location.pathname === "/admin/trips") {
      window.dispatchEvent(new CustomEvent("fleetmark:new-trip"));
    } else {
      navigate("/admin/trips", { state: { openTripForm: true } });
    }
  }

  return (
    <AdminLayout
      user={user}
      activePath={location.pathname}
      onNavigate={navigate}
      onNewTrip={handleNewTrip}
      pageTitle={pageTitle}
      onLogout={() => {
        logout();
        navigate("/");
      }}
      language={lang}
      onLanguageChange={(next) => {
        localStorage.setItem("fleetmark_lang", next);
        document.documentElement.setAttribute("data-lang", next);
      }}
    >
      {children}
    </AdminLayout>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute role="STUDENT" user={user}>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/passenger"
        element={
          <ProtectedRoute role="STUDENT" user={user}>
            <StudentShell>
              <PassengerOverview />
            </StudentShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/reserve"
        element={
          <ProtectedRoute role="STUDENT" user={user}>
            <StudentShell>
              <ReserveASeat />
            </StudentShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/history"
        element={
          <ProtectedRoute role="STUDENT" user={user}>
            <StudentShell>
              <MyReservations />
            </StudentShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/passenger/settings"
        element={
          <ProtectedRoute role="STUDENT" user={user}>
            <StudentShell>
              <ProfileSettings />
            </StudentShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <AdminOverview />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trips"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <AdminTrips />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/buses"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <BusManagement />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/routes"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <AdminRoutesPage />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <Drivers />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <AdminReservations />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <Reports />
            </AdminShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="LOGISTICS_STAFF" user={user}>
            <AdminShell>
              <AdminSettings />
            </AdminShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/driver"
        element={
          <ProtectedRoute role="DRIVER" user={user}>
            <ComingSoon />
          </ProtectedRoute>
        }
      />

      <Route path="/passenger/notifications" element={<Navigate to="/passenger" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
