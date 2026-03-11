// @ts-nocheck
import { useState } from 'react';
import { useReservation } from '../../context/ReservationContext';
import { useToast } from '../../context/ToastContext';

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  faint: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  amber: 'var(--fm-amber)',
  amberBg: 'var(--fm-amber-bg)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
} as const;

const MyReservations = () => {
  const { toast } = useToast();
  const {
    tonightReservations,
    cancelReservation,
    pastReservations,
    transport,
  } = useReservation();
  const [cancelId, setCancelId] = useState<string | null>(null);

  const handleCancelConfirm = () => {
    if (!cancelId) return;
    cancelReservation(cancelId);
    toast('Reservation cancelled.', 'warning');
    setCancelId(null);
  };

  // Build flat list: tonight's active + past
  const allRows: Array<{
    id: string;
    date: string;
    route: string;
    stop: string;
    time: string;
    status: 'Confirmed' | 'Cancelled';
    canCancel: boolean;
  }> = [];

  // Tonight's active first
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  for (const res of tonightReservations) {
    allRows.push({
      id: res.id,
      date: 'Tonight',
      route: res.busAssignment,
      stop: res.homeStop,
      time: res.slotLabel,
      status: res.status,
      canCancel: res.status === 'Confirmed',
    });
  }

  // Past nights
  for (const night of pastReservations) {
    for (const res of night.reservations) {
      allRows.push({
        id: res.id,
        date: night.date,
        route: res.busAssignment,
        stop: res.homeStop,
        time: res.slotLabel,
        status: res.status,
        canCancel: false,
      });
    }
  }

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: 10,
    fontWeight: 700,
    color: V.dim,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    textAlign: 'left',
    borderBottom: `1px solid ${V.line}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: 13,
    color: V.ink,
    borderBottom: `1px solid ${V.line}`,
  };

  return (
    <div>
      {/* Table */}
      <div style={{
        background: V.white,
        border: `1px solid ${V.line}`,
        borderRadius: 12,
        overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
      }}>
        {allRows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>No reservations yet</div>
            <div style={{ fontSize: 12, color: V.dim, marginTop: 4 }}>Reserve a seat and your history will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Geist', sans-serif" }}>
              <thead>
                <tr style={{ background: V.bg }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Route</th>
                  <th style={thStyle}>Stop</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}></th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((row) => (
                  <tr key={row.id} style={{ transition: 'background 0.1s' }}>
                    <td style={{ ...tdStyle, fontWeight: 600, fontSize: 12 }}>{row.date}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{row.route}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{row.stop}</td>
                    <td style={{ ...tdStyle, fontFamily: 'var(--fm-mono)', fontSize: 12, fontWeight: 600 }}>{row.time}</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 100,
                        fontSize: 10,
                        fontWeight: 700,
                        background: row.status === 'Confirmed' ? V.greenBg : V.redBg,
                        color: row.status === 'Confirmed' ? V.green : V.red,
                        border: `1px solid ${row.status === 'Confirmed' ? V.greenBdr : V.redBdr}`,
                      }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      {row.canCancel && (
                        <button
                          onClick={() => setCancelId(row.id)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            border: `1px solid #FECACA`,
                            background: V.white,
                            fontSize: 11,
                            fontWeight: 600,
                            color: V.red,
                            cursor: 'pointer',
                            fontFamily: "'Geist', sans-serif",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {cancelId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            width: '100%', maxWidth: 360,
            background: V.white,
            borderRadius: 14,
            boxShadow: 'var(--fm-shadow-lg)',
            padding: 24,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: V.ink, marginBottom: 8 }}>
              Cancel this reservation?
            </div>
            <div style={{ fontSize: 12, color: V.mid, marginBottom: 20 }}>
              The slot will be freed up for other students.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setCancelId(null)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  border: `1px solid ${V.line}`, background: V.white,
                  fontSize: 13, fontWeight: 500, color: V.mid,
                  cursor: 'pointer', fontFamily: "'Geist', sans-serif",
                }}
              >
                Keep It
              </button>
              <button
                onClick={handleCancelConfirm}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8,
                  border: 'none', background: V.red,
                  fontSize: 13, fontWeight: 600, color: '#FFFFFF',
                  cursor: 'pointer', fontFamily: "'Geist', sans-serif",
                }}
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;
