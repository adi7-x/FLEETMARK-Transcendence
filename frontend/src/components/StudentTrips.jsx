import React, { useState, useEffect } from 'react';
import { trips, reservations, routes, buses, stations, auth } from '../services/api';

const StudentTrips = ({ user, onProfileUpdate }) => {
  const [availableTrips, setAvailableTrips] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [busList, setBusList] = useState([]);
  const [stationList, setStationList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [isChangingStation, setIsChangingStation] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState('');

  useEffect(() => {
    loadBaseData();
    if (user && user.station) {
      loadTrips();
    }
  }, [user]);

  const loadBaseData = async () => {
    try {
      const [routeData, busData, stationData] = await Promise.all([
        routes.list(),
        buses.list(),
        stations.list()
      ]);
      setRouteList(routeData);
      setBusList(busData);
      setStationList(stationData);
    } catch (err) {
      console.error('Failed to load base data:', err);
    }
  };

  const loadTrips = async () => {
    if (!user.station) return;
    setLoading(true);
    setError(null);
    try {
      const tripsData = await trips.available(user.station);
      setAvailableTrips(tripsData);
    } catch (err) {
      setError(err.message || 'Failed to load available trips.');
    }
    setLoading(false);
  };

  const handleSetStation = async () => {
    if (!selectedStationId) return;
    setLoading(true);
    setError(null);
    try {
      await auth.updateProfile({ station: selectedStationId });
      setSuccess('Station updated successfully!');
      setIsChangingStation(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError(err.message || 'Failed to update station.');
    }
    setLoading(false);
  };

  const handleBookTrip = async (tripId) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await reservations.create({
        trip: tripId,
        user_id: user.id
      });
      setSuccess('Seat booked successfully!');
      loadTrips();
    } catch (err) {
      setError(err.message || 'Failed to book the trip.');
    }
    setLoading(false);
  };

  const getRouteName = (id) => {
    const r = routeList.find(r => r.id === id);
    return r ? `${r.name} (${r.window})` : 'Unknown Route';
  };
  
  const getBusName = (id) => busList.find(b => b.id === id)?.name || 'Unknown Bus';

  // --- Station Selection UI ---
  if (!user.station || isChangingStation) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📍</div>
          <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {user.station ? 'Change Your Station' : 'Select Your Station'}
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Choose the station where you'll be joining the bus.
          </p>
        </div>

        {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2', fontSize: '0.9rem' }}>{error}</div>}

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#555', fontWeight: '500' }}>Available Stations</label>
          <select 
            value={selectedStationId} 
            onChange={(e) => setSelectedStationId(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ddd', 
              background: '#f8f9fa',
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            <option value="">-- Choose a station --</option>
            {[...stationList]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.location ? `(${s.location})` : ''}</option>
              ))
            }
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {isChangingStation && (
            <button 
              onClick={() => setIsChangingStation(false)}
              style={{ flex: 1, padding: '12px', background: '#f0f0f0', color: '#666', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancel
            </button>
          )}
          <button 
            onClick={handleSetStation}
            disabled={loading || !selectedStationId}
            style={{ 
              flex: 2, 
              padding: '12px', 
              background: (loading || !selectedStationId) ? '#ccc' : '#00babc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: (loading || !selectedStationId) ? 'not-allowed' : 'pointer', 
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Updating...' : 'Save Station'}
          </button>
        </div>
      </div>
    );
  }

  // --- Main Booking UI ---
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🚌 Available Trips</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={loadTrips}
            disabled={loading}
            style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '25px', background: '#e3f2fd', padding: '15px 20px', borderRadius: '10px', border: '1px solid #bbdefb', color: '#0d47a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '1.1rem' }}>📍 Station: {user.station_name || user.station}</strong>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '2px' }}>Browse and book upcoming trips for your location.</div>
        </div>
        <button 
          onClick={() => {
            setSelectedStationId(user.station);
            setIsChangingStation(true);
          }}
          style={{ background: 'transparent', border: '1px solid #0d47a1', color: '#0d47a1', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Change Station
        </button>
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c8e6c9' }}>{success}</div>}

      {loading && availableTrips.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
          Searching for upcoming buses...
        </div>
      ) : availableTrips.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ color: '#666', marginTop: 0 }}>No Upcoming Trips</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>There are currently no future trips scheduled through your station.</p>
          <div style={{ display: 'inline-block', textAlign: 'left', background: '#f8f9fa', padding: '15px 25px', borderRadius: '8px', color: '#777', fontSize: '0.9rem' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>Info:</div>
            Trips are usually scheduled weekly by Staff. Check back later or contact support if you believe this is an error.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
          {availableTrips.map(trip => {
            const departureDate = new Date(trip.departure_datetime);
            const isFull = trip.seats <= 0;
            
            return (
              <div key={trip.id} style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '24px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.03)', 
                border: '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                opacity: isFull ? 0.6 : 1
              }}>
                <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '15px' }}>
                  <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '1.1rem' }}>{getRouteName(trip.route)}</h3>
                  <div style={{ color: '#00babc', fontWeight: 'bold' }}>
                    🕒 {departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                <div style={{ flex: 1, marginBottom: '20px', fontSize: '0.95rem', color: '#666', lineHeight: '1.6' }}>
                  <div>📅 <strong>Date:</strong> {departureDate.toLocaleDateString()}</div>
                  <div>🚐 <strong>Bus:</strong> {getBusName(trip.bus)}</div>
                  <div>💺 <strong>Open Seats:</strong> <span style={{ color: trip.seats_left === 0 ? '#c62828' : '#2e7d32', fontWeight: 'bold' }}>{trip.seats_left}</span></div>
                </div>
                
                <button 
                  onClick={() => handleBookTrip(trip.id)}
                  disabled={loading || isFull}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: isFull ? '#eee' : '#00babc', 
                    color: isFull ? '#999' : 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: (loading || isFull) ? 'not-allowed' : 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {isFull ? 'Fully Booked' : 'Confirm Booking'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentTrips;
