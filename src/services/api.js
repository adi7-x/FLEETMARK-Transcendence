// src/services/api.js
// Base API url (include version, no trailing slash)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');

// Build absolute endpoint, avoiding duplicate slashes
const buildUrl = (endpoint) => {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${API_URL}/${cleanEndpoint}`;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('fleetmark_access') || localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
        const errorMessage = data.detail || data.error || 
        (typeof data === 'object' ? Object.values(data).flat().join(', ') : null) || 
        `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Authentication API
export const auth = {
  // Get OAuth login URL
  getLoginUrl: () => apiCall('auth/42/login/'),
  
  // Get current user profile
  getProfile: () => apiCall('auth/me/'),
  
  // Update user profile
  updateProfile: (data) => apiCall('auth/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  // Get all users (admin only)
  getUsers: () => apiCall('auth/users/'),
  
  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('fleetmark_access');
    localStorage.removeItem('fleetmark_refresh');
    localStorage.removeItem('fleetmark_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Stations API
export const stations = {
  list: () => apiCall('stations/'),
  create: (data) => apiCall('stations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`stations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`stations/${id}/`, { method: 'DELETE' }),
};

// Buses API
export const buses = {
  list: () => apiCall('buses/'),
  create: (data) => apiCall('buses/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`buses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`buses/${id}/`, { method: 'DELETE' }),
};

// Drivers API
export const drivers = {
  list: () => apiCall('drivers/'),
  create: (data) => apiCall('drivers/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`drivers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`drivers/${id}/`, { method: 'DELETE' }),
};

// Trips API
export const trips = {
  list: () => apiCall('trips/'),
  available: (stationId) => apiCall(`trips/available/?station_id=${stationId}`),
  create: (data) => apiCall('trips/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`trips/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`trips/${id}/`, { method: 'DELETE' }),
};

// Reservations API
export const reservations = {
  list: (userId = null) => {
    const endpoint = userId ? `reservations/?user_id=${userId}` : 'reservations/';
    return apiCall(endpoint);
  },
  history: (userId = null) => {
    const endpoint = userId ? `reservations/history/?user_id=${userId}` : 'reservations/history/';
    return apiCall(endpoint);
  },
  create: (data) => apiCall('reservations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => {
    return apiCall(`reservations/${id}/`, { method: 'DELETE' }); 
  },
  deleteWithUser: (id, userId) => apiCall(`reservations/${id}/?user_id=${userId}`, { method: 'DELETE' })
};

// Routes API
export const routes = {
  list: () => apiCall('routes/'),
  create: (data) => apiCall('routes/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  get: (id) => apiCall(`routes/${id}/`),
  update: (id, data) => apiCall(`routes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`routes/${id}/`, { method: 'DELETE' }),
};

// Reports API
export const reports = {
  list: () => apiCall('reports/'),
  create: (data) => apiCall('reports/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`reports/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Users API (Staff only)
export const users = {
  list: () => apiCall('auth/users/'),
  get: (id) => apiCall(`auth/users/${id}/`),
  update: (id, data) => apiCall(`auth/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`auth/users/${id}/`, { method: 'DELETE' }),
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!(localStorage.getItem('fleetmark_access') || localStorage.getItem('access_token'));
};

// Get user role from stored data
export const getUserRole = async () => {
  try {
    const user = await auth.getProfile();
    return user.role;
  } catch {
    return null;
  }
};