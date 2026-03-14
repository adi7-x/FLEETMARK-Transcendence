// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
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
  getLoginUrl: () => apiCall('/v1/auth/42/login/'),
  
  // Get current user profile
  getProfile: () => apiCall('/v1/auth/me/'),
  
  // Update user profile
  updateProfile: (data) => apiCall('/v1/auth/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  // Get all users (admin only)
  getUsers: () => apiCall('/v1/auth/users/'),
  
  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Stations API
export const stations = {
  list: () => apiCall('/v1/stations/'),
  create: (data) => apiCall('/v1/stations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/v1/stations/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/stations/${id}/`, { method: 'DELETE' }),
};

// Buses API
export const buses = {
  list: () => apiCall('/v1/buses/'),
  create: (data) => apiCall('/v1/buses/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/v1/buses/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/buses/${id}/`, { method: 'DELETE' }),
};

// Drivers API
export const drivers = {
  list: () => apiCall('/v1/drivers/'),
  create: (data) => apiCall('/v1/drivers/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/v1/drivers/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/drivers/${id}/`, { method: 'DELETE' }),
};

// Trips API
export const trips = {
  list: () => apiCall('/v1/trips/'),
  available: (stationId) => apiCall(`/v1/trips/available/?station_id=${stationId}`),
  create: (data) => apiCall('/v1/trips/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/v1/trips/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/trips/${id}/`, { method: 'DELETE' }),
};

// Reservations API
export const reservations = {
  list: (userId = null) => {
    const endpoint = userId ? `/v1/reservations/?user_id=${userId}` : '/v1/reservations/';
    return apiCall(endpoint);
  },
  history: (userId = null) => {
    const endpoint = userId ? `/v1/reservations/history/?user_id=${userId}` : '/v1/reservations/history/';
    return apiCall(endpoint);
  },
  create: (data) => apiCall('/v1/reservations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => {
    return apiCall(`/v1/reservations/${id}/`, { method: 'DELETE' }); 
  },
  deleteWithUser: (id, userId) => apiCall(`/v1/reservations/${id}/?user_id=${userId}`, { method: 'DELETE' })
};

// Routes API
export const routes = {
  list: () => apiCall('/v1/routes/'),
  create: (data) => apiCall('/v1/routes/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  get: (id) => apiCall(`/v1/routes/${id}/`),
  update: (id, data) => apiCall(`/v1/routes/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/routes/${id}/`, { method: 'DELETE' }),
};

// Reports API
export const reports = {
  list: () => apiCall('/v1/reports/'),
  create: (data) => apiCall('/v1/reports/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => apiCall(`/v1/reports/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Users API (Staff only)
export const users = {
  list: () => apiCall('/v1/auth/users/'),
  get: (id) => apiCall(`/v1/auth/users/${id}/`),
  update: (id, data) => apiCall(`/v1/auth/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/auth/users/${id}/`, { method: 'DELETE' }),
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
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