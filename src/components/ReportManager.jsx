import React, { useState, useEffect } from 'react';
import { reports } from '../services/api';

const ReportManager = () => {
  const [reportList, setReportList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resolveError, setResolveError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'resolved'

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reports.list();
      setReportList(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    setResolveError(null);
    try {
      await reports.update(id, { status: 'resolved' });
      loadReports();
    } catch (err) {
      setResolveError('Failed to update report status: ' + (err.message || 'unknown error'));
    }
  };

  const filteredReports = reportList.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getCategoryLabel = (cat) => {
    const labels = {
      'late': '🕒 Late',
      'no_show': '🚫 No Show',
      'full': '👥 Full',
      'accident': '⚠️ Accident',
      'other': '📝 Other'
    };
    return labels[cat] || cat;
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>📋 Incident Reports</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <button 
            onClick={loadReports}
            className="refresh-btn"
            style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}
      {resolveError && <div style={{ padding: '12px', background: '#fff3e0', color: '#e65100', borderRadius: '6px', marginBottom: '20px' }}>{resolveError}</div>}

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eee' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Reporter</th>
              <th style={{ padding: '15px' }}>Trip Info</th>
              <th style={{ padding: '15px' }}>Category</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                  No incident reports found for this filter.
                </td>
              </tr>
            ) : (
              filteredReports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '0.9rem' }}>{new Date(report.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(report.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold' }}>{report.reporter_name}</div>
                  </td>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    {report.trip_details ? (
                      <div>
                        <div style={{ fontWeight: '500' }}>{report.trip_details.route}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          Departure: {new Date(report.trip_details.departure).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>Bus: {report.trip_details.bus}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#999' }}>N/A</span>
                    )}
                  </td>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{getCategoryLabel(report.category)}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666', maxWidth: '300px' }}>{report.description}</div>
                  </td>
                  <td style={{ padding: '15px', verticalAlign: 'top' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      background: report.status === 'resolved' ? '#e8f5e9' : '#fff3e0',
                      color: report.status === 'resolved' ? '#2e7d32' : '#e65100',
                      border: `1px solid ${report.status === 'resolved' ? '#c8e6c9' : '#ffe0b2'}`
                    }}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'right', verticalAlign: 'top' }}>
                    {report.status === 'pending' && (
                      <button 
                        onClick={() => handleResolve(report.id)}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#00babc', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px', 
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportManager;
