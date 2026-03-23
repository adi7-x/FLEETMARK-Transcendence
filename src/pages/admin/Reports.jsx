import React, { useEffect, useMemo, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import { API_BASE } from "../../services/api";


export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const token = localStorage.getItem("fleetmark_access");
        const res = await fetch(`${API_BASE}/reports/`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to load reports.");
        const data = await res.json();
        if (active) setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Unable to load reports.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const byCat = {};
    reports.forEach((item) => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(byCat));
    return { byCat, max };
  }, [reports]);

  if (loading) return <Spinner text="Loading reports..." />;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "var(--space-4)" }}>
        {[
          ["Total reports", reports.length],
          ["Pending", reports.filter((r) => r.status === "pending").length],
          ["Resolved", reports.filter((r) => r.status === "resolved").length],
        ].map(([label, value]) => (
          <article key={label} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
            <p style={{ margin: 0, color: "var(--mid)", fontSize: 13 }}>{label}</p>
            <h3 className="mono" style={{ margin: "var(--space-2) 0 0", fontSize: 30 }}>{value}</h3>
          </article>
        ))}
      </section>

      <section style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
        <h2 style={{ marginTop: 0 }}>Incident categories</h2>
        {error ? <p style={{ color: "var(--red)" }}>{error}</p> : null}
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {Object.keys(stats.byCat).length ? (
            Object.entries(stats.byCat).map(([cat, count]) => (
              <div key={cat} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", alignItems: "center", gap: "var(--space-3)" }}>
                <span style={{ color: "var(--mid)", textTransform: "capitalize" }}>{cat}</span>
                <div style={{ width: "100%", height: 10, borderRadius: 999, background: "var(--surface2)", overflow: "hidden" }}>
                  <div style={{ width: `${(count / stats.max) * 100}%`, height: "100%", background: "var(--blue)" }} />
                </div>
                <strong>{count}</strong>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--mid)" }}>No data available.</p>
          )}
        </div>
      </section>
    </div>
  );
}
