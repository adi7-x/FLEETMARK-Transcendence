import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  en: {
    navDashboard: "Dashboard",
    navTrips: "Trips",
    navBuses: "Buses",
    navStations: "Stations",
    navRoutes: "Routes",
    navAnnouncements: "Announcements",
    navDrivers: "Drivers",
    navHistory: "History",
    navReports: "Reports",
    navSettings: "Settings",
    navLiveMap: "Live Map",
    navBookings: "Bookings",
    navReserve: "Reserve Seat",
    navLogout: "Log Out",
    navNewTrip: "New Trip",
    navNewBooking: "New Booking",
    navTracker: "Track Bus",
    navProfile: "Profile",
    navNotifications: "Notifications"
  },
  fr: {
    navDashboard: "Tableau de bord",
    navTrips: "Trajets",
    navBuses: "Bus",
    navStations: "Stations",
    navRoutes: "Itinéraires",
    navAnnouncements: "Annonces",
    navDrivers: "Chauffeurs",
    navHistory: "Historique",
    navReports: "Rapports",
    navSettings: "Paramètres",
    navLiveMap: "Carte en direct",
    navBookings: "Réservations",
    navReserve: "Réserver",
    navLogout: "Déconnexion",
    navNewTrip: "Nouveau Trajet",
    navNewBooking: "Nouvelle Réservation",
    navTracker: "Suivre le bus",
    navProfile: "Profil",
    navNotifications: "Notifications"
  },
  ar: {
    navDashboard: "لوحة القيادة",
    navTrips: "الرحلات",
    navBuses: "الحافلات",
    navStations: "المحطات",
    navRoutes: "الخطوط",
    navAnnouncements: "الإعلانات",
    navDrivers: "السائقين",
    navHistory: "السجل",
    navReports: "التقارير",
    navSettings: "الإعدادات",
    navLiveMap: "الخريطة المباشرة",
    navBookings: "الحجوزات",
    navReserve: "حجز مقعد",
    navLogout: "تسجيل الخروج",
    navNewTrip: "رحلة جديدة",
    navNewBooking: "حجز جديد",
    navTracker: "تتبع الحافلة",
    navProfile: "الملف الشخصي",
    navNotifications: "الإشعارات"
  }
};

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("fleetmark_lang") || "en");

  useEffect(() => {
    localStorage.setItem("fleetmark_lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return (
    <TranslationContext.Provider value={{ lang, setLang, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
