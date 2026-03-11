import { useState } from 'react';
import { getStoredUser, patchMe } from '../../services/api';
import StopPicker from '../../components/shared/StopPicker';

const V = {
  ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  surface: 'var(--fm-surface)', line: 'var(--fm-line)',
  blue: 'var(--fm-blue)', mono: 'var(--fm-mono)',
} as const;

export default function Settings() {
  const user = getStoredUser();
  const [station, setStation] = useState(user?.station ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!station) return;
    setSaving(true);
    try {
      const updated = await patchMe({ station });
      localStorage.setItem('fleetmark_user', JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: V.ink, marginBottom: 24 }}>Settings</h2>

      {/* Profile card */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 4 }}>Account</div>
        <div style={{ fontSize: 12, color: V.dim, fontFamily: V.mono }}>
          {user?.login_42 ?? '—'}
        </div>
        <div style={{ fontSize: 11, color: V.dim, marginTop: 2 }}>
          {user?.email ?? '—'}
        </div>
      </div>

      {/* Station picker */}
      <div style={{
        padding: 20, background: V.surface, borderRadius: 12,
        border: `1px solid ${V.line}`,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 12 }}>
          My Stop
        </div>
        <StopPicker value={station} onChange={setStation} />

        <button
          onClick={handleSave}
          disabled={saving || !station}
          style={{
            marginTop: 16, width: '100%',
            padding: '10px 0', borderRadius: 8,
            border: 'none', cursor: saving ? 'wait' : 'pointer',
            background: V.blue, color: '#fff',
            fontSize: 13, fontWeight: 600,
            opacity: saving || !station ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}
