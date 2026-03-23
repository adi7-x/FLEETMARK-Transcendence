import React, { useState } from "react";
import Toggle from "../../components/ui/Toggle";

export default function Settings() {
  const [flags, setFlags] = useState({
    notifyTrips: true,
    allowSelfService: false,
    maintenanceMode: false,
  });

  function setFlag(key) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const rows = [
    { key: "notifyTrips", label: "Trip notifications", help: "Enable outbound notifications for trip updates." },
    { key: "allowSelfService", label: "Student self-service changes", help: "Allow station changes from student profile settings." },
    { key: "maintenanceMode", label: "Maintenance mode", help: "Display maintenance notice across admin screens." },
  ];

  return (
    <div style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-6)", display: "grid", gap: "var(--space-4)" }}>
      <h1 style={{ margin: 0 }}>Admin Settings</h1>
      {rows.map((row) => (
        <div key={row.key} style={{ borderTop: "1px solid var(--line2)", paddingTop: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--space-4)" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{row.label}</h3>
            <p style={{ margin: "var(--space-2) 0 0", color: "var(--mid)", fontSize: 14 }}>{row.help}</p>
          </div>
          <Toggle checked={flags[row.key]} onChange={() => setFlag(row.key)} />
        </div>
      ))}
    </div>
  );
}
