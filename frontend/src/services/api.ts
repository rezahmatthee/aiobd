import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const vehiclesAPI = {
  getAll: () => api.get('/vehicles'),
  create: (data: { make: string; model: string; year: number; vin?: string }) =>
    api.post('/vehicles', data),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

export const diagnosticsAPI = {
  connect: (data: { vehicleId: string; port: string; protocol?: string }) =>
    api.post('/diagnostics/connect', data),
  getLiveData: (vehicleId: string, params: { sessionId: string; mode: string; pid: string }) =>
    api.get(`/diagnostics/live/${vehicleId}`, { params }),
  getDTCCodes: (vehicleId: string, sessionId: string) =>
    api.get(`/diagnostics/codes/${vehicleId}`, { params: { sessionId } }),
  clearDTCCodes: (vehicleId: string) =>
    api.post(`/diagnostics/clear/${vehicleId}`),
};

export default api;
