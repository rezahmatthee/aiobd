import { create } from 'zustand';
import { adminAPI } from '../services/api';

const useAdminStore = create((set) => ({
  dashboard: null,
  users: [],
  totalUsers: 0,
  currentPage: 1,
  activityLogs: [],
  analytics: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const { data } = await adminAPI.getDashboard();
      set({ dashboard: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load', loading: false });
    }
  },

  fetchUsers: async (params) => {
    set({ loading: true });
    try {
      const { data } = await adminAPI.getUsers(params);
      set({ users: data.users, totalUsers: data.total, currentPage: data.page, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load users', loading: false });
    }
  },

  updateUser: async (id, updates) => {
    const { data } = await adminAPI.updateUser(id, updates);
    set(state => ({ users: state.users.map(u => u._id === id ? data.user : u) }));
  },

  deleteUser: async (id) => {
    await adminAPI.deleteUser(id);
    set(state => ({ users: state.users.filter(u => u._id !== id) }));
  },

  changeRole: async (id, role) => {
    const { data } = await adminAPI.changeRole(id, role);
    set(state => ({ users: state.users.map(u => u._id === id ? data.user : u) }));
  },

  fetchActivityLog: async (params) => {
    const { data } = await adminAPI.getActivityLog(params);
    set({ activityLogs: data.logs });
  },

  fetchAnalytics: async () => {
    const { data } = await adminAPI.getAnalytics();
    set({ analytics: data });
  }
}));

export default useAdminStore;
