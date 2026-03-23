import React, { useState, useEffect } from 'react';
import { users, stations } from '../services/api';

const UserManager = () => {
  const [userList, setUserList] = useState([]);
  const [stationList, setStationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: 'STUDENT',
    station: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [uData, sData] = await Promise.all([users.list(), stations.list()]);
      setUserList(uData);
      setStationList(sData);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
    setLoading(false);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      station: user.station || '',
      is_active: user.is_active,
    });
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        role: editForm.role,
        station: editForm.station || null,
        is_active: editForm.is_active,
      };
      await users.update(editingUser.id, payload);
      setSuccess(`User ${editingUser.login_42} updated successfully.`);
      setEditingUser(null);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (id, login) => {
    if (!window.confirm(`Are you sure you want to delete user ${login}?`)) return;
    setLoading(true);
    setError(null);
    try {
      await users.delete(id);
      setSuccess(`User ${login} deleted successfully.`);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
    setLoading(false);
  };

  if (loading && userList.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>👥 User Management</h2>
      </div>

      {error && <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ffcdd2' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px', border: '1px solid #c8e6c9' }}>{success}</div>}

      {editingUser ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit User: {editingUser.login_42}</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Email: {editingUser.email}</p>
          
          <form onSubmit={handleUpdateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Role</label>
                <select 
                  value={editForm.role}
                  onChange={e => setEditForm({...editForm, role: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LOGISTICS_STAFF">LOGISTICS_STAFF</option>
                  <option value="DRIVER">DRIVER</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Assigned Station</label>
                <select 
                  value={editForm.station}
                  onChange={e => setEditForm({...editForm, station: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="">-- None --</option>
                  {stationList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500', cursor: 'pointer', marginTop: '10px' }}>
                  <input 
                    type="checkbox" 
                    checked={editForm.is_active}
                    onChange={e => setEditForm({...editForm, is_active: e.target.checked})}
                    style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                  />
                  Account Active
                </label>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '5px' }}>
                  Uncheck to disable the user's login access.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button 
                type="button" 
                onClick={cancelEdit}
                style={{ padding: '10px 16px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                style={{ padding: '10px 24px', background: '#00babc', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #eaeaea' }}>
          {userList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
              No users found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>42 Login</th>
                    <th style={{ padding: '15px' }}>Role</th>
                    <th style={{ padding: '15px' }}>Station</th>
                    <th style={{ padding: '15px' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: '500', color: '#333' }}>{user.login_42}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          background: user.role === 'LOGISTICS_STAFF' ? '#f3e5f5' : user.role === 'DRIVER' ? '#fff3e0' : '#e3f2fd',
                          color: user.role === 'LOGISTICS_STAFF' ? '#7b1fa2' : user.role === 'DRIVER' ? '#e65100' : '#1565c0',
                          fontWeight: '500'
                        }}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '15px', color: '#555' }}>
                        {user.station ? user.station_name : <span style={{ color: '#aaa', fontStyle: 'italic' }}>Unassigned</span>}
                      </td>
                      <td style={{ padding: '15px' }}>
                        {user.is_active ? (
                          <span style={{ color: '#2e7d32', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#4caf50', borderRadius: '50%' }}></span>
                            Active
                          </span>
                        ) : (
                          <span style={{ color: '#c62828', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#f44336', borderRadius: '50%' }}></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '15px', textAlign: 'right' }}>
                        <button 
                          onClick={() => startEdit(user)}
                          style={{ marginRight: '10px', padding: '6px 12px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.login_42)}
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

export default UserManager;
