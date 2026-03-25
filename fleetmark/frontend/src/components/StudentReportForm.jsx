import React, { useState } from 'react';
import { reports } from '../services/api';

const StudentReportForm = ({ trip, onComplete, onCancel }) => {
  const [category, setCategory] = useState('late');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await reports.create({
        trip: trip.id,
        category: category,
        description: description
      });
      onComplete();
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      background: '#fff', 
      padding: '24px', 
      borderRadius: '12px', 
      border: '1px solid #eee',
      boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🚩 Report Issue
      </h3>
      
      <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', fontSize: '0.9rem' }}>
        <strong>Trip:</strong> {trip.route_name} at {new Date(trip.departure_datetime).toLocaleTimeString()}
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            What happened?
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          >
            <option value="late">Bus is Late</option>
            <option value="no_show">Bus Did Not Show Up</option>
            <option value="full">Bus was Full</option>
            <option value="accident">Accident / Breakdown</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            Additional Details (Optional)
          </label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us more about what happened..."
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              minHeight: '80px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            style={{ 
              padding: '10px 16px', 
              background: 'none', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              background: '#333', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentReportForm;
