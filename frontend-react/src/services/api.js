import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Institutes ───
export const instituteApi = {
  getAll:        ()           => api.get('/institutes'),
  getById:       (id)         => api.get(`/institutes/${id}`),
  getByName:     (name)       => api.get(`/institutes/name/${name}`),
  create:        (data)       => api.post('/institutes', data),
  update:        (id, data)   => api.put(`/institutes/${id}`, data),
  delete:        (id)         => api.delete(`/institutes/${id}`),
  exists:        (name)       => api.get(`/institutes/exists/${name}`),
};

// ─── Departments ───
export const departmentApi = {
  getAll:        ()           => api.get('/departments'),
  getById:       (id)         => api.get(`/departments/${id}`),
  getByName:     (name)       => api.get(`/departments/name/${name}`),
  getByInstitute:(instId)     => api.get(`/departments/institute/${instId}`),
  create:        (data)       => api.post('/departments', data),
  update:        (id, data)   => api.put(`/departments/${id}`, data),
  delete:        (id)         => api.delete(`/departments/${id}`),
  exists:        (name)       => api.get(`/departments/exists/${name}`),
};

// ─── Users ───
export const userApi = {
  getAll:        ()           => api.get('/users'),
  getById:       (id)         => api.get(`/users/${id}`),
  getByEmail:    (email)      => api.get(`/users/email/${email}`),
  getByDepartment:(deptId)    => api.get(`/users/department/${deptId}`),
  getByRole:     (role)       => api.get(`/users/role/${role}`),
  getActive:     ()           => api.get('/users/status/active'),
  getInactive:   ()           => api.get('/users/status/inactive'),
  create:        (data)       => api.post('/users', data),
  update:        (id, data)   => api.put(`/users/${id}`, data),
  delete:        (id)         => api.delete(`/users/${id}`),
  activate:      (id)         => api.put(`/users/${id}/activate`),
  deactivate:    (id)         => api.put(`/users/${id}/deactivate`),
  exists:        (email)      => api.get(`/users/exists/${email}`),
};

// ─── Venues ───
export const venueApi = {
  getAll:        ()           => api.get('/venues'),
  getById:       (id)         => api.get(`/venues/${id}`),
  getByName:     (name)       => api.get(`/venues/name/${name}`),
  getByDepartment:(deptId)    => api.get(`/venues/department/${deptId}`),
  create:        (data)       => api.post('/venues', data),
  update:        (id, data)   => api.put(`/venues/${id}`, data),
  delete:        (id)         => api.delete(`/venues/${id}`),
  exists:        (name)       => api.get(`/venues/exists/${name}`),
};

export default api;
