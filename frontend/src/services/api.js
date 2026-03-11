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
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || data.error || `HTTP ${response.status}`);
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

// Trips API
export const trips = {
  list: () => apiCall('/v1/trips/'),
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
  create: (data) => apiCall('/v1/reservations/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id) => apiCall(`/v1/reservations/${id}/`, { method: 'DELETE' }),
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