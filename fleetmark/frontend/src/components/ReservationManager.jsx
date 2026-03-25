import React, { useState, useEffect } from 'react';
import { reservations, auth } from '../services/api';

const ReservationManager = () => {
  const [activeRes, setActiveRes] = useState([]);
  const [historyRes, setHistoryRes] = useState([]);
  const [userList, setUserList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [activeData, historyData, usersData] = await Promise.all([
        reservations.list(),
        reservations.history(),
        auth.getUsers(),
      ]);
      setActiveRes(activeData || []);
      setHistoryRes(historyData || []);
      setUserList(usersData || []);
    } catch (err) {
      setError(err.message || 'Failed to load reservations.');
    }
    setLoading(false);
  }

  // Lookup student info from the user list
  const getStudentInfo = (studentId) => {
    const u = userList.find(u => u.id === studentId);
    if (!u) return { display: 'Unknown', username: '—' };
    const name = u.first_name ? `${u.first_name} ${u.last_name}` : u.login_42 || u.email;
    return { display: name, username: u.login_42 || u.email };
  };

  // Apply search + date filter to a reservation list
  const applyFilters = (list) => {
    return list.filter(res => {
      const student = getStudentInfo(res.student);
      const trip = res.trip_details || {};
      const routeName = trip.route_name || '';
      const busName = trip.bus_name || '';
      const departureDate = trip.departure_datetime ? new Date(trip.departure_datetime) : null;

      // Search filter (username, login, route, bus)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches =
          student.display.toLowerCase().includes(term) ||
          student.username.toLowerCase().includes(term) ||
          routeName.toLowerCase().includes(term) ||
          busName.toLowerCase().includes(term);
        if (!matches) return false;
      }

      // Date-from filter (based on trip departure date)
      if (dateFrom && departureDate) {
        if (departureDate < new Date(dateFrom)) return false;
      }

      // Date-to filter (based on trip departure date)
      if (dateTo && departureDate) {
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (departureDate > toEnd) return false;
      }

      return true;
    });
  };

  const currentList = activeTab === 'active' ? activeRes : historyRes;
  const filteredList = applyFilters(currentList);

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: isActive ? '3px solid #00babc' : '3px solid transparent',
    color: isActive ? '#333' : '#888',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: '1rem',
    transition: 'all 0.2s',
  });

  const inputStyle = {
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.9rem',
    outline: 'none',
    background: 'white',
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🎫 Reservation Manager</h2>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button style={tabStyle(activeTab === 'active')} onClick={() => setActiveTab('active')}>
          ✅ Active ({activeRes.length})
        </button>
        <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          🗂️ History / Archived ({historyRes.length})
        </button>
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search student, login, route, bus..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, minWidth: '280px', flex: 1 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>Trip From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap' }}>Trip To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={inputStyle}
          />
        </div>
        {(searchTerm || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); }}
            style={{ padding: '9px 14px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ marginBottom: '16px', fontSize: '0.85rem', color: '#888' }}>
        Showing <strong style={{ color: '#333' }}>{filteredList.length}</strong> of <strong style={{ color: '#333' }}>{currentList.length}</strong> reservations
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #eaeaea' }}>
        {filteredList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            {searchTerm || dateFrom || dateTo
              ? 'No reservations match your filters.'
              : activeTab === 'active'
                ? 'No active reservations.'
                : 'No archived reservations.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '14px 15px' }}>📅 Trip Date &amp; Time</th>
                  <th style={{ padding: '14px 15px' }}>🗺️ Route</th>
                  <th style={{ padding: '14px 15px' }}>👤 Student</th>
                  <th style={{ padding: '14px 15px' }}>🚐 Bus</th>
                  <th style={{ padding: '14px 15px' }}>🕐 Booked At</th>
                  <th style={{ padding: '14px 15px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(res => {
                  const trip = res.trip_details || {};
                  const student = getStudentInfo(res.student);
                  const departure = trip.departure_datetime ? new Date(trip.departure_datetime) : null;
                  const bookedAt = res.created_at ? new Date(res.created_at) : null;
                  const isArchived = activeTab === 'history';

                  return (
                    <tr
                      key={res.id}
                      style={{
                        borderBottom: '1px solid #eee',
                        opacity: isArchived ? 0.8 : 1,
                        background: isArchived ? '#fafafa' : 'white',
                        transition: 'background 0.15s',
                      }}
                    >
                      <td style={{ padding: '14px 15px', fontWeight: '500' }}>
                        {departure ? (
                          <>
                            <div>{departure.toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                              {departure.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 15px' }}>
                        {trip.route_name || <span style={{ color: '#aaa' }}>Unknown</span>}
                      </td>
                      <td style={{ padding: '14px 15px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{student.display}</div>
                        <div style={{ fontSize: '0.82rem', color: '#888' }}>
                          <code>{student.username}</code>
                        </div>
                      </td>
                      <td style={{ padding: '14px 15px' }}>
                        {trip.bus_name || <span style={{ color: '#aaa' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 15px', fontSize: '0.85rem', color: '#666' }}>
                        {bookedAt ? (
                          <>
                            <div>{bookedAt.toLocaleDateString()}</div>
                            <div style={{ color: '#aaa' }}>{bookedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '14px 15px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          background: isArchived ? '#eeeeee' : '#e8f5e9',
                          color: isArchived ? '#666' : '#2e7d32',
                          border: `1px solid ${isArchived ? '#ddd' : '#c8e6c9'}`,
                        }}>
                          {isArchived ? 'COMPLETED' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManager;
