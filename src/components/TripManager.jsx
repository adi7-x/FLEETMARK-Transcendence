import React, { useState, useEffect } from 'react';
import { trips, routes, buses, drivers } from '../services/api';

const TripManager = () => {
  const [tripList, setTripList] = useState([]);
  const [routeList, setRouteList] = useState([]);
  const [busList, setBusList] = useState([]);
  const [driverList, setDriverList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'generate'
  const [editingTripId, setEditingTripId] = useState(null);
  
  // Weekly generation state
  const [generateStartDate, setGenerateStartDate] = useState('');
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });
  
  const [formData, setFormData] = useState({
    driver: '',
    departure_datetime: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tData, rData, bData, dData] = await Promise.all([
        trips.list(),
        routes.list(),
        buses.list(),
        drivers.list()
      ]);
      setTripList(tData);
      setRouteList(rData);
      setBusList(bData);
      setDriverList(dData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    }
    setLoading(false);
  };

  const getBusCapacity = (busId) => {
    const bus = busList.find(b => b.id === busId);
    return bus ? bus.seat_capacity : 0;
  };

  // If user selects a bus, we just update the bus ID
  const handleBusChange = (e) => {
    setFormData(prev => ({ ...prev, bus: e.target.value }));
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await trips.create(formData);
      setSuccess('Trip scheduled successfully');
      setView('list');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to schedule trip');
    }
    setLoading(false);
  };

  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await trips.update(editingTripId, formData);
      setSuccess('Trip updated successfully');
      setView('list');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update trip');
    }
    setLoading(false);
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip? It will cancel all reservations for it.')) return;
    setLoading(true);
    setError(null);
    try {
      await trips.delete(id);
      setSuccess('Trip deleted successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete trip');
    }
    setLoading(false);
  };

  const startCreate = () => {
    setFormData({
      driver: '',
      departure_datetime: ''
    });
    setError(null);
    setSuccess(null);
    setView('create');
  };

  const startEdit = (trip) => {
    setEditingTripId(trip.id);
    setFormData({
      driver: trip.driver,
      departure_datetime: new Date(trip.departure_datetime).toISOString().slice(0, 16) // format for datetime-local
    });
    setError(null);
    setSuccess(null);
    setView('edit');
  };

  // Resolvers for displaying names in the list view instead of UUIDs
  const getRouteName = (id) => routeList.find(r => r.id === id)?.name || 'Unknown Route';
  const getBusName = (id) => busList.find(b => b.id === id)?.name || 'Unknown Bus';
  const getDriverName = (id) => driverList.find(d => d.id === id)?.name || 'Unknown Driver';

  // Bulk Generation Logic
  const handleGenerateWeeklyTrips = async (e) => {
    e.preventDefault();
    if (!generateStartDate) return;

    // Remove Monday-only restriction
    const startObj = new Date(generateStartDate);

    setLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Find eligible drivers (must have default_bus, at least one default_route, and be active)
    const eligibleDrivers = driverList.filter(d => 
      d.status === 'active' && d.default_bus && d.default_routes && d.default_routes.length > 0
    );

    if (eligibleDrivers.length === 0) {
      setError("No active drivers found with BOTH a Default Bus and at least one Default Route assigned. Please set these in Fleet Management first.");
      setLoading(false);
      return;
    }

    // 2. Build the array of trip payloads to generate
    const tripsToCreate = [];
    
    // Loop through 7 days (Monday to Sunday)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDay = new Date(startObj);
      currentDay.setDate(startObj.getDate() + dayOffset);
      const dateString = currentDay.toISOString().split('T')[0]; // YYYY-MM-DD

      // For each eligible driver, generate trips based on their default routes' windows
      for (const driver of eligibleDrivers) {
        const bus = busList.find(b => b.id === driver.default_bus);
        if (!bus) continue;

        for (const routeId of driver.default_routes) {
          const route = routeList.find(r => r.id === routeId);
          if (!route) continue; // Route might have been deleted

          const hours = route.window === 'consolidated' 
            ? [1, 2, 3, 4, 5, 6] 
            : [21, 22, 23, 0]; // peak

          for (const hour of hours) {
            // If the hour is 0 (midnight for Peak), it usually means the *next* logical day in planning, 
            // but we'll attach it to the current day string with T00:00.
            // Let's create a solid ISO string in local timezone format.
            const hourStr = hour.toString().padStart(2, '0');
            const departure_datetime = `${dateString}T${hourStr}:00:00`;

            tripsToCreate.push({
              route: route.id,
              bus: bus.id,
              driver: driver.id,
              departure_datetime: departure_datetime
            });
          }
        }
      }
    }

    if (tripsToCreate.length === 0) {
      setError("No trips could be generated based on the current data.");
      setLoading(false);
      return;
    }

    // 3. Execute generation
    setGenerationProgress({ current: 0, total: tripsToCreate.length });
    let successCount = 0;
    
    // We do them sequentially or in small batches to not overload the backend.
    for (let i = 0; i < tripsToCreate.length; i++) {
      try {
        await trips.create(tripsToCreate[i]);
        successCount++;
        setGenerationProgress({ current: i + 1, total: tripsToCreate.length });
      } catch (err) {
        console.error("Failed to create trip:", tripsToCreate[i], err);
        // Continue even if one fails
      }
    }

    setSuccess(`Successfully generated ${successCount} out of ${tripsToCreate.length} scheduled trips.`);
    setView('list');
    loadData(); // Reload the table
    setLoading(false);
  };

  if (loading && view === 'list' && tripList.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading trips...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📅 Trip Scheduling</h2>
        {view === 'list' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => {
                setGenerateStartDate('');
                setGenerationProgress({ current: 0, total: 0 });
                setError(null);
                setSuccess(null);
                setView('generate');
              }}
              style={{ padding: '8px 16px', background: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🔄 Generate Weekly Trips
            </button>
            <button 
              onClick={startCreate}
              style={{ padding: '8px 16px', background: '#00babc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + Schedule New Trip
            </button>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c8e6c9' }}>{success}</div>}

      {view === 'generate' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>🔄 Bulk Generate Weekly Trips</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            This tool will automatically create a full week of trips for <strong>every active Driver</strong> who has both a <strong>Default Bus</strong> and a <strong>Default Route</strong> assigned to them. 
            The times will be automatically selected based on the Route's category (Peak vs Consolidated).
          </p>
          
          <form onSubmit={handleGenerateWeeklyTrips}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Select Start Date (Generates 7 Days)</label>
              <input 
                type="date" 
                required
                value={generateStartDate}
                onChange={e => setGenerateStartDate(e.target.value)}
                style={{ width: '100%', maxWidth: '300px', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            {loading && generationProgress.total > 0 && (
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Generating Trips: {generationProgress.current} / {generationProgress.total}
                </div>
                <div style={{ width: '100%', background: '#ddd', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#673ab7', width: `${(generationProgress.current / generationProgress.total) * 100}%`, transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
              <button 
                type="button" 
                onClick={() => setView('list')}
                disabled={loading}
                style={{ padding: '10px 16px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || !generateStartDate}
                style={{ padding: '10px 24px', background: loading ? '#ccc' : '#673ab7', color: 'white', border: 'none', borderRadius: '6px', cursor: (loading || !generateStartDate) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Processing...' : 'Generate Trips'}
              </button>
            </div>
          </form>
        </div>
      ) : view !== 'list' ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{view === 'create' ? 'Schedule New Trip' : 'Edit Trip'}</h3>
          
          <form onSubmit={view === 'create' ? handleCreateTrip : handleUpdateTrip}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Route</label>
                <select 
                  required
                  value={formData.route}
                  onChange={e => setFormData({...formData, route: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">-- Select Route --</option>
                  {routeList.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.window})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Departure Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={formData.departure_datetime}
                  onChange={e => setFormData({...formData, departure_datetime: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bus</label>
                <select 
                  required
                  value={formData.bus}
                  onChange={handleBusChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">-- Select Bus --</option>
                  {busList.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.plate}) - {b.seat_capacity} seats</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Driver</label>
                <select 
                  required
                  value={formData.driver}
                  onChange={e => setFormData({...formData, driver: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">-- Select Driver --</option>
                  {driverList.filter(d => d.status === 'active' || d.id === formData.driver).map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.username})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button 
                type="button" 
                onClick={() => setView('list')}
                style={{ padding: '10px 16px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                style={{ padding: '10px 24px', background: loading ? '#ccc' : '#00babc', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Saving...' : 'Save Trip'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eaeaea' }}>
          {tripList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
              No trips scheduled yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Date & Time</th>
                    <th style={{ padding: '15px' }}>Route</th>
                    <th style={{ padding: '15px' }}>Bus & Driver</th>
                    <th style={{ padding: '15px' }}>Seats</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tripList.map(trip => (
                    <tr key={trip.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px', fontWeight: '500' }}>
                        {new Date(trip.departure_datetime).toLocaleString()}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {getRouteName(trip.route)}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ color: '#333' }}>🚐 {getBusName(trip.bus)}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>👨‍✈️ {getDriverName(trip.driver)}</div>
                      </td>
                      <td style={{ padding: '15px' }}>{trip.seats_left}</td>
                      <td style={{ padding: '15px' }}>
                        {trip.archived_at ? (
                          <span style={{ padding: '4px 8px', background: '#eeeeee', color: '#666', borderRadius: '4px', fontSize: '0.8rem' }}>Archived</span>
                        ) : (
                          <span style={{ padding: '4px 8px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => startEdit(trip)}
                          disabled={!!trip.archived_at}
                          style={{ marginRight: '10px', padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: trip.archived_at ? 'not-allowed' : 'pointer', opacity: trip.archived_at ? 0.5 : 1 }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteTrip(trip.id)}
                          disabled={loading}
                          style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TripManager;
