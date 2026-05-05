// src/components/FleetManager.jsx
import React, { useState, useEffect } from 'react';
import { buses, drivers, routes } from '../services/api';

const FleetManager = () => {
  const [activeTab, setActiveTab] = useState('buses');
  const [items, setItems] = useState([]);
  
  // Lookups for driver form
  const [allBuses, setAllBuses] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Generic Form State
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Load Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'buses') {
        const data = await buses.list();
        setItems(data);
      } else {
        const [driversData, busesData, routesData] = await Promise.all([
          drivers.list(),
          buses.list(),
          routes.list()
        ]);
        setItems(driversData);
        setAllBuses(busesData);
        setAllRoutes(routesData);
      }
    } catch (err) {
      setError(`Failed to load ${activeTab}`);
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    setFormData({});
    setEditingId(null);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const api = activeTab === 'buses' ? buses : drivers;
    
    try {
      if (editingId) {
        // Remove password if empty during update (backend handles this)
        const data = { ...formData };
        if (activeTab === 'drivers' && !data.password) delete data.password;
        
        await api.update(editingId, data);
      } else {
        await api.create(formData);
      }
      setFormData({});
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setFormData(activeTab === 'buses' 
      ? { name: item.name, plate: item.plate, seat_capacity: item.seat_capacity }
      : { 
          name: item.name, 
          username: item.username, 
          status: item.status,
          default_bus: item.default_bus || '',
          default_routes: item.default_routes || []
        } // Password excluded
    );
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    const api = activeTab === 'buses' ? buses : drivers;
    try {
      await api.delete(id);
      fetchData();
    } catch (err) {
      setError(err.message || 'Delete failed');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🚌 Fleet Management</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('buses')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'buses' ? '#00babc' : 'transparent',
            color: activeTab === 'buses' ? 'white' : '#666',
            border: 'none',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Buses
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'drivers' ? '#00babc' : 'transparent',
            color: activeTab === 'drivers' ? 'white' : '#666',
            border: 'none',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: '5px'
          }}
        >
          Drivers
        </button>
      </div>

      {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}

      {/* Form */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>{editingId ? '✏️ Edit' : '➕ Add New'} {activeTab === 'buses' ? 'Bus' : 'Driver'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          
          {activeTab === 'buses' ? (
            <>
              <input name="name" placeholder="Bus Name (e.g. Bus 1)" value={formData.name || ''} onChange={handleChange} required style={inputStyle} />
              <input name="plate" placeholder="License Plate" value={formData.plate || ''} onChange={handleChange} required style={inputStyle} />
              <input name="seat_capacity" type="number" placeholder="Capacity" value={formData.seat_capacity || ''} onChange={handleChange} required style={inputStyle} />
            </>
          ) : (
            <>
              <input name="name" placeholder="Driver Name" value={formData.name || ''} onChange={handleChange} required style={inputStyle} />
              <input name="username" placeholder="Username (Login)" value={formData.username || ''} onChange={handleChange} required style={inputStyle} />
              <input 
                name="password" 
                type="password" 
                placeholder={editingId ? "New Password (optional)" : "Password"} 
                value={formData.password || ''} 
                onChange={handleChange} 
                required={!editingId} 
                style={inputStyle} 
              />
              <select name="status" value={formData.status || 'active'} onChange={handleChange} style={inputStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>Default Bus</label>
                  <select name="default_bus" value={formData.default_bus || ''} onChange={handleChange} style={{...inputStyle, width: '100%'}}>
                    <option value="">-- No Default Bus --</option>
                    {allBuses.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.plate})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#666' }}>Default Routes</label>
                  <select 
                    name="default_routes" 
                    multiple 
                    value={formData.default_routes || []} 
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData(prev => ({ ...prev, default_routes: selected }));
                    }} 
                    style={{...inputStyle, width: '100%', height: '80px'}}
                  >
                    {allRoutes.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.window})</option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>Hold Cmd/Ctrl to select multiple.</div>
                </div>
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={btnStyle}>{editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{...btnStyle, background: '#999'}}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading ? <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th scope="col" style={{ padding: '15px' }}>Name</th>
                <th scope="col" style={{ padding: '15px' }}>Details</th>
                <th scope="col" style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}><strong>{item.name}</strong></td>
                  <td style={{ padding: '15px' }}>
                    {activeTab === 'buses' ? (
                      <span>Plate: <code>{item.plate}</code> | Seats: {item.seat_capacity}</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span>User: <code>{item.username}</code> | Status: <span style={{ color: item.status === 'active' ? 'green' : 'red' }}>{item.status}</span></span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          Default Bus: {item.default_bus ? allBuses.find(b => b.id === item.default_bus)?.name || 'Unknown' : <i>None</i>}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          Routes ({(item.default_routes || []).length}): {(item.default_routes && item.default_routes.length > 0) 
                            ? item.default_routes.map(rid => allRoutes.find(r => r.id === rid)?.name).filter(Boolean).join(', ') 
                            : <i>None</i>}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(item)} style={{ ...actionBtnStyle, color: '#2196f3' }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ ...actionBtnStyle, color: '#f44336' }}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' };
const btnStyle = { padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const actionBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' };

export default FleetManager;