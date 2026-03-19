import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('token', data.token);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken })
};

export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  getVehicles: () => api.get('/user/vehicles'),
  getDiagnostics: (params) => api.get('/user/diagnostics', { params }),
  getDiagnostic: (id) => api.get(`/user/diagnostics/${id}`),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getSettings: () => api.get('/user/settings'),
  updateSettings: (data) => api.put('/user/settings', data),
  getRecentActivity: () => api.get('/user/recent-activity'),
  getStatistics: () => api.get('/user/statistics')
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeRole: (id, role) => api.post(`/admin/users/${id}/role-change`, { role }),
  getActivityLog: (params) => api.get('/admin/activity-log', { params }),
  getAnalytics: () => api.get('/admin/analytics')
};

export const superadminAPI = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  getAdmins: () => api.get('/superadmin/admins'),
  createAdmin: (data) => api.post('/superadmin/admins', data),
  removeAdmin: (id) => api.delete(`/superadmin/admins/${id}`),
  getSystemHealth: () => api.get('/superadmin/system-health'),
  getSecurityAudit: (params) => api.get('/superadmin/security-audit', { params }),
  triggerBackup: () => api.post('/superadmin/system/backup'),
  toggleMaintenance: (enabled) => api.post('/superadmin/system/maintenance', { enabled })
};

export default api;
