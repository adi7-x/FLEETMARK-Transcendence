// @ts-nocheck
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const V = {
  bg: 'var(--fm-bg)', white: 'var(--fm-surface)', ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  faint: 'var(--fm-dim)', line: 'var(--fm-line)', blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)', blueBdr: 'var(--fm-blue-bdr)',
};

const FEATURES = ['QR check-in', 'Badge scanning', 'Passenger list', 'Route & stops', 'Admin alerts', 'Trip summary'];

const DriverOverview = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: V.bg, fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', background: V.white, borderBottom: `1px solid ${V.line}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: V.ink }}>{t('dashboard.nav.appName', 'Fleetmark')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: V.mid }}>{user?.username || 'Driver'}</span>
          <button onClick={logout} style={{
            padding: '4px 12px', borderRadius: 6, border: `1px solid ${V.line}`,
            background: V.white, fontSize: 12, fontWeight: 500, color: V.mid, cursor: 'pointer',
          }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{
        maxWidth: 520, margin: '0 auto', padding: '80px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {/* Badge */}
        <span style={{
          display: 'inline-block', padding: '4px 14px', borderRadius: 14, fontSize: 11,
          fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const,
          background: V.blueBg, color: V.blue, border: `1px solid ${V.blueBdr}`, marginBottom: 24,
        }}>
          {t('dashboard.driver.comingSoon', 'Coming Soon')}
        </span>

        {/* Icon */}
        <div style={{ fontSize: 56, marginBottom: 20 }}>🚌</div>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: V.ink, margin: '0 0 10px' }}>
          {t('dashboard.driver.driverPortal', 'Driver Dashboard')}
        </h1>

        {/* Description */}
        <p style={{ fontSize: 14, color: V.mid, lineHeight: 1.6, maxWidth: 400, marginBottom: 28 }}>
          {t('dashboard.driver.driverSub', "We're building a dedicated interface for drivers — trip tracking, passenger check-in, route navigation, and real-time alerts. Stay tuned.")}
        </p>

        {/* Feature chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {FEATURES.map((f) => (
            <span key={f} style={{
              padding: '5px 14px', borderRadius: 14, fontSize: 12, fontWeight: 500,
              background: V.white, border: `1px solid ${V.line}`, color: V.ink,
            }}>
              {f}
            </span>
          ))}
        </div>

        {/* SEMPRE block */}
        <div style={{
          width: '100%', padding: 20, borderRadius: 10, background: V.white,
          border: `1px solid ${V.line}`, marginBottom: 16, textAlign: 'left',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: V.dim, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>
            Sempre Per La Scuola
          </div>
          <p style={{ fontSize: 13, color: V.mid, lineHeight: 1.5, margin: 0 }}>
            {t('dashboard.driver.openToContrib', 'Fleetmark is a student-led open-source project. The driver module is under active development — contributions welcome.')}
          </p>
        </div>

        {/* Back button */}
        <button onClick={() => navigate('/')} style={{
          marginTop: 12, padding: '10px 28px', borderRadius: 8, border: `1px solid ${V.line}`,
          background: V.white, fontSize: 13, fontWeight: 600, color: V.ink, cursor: 'pointer',
        }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default DriverOverview;
