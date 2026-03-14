// src/App.jsx
import React, { useEffect, useState } from 'react';
import AuthCallback from './components/AuthCallback';
import  StationManager from './components/StationManager';
import  FleetManager from './components/FleetManager';
import RouteManager from './components/RouteManager';
import UserManager from './components/UserManager';
import TripManager from './components/TripManager';
import ReservationManager from './components/ReservationManager';
import StudentTrips from './components/StudentTrips';
import StudentReservations from './components/StudentReservations';
import ReportManager from './components/ReportManager';
import { auth, isAuthenticated } from './services/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

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
    setCurrentView('dashboard');
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#f8f9fa',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚌</div>
          <h2>Loading SSBS...</h2>
        </div>
      </div>
    );
  }

  // Show user dashboard if logged in
  if (user) {
    const cardStyle = {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #eaeaea',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '160px'
    };

    const buttonStyle = {
      width: '100%',
      padding: '10px',
      background: '#00babc',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      marginTop: '15px'
    };

    return (
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          padding: '20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>🚌 SSBS Dashboard</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
              Welcome back, <strong>{user.login_42}</strong>
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              background: user.role === 'STUDENT' ? '#e3f2fd' : '#f3e5f5',
              color: user.role === 'STUDENT' ? '#1565c0' : '#7b1fa2',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'inline-block',
              marginBottom: '10px'
            }}>
              {user.role}
            </span>
            <div>
              <button 
                onClick={handleLogout}
                style={{ 
                  background: 'transparent',
                  color: '#ff4444', 
                  border: '1px solid #ff4444', 
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main>
          {currentView === 'stations' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <StationManager />
            </div>
          ) : currentView === 'fleet' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <FleetManager />
            </div>
          ) : currentView === 'routes' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <RouteManager />
            </div>
          ) : currentView === 'users' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <UserManager />
            </div>
          ) : currentView === 'trips' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <TripManager />
            </div>
          ) : currentView === 'reservations' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <ReservationManager />
            </div>
          ) : currentView === 'staff-reports' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <ReportManager />
            </div>
          ) : currentView === 'student-trips' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <StudentTrips user={user} onProfileUpdate={loadProfile} />
            </div>
          ) : currentView === 'student-reservations' ? (
            <div>
              <button 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                  marginBottom: '20px', 
                  padding: '8px 16px', 
                  background: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ← Back to Dashboard
              </button>
              <StudentReservations user={user} />
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '24px',
              marginBottom: '30px'
            }}>
              {user.role === 'STUDENT' ? (
                <>
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>📍 My Station</h3>
                      <p style={{ fontSize: '1.1rem', color: '#666' }}>
                        {user.station_name || 'Not assigned yet'}
                      </p>
                    </div>
                  </div>
                  
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>🎫 My Reservations</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Check your upcoming trips</p>
                    </div>
                    <button onClick={() => setCurrentView('student-reservations')} style={buttonStyle}>View Reservations</button>
                  </div>
                  
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>🚌 Available Trips</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Book a new trip</p>
                    </div>
                    <button onClick={() => setCurrentView('student-trips')} style={buttonStyle}>Browse Trips</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>👥 User Management</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Manage students and staff</p>
                    </div>
                    <button onClick={() => setCurrentView('users')} style={buttonStyle}>Manage Users</button>
                  </div>
                  
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>📍 Stations</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Add or remove bus stops</p>
                    </div>
                    <button onClick={() => setCurrentView('stations')} style={buttonStyle}>Manage Stations</button>
                  </div>
                  
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>🚌 Fleet Management</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Track buses and drivers</p>
                    </div>
                    <button onClick={() => setCurrentView('fleet')} style={buttonStyle}>Manage Fleet</button>
                  </div>
                  
                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>🎫 Reservations</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Monitor all bookings</p>
                    </div>
                    <button onClick={() => setCurrentView('reservations')} style={buttonStyle}>View All</button>
                  </div>

                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>🗺️ Route Management</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Define and order route stops</p>
                    </div>
                    <button onClick={() => setCurrentView('routes')} style={buttonStyle}>Manage Routes</button>
                  </div>

                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>📅 Trip Scheduling</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Schedule shuttle runs</p>
                    </div>
                    <button onClick={() => setCurrentView('trips')} style={buttonStyle}>Schedule Trips</button>
                  </div>

                  <div style={cardStyle}>
                    <div>
                      <h3 style={{ marginTop: 0, color: '#444' }}>📋 Incident Reports</h3>
                      <p style={{ color: '#888', fontSize: '0.9rem' }}>Review student issues</p>
                    </div>
                    <button onClick={() => setCurrentView('staff-reports')} style={buttonStyle}>View Reports</button>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Show login page
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: '#f0f2f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
        maxWidth: '400px', 
        width: '90%',
        textAlign: 'center' 
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🚌</div>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>SSBS</h1>
        <h2 style={{ margin: '0 0 30px 0', fontSize: '1.2rem', color: '#666', fontWeight: '400' }}>Smart School Bus System</h2>
        
        <div style={{ margin: '30px 0' }}>
          <p style={{ color: '#555', marginBottom: '25px', lineHeight: '1.5' }}>
            Welcome! Please log in with your 42 Intra account to access the dashboard.
          </p>
          
          {error && (
            <div style={{ 
              background: '#ffebee', 
              color: '#c62828', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid #ffcdd2'
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
              padding: '12px 24px',
              fontSize: '1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 186, 188, 0.2)',
              transition: 'transform 0.1s',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔐 Login with 42 Intra
          </button>
        </div>
        
        <div style={{ 
          borderTop: '1px solid #eee', 
          paddingTop: '20px', 
          marginTop: '30px',
          textAlign: 'left' 
        }}>
          <p style={{ fontSize: '0.85rem', color: '#888', fontWeight: '600', marginBottom: '10px' }}>Features:</p>
          <ul style={{ 
            fontSize: '0.85rem', 
            color: '#666', 
            paddingLeft: '20px', 
            margin: 0,
            lineHeight: '1.6'
          }}>
            <li>Station management & Bus scheduling</li>
            <li>Trip reservations & Booking</li>
            <li>Role-based access control</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;