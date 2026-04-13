import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  health: () => api.get('/auth/health'),
};

// ==================== INSTITUTES ====================
export const instituteAPI = {
  getAll: () => api.get('/institutes'),
  getById: (id) => api.get(`/institutes/${id}`),
  getByName: (name) => api.get(`/institutes/name/${name}`),
  create: (data) => api.post('/institutes', data),
  update: (id, data) => api.put(`/institutes/${id}`, data),
  delete: (id) => api.delete(`/institutes/${id}`),
  existsByName: (name) => api.get(`/institutes/exists/${name}`),
};

// ==================== DEPARTMENTS ====================
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  getByName: (name) => api.get(`/departments/name/${name}`),
  getByInstitute: (instituteId) => api.get(`/departments/institute/${instituteId}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
  existsByName: (name) => api.get(`/departments/exists/${name}`),
};

// ==================== USERS ====================
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  getByDepartment: (departmentId) => api.get(`/users/department/${departmentId}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  getActive: () => api.get('/users/status/active'),
  getInactive: () => api.get('/users/status/inactive'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
  existsByEmail: (email) => api.get(`/users/exists/${email}`),
};

// ==================== VENUES ====================
export const venueAPI = {
  getAll: () => api.get('/venues'),
  getById: (id) => api.get(`/venues/${id}`),
  getByName: (name) => api.get(`/venues/name/${name}`),
  getByInstitute: (instituteId) => api.get(`/venues/institute/${instituteId}`),
  create: (data) => api.post('/venues', data),
  update: (id, data) => api.put(`/venues/${id}`, data),
  delete: (id) => api.delete(`/venues/${id}`),
  existsByName: (name) => api.get(`/venues/exists/${name}`),
};

// ==================== EVENTS ====================
export const eventAPI = {
  getAll: () => api.get('/events'),
  getActive: () => api.get('/events/active'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  checkConflict: (data) => api.post('/events/check-conflict', data),
  searchByTitle: (title) => api.get('/events/search/title', { params: { title } }),
  searchByLocation: (location) => api.get('/events/search/location', { params: { location } }),
  searchByDateRange: (start, end) => api.get('/events/search/date-range', { params: { start, end } }),
  countActive: () => api.get('/events/count/active'),
};

export default api;
