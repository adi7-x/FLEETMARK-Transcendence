import React from "react";

/**
 * SkeletonTable — loading placeholder that mirrors a table layout.
 *
 * cols: number of columns
 * rows: number of data rows to simulate
 */
export default function SkeletonTable({ cols = 4, rows = 5, style }) {
  const widths = ["55%", "80%", "40%", "65%", "30%", "90%"];

  return (
    <div className="data-table-wrap" style={style}>
      <table className="data-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th scope="col" key={i}>
                <div
                  className="skeleton"
                  style={{ height: 10, width: widths[i % widths.length], borderRadius: 4 }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div
                    className="skeleton"
                    style={{
                      height: 12,
                      width: widths[(r + c) % widths.length],
                      borderRadius: 4,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
