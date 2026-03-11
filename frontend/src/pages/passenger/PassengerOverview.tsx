// @ts-nocheck
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReservation } from '../../context/ReservationContext';
import { useSchedule } from '../../context/ScheduleContext';
import { useTranslation } from 'react-i18next';
import StudentOnboarding from '../../components/passenger/StudentOnboarding';
import type { BusAssignment } from '../../context/ReservationContext';

const V = {
  bg: 'var(--fm-bg)',
  white: 'var(--fm-surface)',
  ink: 'var(--fm-ink)',
  mid: 'var(--fm-mid)',
  dim: 'var(--fm-dim)',
  line: 'var(--fm-line)',
  blue: 'var(--fm-blue)',
  blueBg: 'var(--fm-blue-bg)',
  blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)',
  greenBg: 'var(--fm-green-bg)',
  greenBdr: 'var(--fm-green-bdr)',
  mono: 'var(--fm-mono)',
} as const;

const PassengerOverview = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const {
    isOnboarded,
    transport,
    tonightReservations,
    pastReservations,
    setHomeStop,
    getBusInfo,
  } = useReservation();
  const { generatedSlots, serviceStatus } = useSchedule();

  const activeTonight = tonightReservations.filter((r) => r.status === 'Confirmed');
  const nextTrip = activeTonight.length > 0 ? activeTonight[0] : null;
  const totalPastTrips = pastReservations.reduce((sum, n) => sum + n.reservations.length, 0);
  const busInfo = getBusInfo();

  // Find next available slot time
  const nextSlotTime = serviceStatus.state === 'running' ? serviceStatus.nextDeparture : null;

  // Available seats for tonight
  const openSlots = generatedSlots.filter(
    (s) => s.status !== 'stopped' && s.availableSeats > 0,
  );
  const nextOpenSlot = openSlots.length > 0 ? openSlots[0] : null;
  const seatsLeft = nextOpenSlot ? nextOpenSlot.availableSeats : 0;

  if (!isOnboarded) {
    return (
      <StudentOnboarding
        onComplete={(stop: string, bus: BusAssignment) => setHomeStop(stop, bus)}
      />
    );
  }

  const homeStop = transport?.homeStop || '—';
  const routeLabel = busInfo?.routeName || transport?.busAssignment || 'Route A';
  const busLabel = busInfo?.busNumber || transport?.busAssignment || 'Bus 1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Hero card (blue bg) */}
      <div style={{
        background: V.blue,
        borderRadius: 14,
        padding: '28px 28px 24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background bus emoji */}
        <div style={{
          position: 'absolute', bottom: -10, right: 10,
          fontSize: 80, opacity: 0.1, lineHeight: 1,
          pointerEvents: 'none',
        }}>🚌</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginBottom: 8 }}>
            {t('dashboard.passenger.tonight', 'Tonight')} · {routeLabel} · {homeStop}
          </div>

          {/* Big time */}
          <div style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em',
            fontFamily: V.mono,
          }}>
            {nextTrip ? nextTrip.slotLabel : (nextSlotTime || '11:00 PM')}
          </div>

          {/* Route subtitle */}
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
            {busLabel} · {routeLabel} · {seatsLeft} {t('dashboard.passenger.seatsLeft', 'seats left')}
          </div>

          {/* Buttons */}
          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {nextTrip ? (
              <span style={{
                padding: '8px 20px', borderRadius: 8,
                background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                fontSize: 13, fontWeight: 700, color: V.green,
              }}>
                ✓ {t('dashboard.passenger.reserved', 'Reserved')}
              </span>
            ) : (
              <Link to="/student/reserve" style={{
                display: 'inline-block',
                padding: '8px 20px', borderRadius: 8,
                background: 'white', color: V.blue,
                fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}>
                {t('dashboard.passenger.reserveSeat', 'Reserve my seat')} →
              </Link>
            )}
            {nextOpenSlot && openSlots.length > 1 && (
              <Link to="/student/reserve" style={{
                padding: '8px 16px', borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                fontSize: 12, fontWeight: 600, color: 'white',
                textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)',
              }}>
                {openSlots[1]?.label} {t('dashboard.passenger.alsoAvailable', 'also available')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Two info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* My Home Stop */}
        <div style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: '18px 20px',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.myHomeStop', 'My Home Stop')}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {homeStop}
          </div>
          <div style={{ fontSize: 11, color: V.mid, marginTop: 4 }}>
            {busLabel} · {routeLabel}
          </div>
          <Link to="/student/settings" style={{
            fontSize: 11, fontWeight: 600, color: V.blue,
            textDecoration: 'none', marginTop: 6, display: 'inline-block',
          }}>
            {t('dashboard.passenger.change', 'Change')} →
          </Link>
        </div>

        {/* Rides This Month */}
        <div style={{
          background: V.white,
          border: `1px solid ${V.line}`,
          borderRadius: 12,
          padding: '18px 20px',
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: V.dim,
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            {t('dashboard.passenger.ridesThisMonth', 'Rides This Month')}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: V.ink, marginTop: 6 }}>
            {totalPastTrips + activeTonight.length}
          </div>
          <Link to="/student/reservations" style={{
            fontSize: 11, fontWeight: 600, color: V.blue,
            textDecoration: 'none', marginTop: 6, display: 'inline-block',
          }}>
            {t('dashboard.passenger.viewHistory', 'View history')} →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PassengerOverview;
