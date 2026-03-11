// src/App.jsx
import React, { useEffect, useState } from 'react';
import AuthCallback from './components/AuthCallback';
import { auth, isAuthenticated } from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle login - redirect to 42 OAuth
  const handleLogin = async () => {
    try {
      const data = await auth.getLoginUrl();
      console.log('OAuth URL received:', data.authorization_url);
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error('Error fetching OAuth URL:', err);
      setError('Failed to start login flow.');
    }
  };

  // Handle successful authentication
  const handleAuth = (userData) => {
    setUser(userData);
    setError(null);
  };

  // Load user profile on app start
  const loadProfile = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      const userData = await auth.getProfile();
      setUser(userData);
    } catch (err) {
      console.error('Error loading profile:', err);
      auth.logout(); // Clear invalid tokens
    }
    setLoading(false);
  };

  // Handle logout
  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Show callback handler if on callback route
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback onAuth={handleAuth} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  // Show user dashboard if logged in
  if (user) {
    return (
      <div style={{ padding: 20 }}>
        <header style={{ borderBottom: '1px solid #ddd', paddingBottom: 15, marginBottom: 20 }}>
          <h1>🚌 SSBS Dashboard</h1>
          <p>Welcome back, <strong>{user.login_42}</strong>!</p>
          <p>Role: <span style={{ 
            background: user.role === 'STUDENT' ? '#e3f2fd' : '#f3e5f5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.9em'
          }}>{user.role}</span></p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
          {user.role === 'STUDENT' ? (
            <>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>📍 My Station</h3>
                <p>{user.station || 'Not assigned'}</p>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>🎫 My Reservations</h3>
                <button onClick={() => alert('Load reservations')}>View Reservations</button>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>🚌 Available Trips</h3>
                <button onClick={() => alert('Load trips')}>Browse Trips</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>👥 Users</h3>
                <button onClick={() => alert('Load users')}>Manage Users</button>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>📍 Stations</h3>
                <button onClick={() => alert('Load stations')}>Manage Stations</button>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>🚌 Fleet</h3>
                <button onClick={() => alert('Load buses')}>Manage Buses</button>
              </div>
              
              <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
                <h3>🎫 All Reservations</h3>
                <button onClick={() => alert('Load all reservations')}>View All</button>
              </div>
            </>
          )}
        </div>

        <div style={{ marginTop: 30, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
          <h4>User Profile:</h4>
          <pre style={{ fontSize: '0.8em', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={handleLogout} style={{ 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show login page
  return (
    <div style={{ padding: 20, textAlign: 'center', maxWidth: 600, margin: '50px auto' }}>
      <h1>🚌 SSBS</h1>
      <h2>Smart School Bus System</h2>
      
      <div style={{ margin: '40px 0' }}>
        <p>Welcome! Please log in with your 42 Intra account to access the system.</p>
        
        {error && (
          <div style={{ 
            background: '#ffebee', 
            color: '#c62828', 
            padding: 10, 
            borderRadius: 5, 
            margin: '20px 0' 
          }}>
            {error}
          </div>
        )}
        
        <button 
          onClick={handleLogin}
          style={{
            background: '#00babc',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            fontSize: '16px',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🔐 Login with 42 Intra
        </button>
      </div>
      
      <div style={{ fontSize: '0.9em', color: '#666', marginTop: 40 }}>
        <p>Features:</p>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li>📍 Station management</li>
          <li>🚌 Bus scheduling</li>
          <li>🎫 Trip reservations</li>
          <li>👥 Role-based access control</li>
        </ul>
      </div>
    </div>
  );
};

export default App;