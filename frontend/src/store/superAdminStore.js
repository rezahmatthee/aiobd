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
    const { data } = await superadminAPI.getAdmins();
    set({ admins: data.admins });
  },

  createAdmin: async (adminData) => {
    const { data } = await superadminAPI.createAdmin(adminData);
    set(state => ({ admins: [...state.admins, data.admin] }));
  },

  removeAdmin: async (id) => {
    await superadminAPI.removeAdmin(id);
    set(state => ({ admins: state.admins.filter(a => a._id !== id) }));
  },

  fetchSystemHealth: async () => {
    const { data } = await superadminAPI.getSystemHealth();
    set({ systemHealth: data.health });
  },

  fetchSecurityAudit: async (params) => {
    const { data } = await superadminAPI.getSecurityAudit(params);
    set({ securityAudit: data.logs });
  },

  triggerBackup: async () => {
    const { data } = await superadminAPI.triggerBackup();
    return data;
  }
}));

export default useSuperAdminStore;
