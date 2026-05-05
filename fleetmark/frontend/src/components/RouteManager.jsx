import React, { useState, useEffect } from 'react';
import { stations, routes } from '../services/api';
import { SortableStationItem } from './SortableStationItem';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const RouteManager = () => {
  const [routeList, setRouteList] = useState([]);
  const [stationList, setStationList] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // View state: 'list', 'create', 'edit'
  const [view, setView] = useState('list');
  const [editingRoute, setEditingRoute] = useState(null);

  // Form states
  const [routeName, setRouteName] = useState('');
  const [routeWindow, setRouteWindow] = useState('peak');
  
  // Dnd states for route stations
  const [activeRouteStations, setActiveRouteStations] = useState([]); // array of { id: uniqueId, station: stationObj }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rData, sData] = await Promise.all([routes.list(), stations.list()]);
      setRouteList(rData);
      setStationList(sData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    }
    setLoading(false);
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Create new route. Requirements: must have at least one station.
      // But creating a route accepts `station_ids` array. Wait, POST /api/v1/routes/ requires station_ids.
      // If we don't have stations yet, the backend returns 400. 
      // Let's do this: we'll enforce adding at least one station on the edit screen, 
      // OR we add logic to pick an initial station here.
      // Better approach: Since backend requires a station, we'll let user select at least one initially or auto-select the first available one to bypass 400, or we handle it on "Save" after creating.
      
      // Since it's easier to create everything in one go, we can just switch the 'create' view to look like the 'edit' view.
      // For now, let's keep it simple: We just build a full form if needed.
      
      if (activeRouteStations.length === 0) {
        throw new Error("A route must have at least one station.");
      }

      await routes.create({
        name: routeName,
        window: routeWindow,
        station_ids: activeRouteStations.map(rs => rs.station.id)
      });
      setSuccess('Route created successfully');
      setView('list');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create route');
    }
    setLoading(false);
  };

  const handleUpdateRoute = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeRouteStations.length === 0) {
        throw new Error("A route must have at least one station.");
      }
      
      await routes.update(editingRoute.id, {
        name: routeName,
        window: routeWindow,
        station_ids: activeRouteStations.map(rs => rs.station.id)
      });
      setSuccess('Route updated successfully');
      setView('list');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update route');
    }
    setLoading(false);
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    setLoading(true);
    setError(null);
    try {
      await routes.delete(id);
      setSuccess('Route deleted successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete route. It might be in use.');
    }
    setLoading(false);
  };

  const startCreate = () => {
    setRouteName('');
    setRouteWindow('peak');
    setActiveRouteStations([]);
    setError(null);
    setSuccess(null);
    setView('create');
  };

  const startEdit = (route) => {
    setEditingRoute(route);
    setRouteName(route.name);
    setRouteWindow(route.window);
    
    // Map backend response ({ order, station: { id, name } }) to dnd-kit state
    const mappedStations = route.stations.map((rs, index) => ({
      id: `rs-${rs.station.id}-${index}`, // unique ID for dnd-kit
      station: rs.station
    }));
    setActiveRouteStations(mappedStations);
    
    setError(null);
    setSuccess(null);
    setView('edit');
  };

  // Drag and drop handlers
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActiveRouteStations((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddStation = (station) => {
    setActiveRouteStations([
      ...activeRouteStations, 
      { id: `rs-${station.id}-${Date.now()}`, station: station }
    ]);
  };

  const handleRemoveStation = (uniqueId) => {
    setActiveRouteStations(activeRouteStations.filter(rs => rs.id !== uniqueId));
  };

  // --- Renderers ---
  const activeStationIds = new Set(activeRouteStations.map(rs => rs.station.id));
  const availableStations = stationList.filter(s => !activeStationIds.has(s.id));

  if (loading && view === 'list') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading routes...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🗺️ Route Management</h2>
        {view === 'list' && (
          <button 
            onClick={startCreate}
            style={{ padding: '8px 16px', background: '#00babc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + New Route
          </button>
        )}
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c8e6c9' }}>{success}</div>}

      {view === 'list' ? (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eaeaea' }}>
          {routeList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
              No routes found. Click "+ New Route" to create one.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th scope="col" style={{ padding: '15px' }}>Route Name</th>
                  <th scope="col" style={{ padding: '15px' }}>Category</th>
                  <th scope="col" style={{ padding: '15px' }}>Stations Count</th>
                  <th scope="col" style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routeList.map(route => (
                  <tr key={route.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px', fontWeight: '500' }}>{route.name}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem',
                        background: route.window === 'peak' ? '#e3f2fd' : '#fff3e0',
                        color: route.window === 'peak' ? '#1565c0' : '#e65100'
                      }}>
                        {route.window === 'peak' ? 'Peak (Multi-bus)' : 'Consolidated (Single-bus)'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: '#666' }}>{route.stations?.length || 0} stops</td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <button 
                        onClick={() => startEdit(route)}
                        style={{ marginRight: '10px', padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit / Reorder
                      </button>
                      <button 
                        onClick={() => handleDeleteRoute(route.id)}
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
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          {/* Left Column: Form and Active Stations Drop Area */}
          <div style={{ flex: 2, background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{view === 'create' ? 'Create New Route' : `Edit Route: ${editingRoute.name}`}</h3>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Route Name</label>
                <input 
                  type="text" 
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  placeholder="e.g. Bus 1 Route"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#444' }}>Route Category</label>
                <select 
                  value={routeWindow}
                  onChange={e => setRouteWindow(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', background: '#fff' }}
                  disabled={view === 'edit'}
                >
                  <option value="peak">Peak (Multi-bus runs)</option>
                  <option value="consolidated">Consolidated (Single late-night run)</option>
                </select>
                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                  {view === 'edit' ? 'Category cannot be changed after creation.' : 'Tells the system scheduler when to use this template.'}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '10px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#444', display: 'flex', justifyContent: 'space-between' }}>
                Assigned Route Stops
                <span style={{ fontSize: '0.85rem', color: '#888', fontWeight: 'normal' }}>Drag to reorder</span>
              </h4>
              
              {activeRouteStations.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ddd', color: '#888' }}>
                  No stations added. Click stations on the right to add them to this route.
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={activeRouteStations.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                      {activeRouteStations.map((item, index) => (
                         // Using the new SortableStationItem component
                         <SortableStationItem 
                            key={item.id} 
                            id={item.id} 
                            stationId={item.station.id}
                            name={`${index + 1}. ${item.station.name}`}
                            onRemove={handleRemoveStation}
                         />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setView('list')}
                style={{ padding: '10px 16px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={view === 'create' ? handleCreateRoute : handleUpdateRoute}
                disabled={loading || !routeName || activeRouteStations.length === 0}
                style={{ 
                  padding: '10px 24px', 
                  background: (loading || !routeName || activeRouteStations.length === 0) ? '#ccc' : '#00babc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: (loading || !routeName || activeRouteStations.length === 0) ? 'not-allowed' : 'pointer', 
                  fontWeight: 'bold' 
                }}
              >
                {loading ? 'Saving...' : 'Save Route'}
              </button>
            </div>
          </div>

          {/* Right Column: Available Stations Pool */}
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', position: 'sticky', top: '20px' }}>
            
            {routeList.length > 0 && (
              <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#444' }}>Quick Append Route</h4>
                <p style={{ fontSize: '0.80rem', color: '#888', marginBottom: '10px', marginTop: 0 }}>
                  Select an existing route to append all its stations at once.
                </p>
                <select 
                  onChange={(e) => {
                    const rId = e.target.value;
                    if (!rId) return;
                    const r = routeList.find(r => r.id === rId);
                    if (r && r.stations) {
                      setActiveRouteStations(prev => {
                        const currentActiveIds = new Set(prev.map(rs => rs.station.id));
                        const newStations = r.stations.filter(rs => !currentActiveIds.has(rs.station.id));
                        if (newStations.length > 0) {
                          return [
                            ...prev,
                            ...newStations.map((rs, i) => ({ id: `rs-${rs.station.id}-${Date.now()}-${i}`, station: rs.station }))
                          ];
                        }
                        return prev;
                      });
                    }
                    e.target.value = ''; // reset after appending
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                >
                  <option value="">-- Append from Route --</option>
                  {routeList.filter(r => r.id !== (editingRoute ? editingRoute.id : null)).map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.stations?.length} stops)</option>
                  ))}
                </select>
              </div>
            )}

            <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#444' }}>Available Stations</h4>
            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '15px', marginTop: 0 }}>
              Click to quickly append a single station to the route.
            </p>
            <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '5px' }}>
              {availableStations.map(station => (
                <div 
                  key={station.id}
                  onClick={() => handleAddStation(station)}
                  style={{ 
                    padding: '10px 14px', 
                    marginBottom: '8px', 
                    background: '#f8f9fa', 
                    border: '1px solid #eee', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.1s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#e3f2fd';
                    e.currentTarget.style.borderColor = '#bbdefb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#eee';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{station.name}</span>
                    <span style={{ color: '#00babc', fontSize: '1.2rem', fontWeight: 'bold' }}>+</span>
                  </div>
                </div>
              ))}
              {availableStations.length === 0 && (
                <div style={{ textAlign: 'center', color: '#888', padding: '20px 0', fontSize: '0.9rem' }}>
                  {stationList.length === 0 ? "No stations available in DB. Go to the Stations tab to create them first." : "All available stations have been added to this route."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteManager;
