// @ts-nocheck
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { useReservation, ALL_STOPS, getBusForStop, isSharedStop, BUS_INFO, type BusAssignment } from '../../context/ReservationContext';

const V = {
  bg: 'var(--fm-bg)', white: 'var(--fm-surface)', ink: 'var(--fm-ink)', mid: 'var(--fm-mid)', dim: 'var(--fm-dim)',
  line: 'var(--fm-line)', blue: 'var(--fm-blue)', blueBg: 'var(--fm-blue-bg)', blueBdr: 'var(--fm-blue-bdr)',
  green: 'var(--fm-green)', greenBg: 'var(--fm-green-bg)', greenBdr: 'var(--fm-green-bdr)', amber: 'var(--fm-amber)', amberBg: 'var(--fm-amber-bg)',
  amberBdr: 'var(--fm-amber-bdr)', red: 'var(--fm-red)', redBg: 'var(--fm-red-bg)',
};

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { logout } = useAuth();
  const { transport, changeHomeStop, getBusInfo } = useReservation();

  const busInfo = getBusInfo();

  const [showStopPicker, setShowStopPicker] = useState(false);
  const [selectedStop, setSelectedStop] = useState('');
  const [selectedBus, setSelectedBus] = useState<BusAssignment | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoReserve, setAutoReserve] = useState(false);

  const handleStopSelect = (stop: string) => {
    setSelectedStop(stop);
    if (isSharedStop(stop)) {
      setSelectedBus(null);
    } else {
      const buses = getBusForStop(stop);
      if (buses.length > 0) setSelectedBus(buses[0]);
    }
  };

  const saveStop = () => {
    if (!selectedStop || !selectedBus) return;
    changeHomeStop(selectedStop, selectedBus);
    toast(t('settings.stopSaved', 'Home stop updated!'));
    setSelectedStop('');
    setSelectedBus(null);
    setShowStopPicker(false);
  };

  const cancelStopPicker = () => {
    setSelectedStop('');
    setSelectedBus(null);
    setShowStopPicker(false);
  };

  /* ── Toggle switch — 38x21 pill ── */
  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} style={{
      width: 38, height: 21, borderRadius: 11, border: 'none', cursor: 'pointer',
      background: on ? V.blue : V.dim, position: 'relative', transition: 'background .2s',
      flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 19 : 2, width: 17, height: 17,
        borderRadius: 9, background: V.white, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }} />
    </button>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Home Stop card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: V.ink }}>
              {t('settings.homeStop', 'Home Stop')}
            </div>
            <div style={{ fontSize: 12, color: V.mid, marginTop: 2 }}>
              {transport?.homeStop || '—'}
              {busInfo && (
                <span style={{ marginLeft: 6, color: V.dim }}>({busInfo.routeName})</span>
              )}
            </div>
          </div>
          {!showStopPicker && (
            <button
              onClick={() => setShowStopPicker(true)}
              style={{
                padding: '6px 14px', borderRadius: 8,
                background: V.blueBg, border: `1px solid ${V.blueBdr}`,
                fontSize: 12, fontWeight: 600, color: V.blue,
                cursor: 'pointer', fontFamily: "'Geist', sans-serif",
              }}
            >
              {t('settings.changeStop', 'Change stop')}
            </button>
          )}
        </div>

        {/* Inline stop picker */}
        {showStopPicker && (
          <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${V.line}`, paddingTop: 16 }}>
            {Object.values(BUS_INFO).map((bus) => (
              <div key={bus.busNumber} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: V.dim, marginBottom: 6 }}>
                  {bus.routeName}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {bus.stops.map((stop: string) => {
                    const active = selectedStop === stop;
                    const isCurrent = transport?.homeStop === stop;
                    const shared = isSharedStop(stop);
                    return (
                      <button key={stop} onClick={() => handleStopSelect(stop)} style={{
                        padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                        border: `1px solid ${active ? V.blue : isCurrent ? V.greenBdr : V.line}`,
                        cursor: 'pointer', transition: 'all .15s',
                        background: active ? V.blue : isCurrent ? V.greenBg : 'transparent',
                        color: active ? 'white' : isCurrent ? V.green : shared ? V.amber : V.ink,
                        fontFamily: "'Geist', sans-serif",
                      }}>
                        {stop}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Shared stop bus picker */}
            {selectedStop && isSharedStop(selectedStop) && (
              <div style={{
                marginTop: 10, padding: 12, borderRadius: 8,
                background: V.amberBg, border: `1px solid ${V.amberBdr}`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: V.amber, marginBottom: 8 }}>
                  {t('settings.sharedStop', 'This stop is served by both buses — pick one:')}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {getBusForStop(selectedStop).map((bus) => (
                    <button key={bus} onClick={() => setSelectedBus(bus)} style={{
                      flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', border: '1px solid', transition: 'all .15s',
                      background: selectedBus === bus ? V.blueBg : V.white,
                      borderColor: selectedBus === bus ? V.blueBdr : V.line,
                      color: selectedBus === bus ? V.blue : V.mid,
                      fontFamily: "'Geist', sans-serif",
                    }}>
                      {bus}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Save / Cancel */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={cancelStopPicker} style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'transparent', color: V.mid,
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
              }}>
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={saveStop}
                disabled={!selectedStop || !selectedBus}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                  background: selectedStop && selectedBus ? V.blue : V.line,
                  color: selectedStop && selectedBus ? 'white' : V.dim,
                  fontSize: 13, fontWeight: 600,
                  cursor: selectedStop && selectedBus ? 'pointer' : 'not-allowed',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                {t('settings.save', 'Save')} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Preferences card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        padding: '16px 20px', transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: V.ink, marginBottom: 14 }}>
          {t('settings.preferences', 'Preferences')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 13, color: V.ink }}>{t('settings.notifications', 'Notifications')}</span>
          <Toggle on={notifications} onToggle={() => setNotifications(!notifications)} />
        </div>
        <div style={{ borderTop: `1px solid ${V.line}` }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
          <span style={{ fontSize: 13, color: V.ink }}>{t('settings.autoReserve', 'Auto-reserve same stop')}</span>
          <Toggle on={autoReserve} onToggle={() => setAutoReserve(!autoReserve)} />
        </div>
      </div>

      {/* ── Sign Out card ── */}
      <div style={{
        background: V.white, border: `1px solid ${V.line}`, borderRadius: 12,
        padding: '16px 20px', transition: 'background 0.3s, border-color 0.3s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: V.red }}>
          {t('settings.signOut', 'Sign Out')}
        </span>
        <button onClick={logout} style={{
          padding: '7px 16px', borderRadius: 8,
          background: V.redBg, color: V.red,
          fontSize: 12, fontWeight: 600,
          border: 'none', cursor: 'pointer',
          fontFamily: "'Geist', sans-serif",
        }}>
          {t('settings.signOut', 'Sign out')}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
