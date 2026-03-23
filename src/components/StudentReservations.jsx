import React, { useState, useEffect } from 'react';
import { reservations, routes, buses } from '../services/api';
import StudentReportForm from './StudentReportForm';

const StudentReservations = ({ user }) => {
  const [activeRes, setActiveRes] = useState([]);
  const [historyRes, setHistoryRes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reportingTrip, setReportingTrip] = useState(null);
  
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'history'

  useEffect(() => {
    if (user && user.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeData, historyData] = await Promise.all([
        reservations.list(user.id),
        reservations.history(user.id)
      ]);
      
      setActiveRes(activeData || []);
      setHistoryRes(historyData || []);
    } catch (err) {
      setError(err.message || 'Failed to load reservations.');
    }
    setLoading(false);
  };

  const handleCancelReservation = async (resId) => {
    if (!window.confirm("Are you sure you want to cancel your seat? This cannot be undone.")) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await reservations.deleteWithUser(resId, user.id);
      setSuccess('Your reservation has been cancelled.');
      loadData(); // Reload lists
    } catch (err) {
      setError(err.message || 'Failed to cancel reservation.');
    }
    setLoading(false);
  };

  const getRouteName = (routeObj) => {
    // The API might nest the trip or return IDs. Assuming it returns trip object or ID.
    // Wait, the API returns the Trip UUID. We need to fetch the Trip object from the Trip UUID, OR the backend serialized the trip.
    // Looking at the docs, `trip` is just the UUID. This means we don't know the Route ID directly from the reservation!
    // We should ideally have the backend serialize the trip details. 
    // IF the backend only returns UUIDs, we would need to fetch all trips. But students can't fetch all trips easily if they are archived.
    // Since we don't have the trip details easily without another fetch, let's just show the Trip ID or "Trip Data" for now.
    // Wait, we can fetch all Active Trips: `trips.list()` but that might be large.
    return "Booked Trip"; // Fallback for now if backend doesn't expand Trip
  };

  // We actually need the Trip details. Let's assume the backend serializer for Reservation includes at least the Trip ID.
  // We can just show the Creation Date and the Trip ID if we don't have the expanded Trip data.

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    background: isActive ? '#fff' : '#f8f9fa',
    borderBottom: isActive ? '3px solid #00babc' : '3px solid transparent',
    color: isActive ? '#333' : '#666',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.2s ease',
    outline: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    fontSize: '1rem'
  });

  const renderReservationCard = (res, isHistory) => {
    const trip = res.trip_details || {};
    const departureTime = trip.departure_datetime ? new Date(trip.departure_datetime) : null;
    
    const bookedAt = res.created_at ? new Date(res.created_at) : new Date();

    return (
      <div key={res.id} style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 4px 10px rgba(0,0,0,0.04)', 
        border: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        opacity: isHistory ? 0.7 : 1,
        transition: 'all 0.2s ease'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
             <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{trip.route_name || 'Unknown Route'}</h4>
             {isHistory ? (
                <span style={{ padding: '3px 8px', background: '#f5f5f5', color: '#888', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>ARCHIVED</span>
             ) : (
                <span style={{ padding: '3px 8px', background: '#e0f2f1', color: '#00897b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>UPCOMING</span>
             )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', fontSize: '0.9rem', color: '#666' }}>
            {departureTime && (
              <div>🕒 <strong>Time:</strong> {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            )}
            {departureTime && (
              <div>📅 <strong>Date:</strong> {departureTime.toLocaleDateString()}</div>
            )}
            <div>🚐 <strong>Bus:</strong> {trip.bus_name || 'TBA'}</div>
            <div style={{ color: '#999', fontSize: '0.8rem' }}>🆔 Booking ID: {res.id.substring(0,8)}...</div>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#999', fontStyle: 'italic' }}>
            Booked on: {bookedAt.toLocaleDateString()} at {bookedAt.toLocaleTimeString()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {!isHistory && (
            <button 
              onClick={() => handleCancelReservation(res.id)}
              disabled={loading}
              style={{ 
                padding: '10px 16px', 
                background: '#ffebee', 
                color: '#c62828', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel Seat
            </button>
          )}
          
          {!isHistory && !reportingTrip && (
            <button 
              onClick={() => setReportingTrip({ id: res.trip, ...trip })}
              style={{ 
                padding: '10px 16px', 
                background: '#f5f5f5', 
                color: '#666', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginLeft: '10px'
              }}
            >
              🚩 Report
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🎫 My Reservations</h2>
        <button 
          onClick={loadData}
          disabled={loading}
          style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '24px' }}>
        <button style={tabStyle(activeTab === 'upcoming')} onClick={() => setActiveTab('upcoming')}>
          Upcoming Trips ({activeRes.length})
        </button>
        <button style={tabStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          Past History ({historyRes.length})
        </button>
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c8e6c9' }}>{success}</div>}

      {reportingTrip && (
        <div style={{ marginBottom: '30px' }}>
          <StudentReportForm 
            trip={reportingTrip} 
            onCancel={() => setReportingTrip(null)}
            onComplete={() => {
              setReportingTrip(null);
              setSuccess('Thank you! Your report has been submitted to the logistics team.');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {loading && activeRes.length === 0 && historyRes.length === 0 ? (
         <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading your reservations...</div>
      ) : activeTab === 'upcoming' ? (
        activeRes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed #ccc', color: '#888' }}>
            You have no upcoming trips booked. 
          </div>
        ) : (
          <div>{activeRes.map(res => renderReservationCard(res, false))}</div>
        )
      ) : (
        historyRes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', border: '1px dashed #ccc', color: '#888' }}>
            You have no past trip history.
          </div>
        ) : (
          <div>{historyRes.map(res => renderReservationCard(res, true))}</div>
        )
      )}
    </div>
  );
};

export default StudentReservations;
