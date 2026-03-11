// src/components/AuthCallback.jsx
import React, { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AuthCallback = ({ onAuth }) => {
  useEffect(() => {
    const handleCallback = async () => {
      // Check if tokens are in URL hash (backend redirect method)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access = params.get('access');
      const refresh = params.get('refresh');
      const role = params.get('role');
      const login = params.get('login');

      if (access && refresh) {
        console.log('OAuth tokens received:', { role, login });
        
        // Store JWT tokens
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        // Clean the URL
        window.history.replaceState({}, '', '/');
        
        // Fetch full profile and notify parent
        try {
          const response = await fetch(`${API_URL}/v1/auth/me/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          
          if (response.ok) {
            const userData = await response.json();
            onAuth(userData);
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        // Fallback: check for authorization code in URL params
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          try {
            const response = await fetch(
              `${API_URL}/v1/auth/42/callback/?code=${encodeURIComponent(code)}`
            );
            const data = await response.json();
            
            if (response.ok) {
              localStorage.setItem('access_token', data.access);
              localStorage.setItem('refresh_token', data.refresh);
              window.history.replaceState({}, '', '/');
              onAuth(data.user);
            } else {
              console.error('OAuth callback failed:', data);
            }
          } catch (error) {
            console.error('Callback error:', error);
          }
        }
      }
    };

    handleCallback();
  }, [onAuth]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>🔐 Processing Login...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
};

export default AuthCallback;