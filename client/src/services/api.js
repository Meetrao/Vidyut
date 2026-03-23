import { API } from '../context/AuthContext';

// Usage
export const getUsage = (params) => API.get('/usage', { params });
export const getStats = (params) => API.get('/usage/stats', { params });
export const getDaily = (params) => API.get('/usage/daily', { params });
export const getAnomalies = () => API.get('/usage/anomalies');
export const getRecommendations = () => API.get('/usage/recommendations');
export const addUsage = (data) => API.post('/usage', data);
export const uploadCSV = (formData) =>
  API.post('/usage/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteUsage = (id) => API.delete(`/usage/${id}`);
export const exportUsage = (params) =>
  API.get('/usage/export', { params, responseType: 'blob' });

// Alerts
export const getAlerts = () => API.get('/alerts');
export const createAlert = (data) => API.post('/alerts', data);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getUsers = () => API.get('/auth/users');
export const updateUserRole = (id, role) => API.patch(`/auth/users/${id}/role`, { role });
export const deleteUser = (id) => API.delete(`/auth/users/${id}`);
