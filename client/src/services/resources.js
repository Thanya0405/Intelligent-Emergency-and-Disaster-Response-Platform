import api from './api';

export const emergencyApi = {
  trigger: (data) => api.post('/emergency/trigger', data),
  getById: (id) => api.get(`/emergency/${id}`),
  getHistory: (params) => api.get('/emergency/history', { params }),
  getActive: () => api.get('/emergency/active'),
  updateStatus: (id, data) => api.put(`/emergency/${id}/status`, data),
};

export const hospitalApi = {
  getNearby: (lat, lng, radius) => api.get('/hospitals/nearby', { params: { lat, lng, radius } }),
  getAll: (params) => api.get('/hospitals', { params }),
};

export const alertApi = {
  getAll: (params) => api.get('/alerts', { params }),
  getByRegion: (region) => api.get(`/alerts/${region}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
};

export const familyApi = {
  getAll: () => api.get('/family'),
  add: (data) => api.post('/family', data),
  update: (id, data) => api.put(`/family/${id}`, data),
  updateStatus: (id, data) => api.put(`/family/${id}/status`, data),
  delete: (id) => api.delete(`/family/${id}`),
};

export const aiApi = {
  firstAid: (message, history) => api.post('/ai/first-aid', { message, history }),
  accidentAnalysis: (sensorData) => api.post('/ai/accident-analysis', { sensorData }),
  disasterRisk: (regionData) => api.post('/ai/disaster-risk', regionData),
  hospitalRecommendation: (condition, hospitals) => api.post('/ai/hospital-recommendation', { condition, hospitals }),
  safetyRecommendations: () => api.post('/ai/safety-recommendations'),
  generateReport: (data) => api.post('/ai/generate-report', data),
};

export const reportApi = {
  getAll: (params) => api.get('/reports', { params }),
  generate: (data) => api.post('/reports/generate', data),
  getById: (id) => api.get(`/reports/${id}`),
};

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  updateAlert: (id, data) => api.put(`/admin/alerts/${id}`, data),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  updateEmergencyContacts: (contacts) => api.post('/users/emergency-contacts', { emergencyContacts: contacts }),
};
