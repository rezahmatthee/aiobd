import { create } from 'zustand';
import { superadminAPI } from '../services/api';

const useSuperAdminStore = create((set) => ({
  metrics: null,
  admins: [],
  systemHealth: null,
  securityAudit: [],
  loading: false,
  error: null,

  fetchMetrics: async () => {
    set({ loading: true });
    try {
      const { data } = await superadminAPI.getDashboard();
      set({ metrics: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load metrics', loading: false });
    }
  },

  fetchAdmins: async () => {
    try {
      const { data } = await superadminAPI.getAdmins();
      set({ admins: data.admins });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load admins' });
    }
  },

  createAdmin: async (adminData) => {
    try {
      const { data } = await superadminAPI.createAdmin(adminData);
      set(state => ({ admins: [...state.admins, data.admin] }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create admin' });
    }
  },

  removeAdmin: async (id) => {
    try {
      await superadminAPI.removeAdmin(id);
      set(state => ({ admins: state.admins.filter(a => a._id !== id) }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to remove admin' });
    }
  },

  fetchSystemHealth: async () => {
    try {
      const { data } = await superadminAPI.getSystemHealth();
      set({ systemHealth: data.health });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load system health' });
    }
  },

  fetchSecurityAudit: async (params) => {
    try {
      const { data } = await superadminAPI.getSecurityAudit(params);
      set({ securityAudit: data.logs });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load security audit' });
    }
  },

  triggerBackup: async () => {
    try {
      const { data } = await superadminAPI.triggerBackup();
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Backup failed' });
      throw err;
    }
  }
}));

export default useSuperAdminStore;
