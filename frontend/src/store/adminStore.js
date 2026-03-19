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
    try {
      const { data } = await adminAPI.updateUser(id, updates);
      set(state => ({ users: state.users.map(u => u._id === id ? data.user : u) }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update user' });
    }
  },

  deleteUser: async (id) => {
    try {
      await adminAPI.deleteUser(id);
      set(state => ({ users: state.users.filter(u => u._id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete user' });
    }
  },

  changeRole: async (id, role) => {
    try {
      const { data } = await adminAPI.changeRole(id, role);
      set(state => ({ users: state.users.map(u => u._id === id ? data.user : u) }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to change role' });
    }
  },

  fetchActivityLog: async (params) => {
    try {
      const { data } = await adminAPI.getActivityLog(params);
      set({ activityLogs: data.logs });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load activity log' });
    }
  },

  fetchAnalytics: async () => {
    try {
      const { data } = await adminAPI.getAnalytics();
      set({ analytics: data });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load analytics' });
    }
  }
}));

export default useAdminStore;
