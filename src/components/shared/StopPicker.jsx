import React, { useEffect, useState } from "react";
import { stations } from "../../services/api";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

export default function StopPicker({ onSelect, selected }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStops() {
      setLoading(true);
      setError("");
      try {
        const data = await stations.list();
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load stations.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStops();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner size={28} text="Loading stations..." />;

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Stations unavailable"
        subtitle={error}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        icon="📍"
        title="No stations found"
        subtitle="Ask logistics staff to create at least one station."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
      {items.map((station) => {
        const isActive = selected === station.id;
        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelect && onSelect(station.id)}
            style={{
              borderRadius: "999px",
              border: `1px solid ${isActive ? "var(--blue)" : "var(--line)"}`,
              background: isActive ? "var(--blue-bg)" : "var(--surface2)",
              color: isActive ? "var(--blue)" : "var(--ink)",
              padding: "8px 14px",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            {station.name}
          </button>
        );
      })}
    </div>
  );
}
