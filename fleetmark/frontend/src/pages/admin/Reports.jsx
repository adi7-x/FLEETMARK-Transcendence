import React, { useEffect, useMemo, useState } from "react";
import useCountUp from "../../hooks/useCountUp";
import AdminEmptyState from "../../components/ui/AdminEmptyState";
import { API_BASE } from "../../services/api";

function ReportStatCard({ label, value }) {
  const display = useCountUp(value);
  return (
    <article style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)" }}>
      <p style={{ margin: 0, color: "var(--mid)", fontSize: 13 }}>{label}</p>
      <h3 className="mono" style={{ margin: "var(--space-2) 0 0", fontSize: 30 }}>{display}</h3>
    </article>
  );
}

function ReportsSkeleton() {
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "var(--space-4)" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)", display: "grid", gap: 8 }}>
            <div className="skeleton" style={{ height: 12, width: "50%", borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 28, width: "40%", borderRadius: 4 }} />
          </div>
        ))}
      </div>
      <div style={{ border: "1px solid var(--line2)", borderRadius: "var(--radius-md)", background: "var(--surface)", padding: "var(--space-5)", display: "grid", gap: 12 }}>
        <div className="skeleton" style={{ height: 16, width: 160, borderRadius: 4 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", alignItems: "center", gap: "var(--space-3)" }}>
            <div className="skeleton" style={{ height: 12, width: "70%", borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 10, width: "100%", borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 12, width: 24, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}


export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("fleetmark_access");
      const res = await fetch(`${API_BASE}/reports/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load reports.");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onRefresh = () => loadReports();
    window.addEventListener("fleetmark:refresh", onRefresh);
    return () => window.removeEventListener("fleetmark:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const byCat = {};
    reports.forEach((item) => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(byCat));
    return { byCat, max };
  }, [reports]);

  if (loading) return <ReportsSkeleton />;

  const totalReports = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  return (
    <div className="animate-in" style={{ display: "grid", gap: "var(--space-5)" }}>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "var(--space-4)" }}>
        <ReportStatCard label="Total reports" value={totalReports} />
        <ReportStatCard label="Pending" value={pending} />
        <ReportStatCard label="Resolved" value={resolved} />
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
            <AdminEmptyState variant="reports" />
          )}
        </div>
      </section>
    </div>
  );
}
