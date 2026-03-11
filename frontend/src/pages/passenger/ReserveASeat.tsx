// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import { useSchedule, type GeneratedSlot } from '../../context/ScheduleContext';
import { useReservation, type BusAssignment } from '../../context/ReservationContext';
import { useTranslation } from 'react-i18next';
import StudentOnboarding from '../../components/passenger/StudentOnboarding';

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
  amber: 'var(--fm-amber)',
  red: 'var(--fm-red)',
  redBg: 'var(--fm-red-bg)',
  redBdr: 'var(--fm-red-bdr)',
  mono: 'var(--fm-mono)',
} as const;

const ReserveASeat = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { generatedSlots } = useSchedule();
  const {
    transport,
    isOnboarded,
    setHomeStop,
    canReserve,
    makeReservation,
    isSlotReserved,
    isSlotOpen,
    getBusInfo,
  } = useReservation();

  const [confirmingSlot, setConfirmingSlot] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const busInfo = getBusInfo();
  const homeStop = transport?.homeStop || '—';

  const handleReserve = useCallback((slot: GeneratedSlot) => {
    setConfirmingSlot(slot.time);
    setTimeout(() => {
      makeReservation(slot.time, slot.label);
      toast(`Reserved — Bus departs at ${slot.label}`);
      setConfirmingSlot(null);
    }, 600);
  }, [makeReservation, toast]);

  const getSlotState = useCallback(
    (slot: GeneratedSlot): 'break' | 'reserved' | 'passed' | 'full' | 'locked' | 'open' => {
      if (slot.status === 'stopped') return 'break';
      if (isSlotReserved(slot.time)) return 'reserved';

      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const [h, m] = slot.time.split(':').map(Number);
      let slotMins = h * 60 + m;
      if (slotMins < 6 * 60 && nowMins >= 18 * 60) slotMins += 24 * 60;
      const adj = nowMins < 6 * 60 ? nowMins + 24 * 60 : nowMins;
      if (slotMins < adj - 5) return 'passed';
      if (slot.availableSeats === 0) return 'full';
      if (isSlotOpen(slot.time)) return 'open';
      return 'locked';
    },
    [isSlotReserved, isSlotOpen]
  );

  if (!isOnboarded) {
    return (
      <StudentOnboarding
        onComplete={(stop: string, bus: BusAssignment) => {
          setHomeStop(stop, bus);
          toast('Setup complete! You can now reserve trips.');
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Page header */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: V.ink, letterSpacing: '-0.02em' }}>
          {t('dashboard.passenger.reserveTitle', 'Reserve a Seat')}
        </div>
        <div style={{ fontSize: 13, color: V.mid, marginTop: 4 }}>
          {t('dashboard.passenger.reserveSubtitle', "Tonight's available trips from")} {homeStop}
        </div>
      </div>

      {/* Trip cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {generatedSlots.map((slot, i) => {
          const state = getSlotState(slot);
          if (state === 'break' || state === 'passed') return null;

          const isConfirming = confirmingSlot === slot.time;
          const seatsColor = slot.availableSeats <= 3 ? V.amber : V.dim;

          return (
            <div
              key={i}
              style={{
                background: V.white,
                border: `1px solid ${V.line}`,
                borderRadius: 12,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                opacity: state === 'full' || state === 'locked' ? 0.5 : 1,
                transition: 'all 0.15s',
                cursor: state === 'open' && canReserve ? 'default' : 'default',
              }}
              onMouseEnter={(e) => {
                if (state === 'open') {
                  e.currentTarget.style.borderColor = V.blueBdr;
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.08)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = V.line;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Departure time */}
              <div style={{ width: 64, flexShrink: 0 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, color: V.blue,
                  fontFamily: V.mono,
                }}>
                  {slot.label}
                </div>
              </div>

              {/* Trip info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: V.ink }}>
                  {busInfo?.routeName || transport?.busAssignment || t('dashboard.passenger.nightShuttle', 'Night Shuttle')}
                </div>
                <div style={{ fontSize: 11, color: V.mid, marginTop: 2 }}>
                  1337 → {homeStop}
                </div>
              </div>

              {/* Seats left */}
              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 48 }}>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: seatsColor,
                }}>
                  {slot.availableSeats}
                </div>
                <div style={{ fontSize: 10, color: V.dim, marginTop: 1 }}>
                  {t('dashboard.passenger.seatsLeft', 'Seats Left')}
                </div>
              </div>

              {/* Action button */}
              <div style={{ flexShrink: 0 }}>
                {state === 'reserved' ? (
                  <div style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: V.greenBg, border: `1px solid ${V.greenBdr}`,
                    fontSize: 12, fontWeight: 600, color: V.green,
                  }}>
                    ✓ {t('dashboard.passenger.reserved', 'Reserved')}
                  </div>
                ) : state === 'open' && canReserve ? (
                  <button
                    onClick={() => handleReserve(slot)}
                    disabled={isConfirming}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      background: isConfirming ? V.greenBg : V.blue,
                      border: isConfirming ? `1px solid ${V.greenBdr}` : 'none',
                      fontSize: 12, fontWeight: 600,
                      color: isConfirming ? V.green : '#FFFFFF',
                      cursor: isConfirming ? 'default' : 'pointer',
                      fontFamily: "'Geist', sans-serif",
                      transition: 'all 0.15s',
                    }}
                  >
                    {isConfirming ? '...' : `${t('dashboard.passenger.reserve', 'Reserve')} →`}
                  </button>
                ) : state === 'full' ? (
                  <div style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: V.bg, border: `1px solid ${V.line}`,
                    fontSize: 12, fontWeight: 600, color: V.dim,
                  }}>
                    {t('dashboard.passenger.full', 'Full')}
                  </div>
                ) : (
                  <div style={{
                    padding: '7px 16px', borderRadius: 8,
                    background: V.bg, border: `1px solid ${V.line}`,
                    fontSize: 12, fontWeight: 600, color: V.dim,
                  }}>
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReserveASeat;
