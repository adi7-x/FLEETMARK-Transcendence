import React from "react";

/**
 * DataTable — consistent table layout used everywhere.
 *
 * Wraps a <table> with .data-table-wrap and .data-table CSS
 * classes. Just pass <thead> and <tbody> as children.
 *
 * Usage:
 *   <DataTable>
 *     <thead><tr><th>Name</th></tr></thead>
 *     <tbody><tr><td>Value</td></tr></tbody>
 *   </DataTable>
 */
export default function DataTable({ children, className = "", style }) {
  return (
    <div className={`data-table-wrap ${className}`} style={style}>
      <table className="data-table">{children}</table>
    </div>
  );
}
