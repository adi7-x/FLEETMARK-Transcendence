// src/components/StationManager.jsx
import React, { useState, useEffect } from 'react';
import { stations } from '../services/api';

const StationManager = () => {
  const [stationList, setStationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);

  // Load stations
  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await stations.list();
      setStationList(data);
      setError(null);
    } catch (err) {
      setError('Failed to load stations');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingId) {
        await stations.update(editingId, formData);
      } else {
        await stations.create(formData);
      }
      
      // Reset form and reload
      setFormData({ name: '' });
      setEditingId(null);
      fetchStations();
    } catch (err) {
      setError(err.message || 'Operation failed');
    }
  };

  // Handle edit click
  const handleEdit = (station) => {
    setFormData({ name: station.name });
    setEditingId(station.id);
  };

  // Handle delete click
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this station?')) return;
    
    try {
      await stations.delete(id);
      fetchStations();
    } catch (err) {
      setError(err.message || 'Failed to delete station');
    }
  };

  // Cancel edit
  const handleCancel = () => {
    setFormData({ name: '' });
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>📍 Station Management</h2>
        <button 
          onClick={fetchStations} 
          style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '4px' }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Form Section */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3 style={{ marginTop: 0 }}>{editingId ? '✏️ Edit Station' : '➕ Add New Station'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Station Name (e.g., Central Campus)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <button 
            type="submit" 
            style={{ 
              background: editingId ? '#ff9800' : '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={handleCancel}
              style={{ background: '#9e9e9e', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* List Section */}
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading stations...</div>
        ) : stationList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            No stations found. Create your first one above!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '15px' }}>Name</th>
                <th style={{ padding: '15px' }}>Created</th>
                <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stationList.map((station) => (
                <tr key={station.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '15px' }}><strong>{station.name}</strong></td>
                  <td style={{ padding: '15px', color: '#666', fontSize: '0.9em' }}>
                    {new Date(station.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEdit(station)}
                      style={{ marginRight: '10px', background: 'transparent', color: '#2196f3', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(station.id)}
                      style={{ background: 'transparent', color: '#f44336', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
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
    </div>
  );
};

export default StationManager;