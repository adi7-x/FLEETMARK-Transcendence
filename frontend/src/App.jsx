// src/App.jsx
import React, { useEffect, useState } from 'react';

// ── Vite env vars (VITE_ prefix, accessed via import.meta.env) ──────────────
// VITE_API_URL is set in docker-compose.yml → "http://localhost:8000/api"
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const App = () => {
  const [user, setUser] = useState(null);       // logged-in user profile
  const [loading, setLoading] = useState(false); // callback in progress
  const [error, setError] = useState(null);      // error message

  // ── Step 1: Ask backend for the 42 OAuth authorization URL ────────────
  const handleLogin = async () => {
    try {
      // GET /api/v1/auth/42/login/ → returns { authorization_url: "https://api.intra.42.fr/..." }
      const response = await fetch(`${API_URL}/v1/auth/42/login/`);
      const data = await response.json();
      console.log('OAuth URL received:', data.authorization_url);

      // Redirect the browser to 42 Intra login page
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error('Error fetching OAuth URL:', err);
      setError('Failed to start login flow.');
    }
  };

  // ── Step 2: Handle the callback ───────────────────────────────────────
  // After 42 auth, the backend redirects here with tokens in the URL hash:
  //   /auth/callback#access=JWT&refresh=JWT&role=STUDENT&login=adbourji
  // We parse the hash fragment, store tokens, and load the profile.
  const handleCallback = async () => {
    // Parse tokens from URL hash (fragment) — e.g. #access=xxx&refresh=yyy
    const hash = window.location.hash.substring(1); // remove leading #
    const params = new URLSearchParams(hash);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const role = params.get('role');
    const login = params.get('login');

    if (access && refresh) {
      console.log('Tokens received via hash:', { role, login });

      // Store JWT tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Clean the URL
      window.history.replaceState({}, '', '/');

      // Fetch full profile using the JWT
      await fetchProfile();
    } else {
      // Fallback: maybe code is in query params (frontend-handled flow)
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        setLoading(true);
        try {
          const response = await fetch(
            `${API_URL}/v1/auth/42/callback/?code=${encodeURIComponent(code)}`
          );
          const data = await response.json();
          console.log('Callback response:', data);

          if (!response.ok) {
            setError(data.error || 'Login failed.');
            if (data.detail) console.error('42 said:', data.detail);
            setLoading(false);
            return;
          }

          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setUser(data.user);
          window.history.replaceState({}, '', '/');
        } catch (err) {
          console.error('Callback error:', err);
          setError('Callback failed — check console.');
        }
        setLoading(false);
      }
    }
  };

  // ── Fetch profile using stored JWT (on page reload) ───────────────────
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      // GET /api/v1/auth/me/ with Authorization: Bearer <jwt>
      const response = await fetch(`${API_URL}/v1/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Profile loaded:', data);
        setUser(data);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  // On mount: check if we're on the callback path, or try loading profile
  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      handleCallback();
    } else {
      fetchProfile();
    }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) return <h2>Logging in with 42 ...</h2>;

  if (user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Welcome, {user.login_42}!</h1>
        <h3>Role: {user.role}</h3>
        <pre style={{ background: '#f4f4f4', padding: 12 }}>
          {JSON.stringify(user, null, 2)}
        </pre>
        <p>
          Dashboard: {user.role === 'STUDENT'
            ? '/student/dashboard'
            : '/staff/dashboard'}
        </p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>SSBS — Smart School Bus System</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogin}>Login with 42 Intra</button>
    </div>
  );
};

export default App;