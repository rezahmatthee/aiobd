import { create } from 'zustand';
import { userAPI } from '../services/api';

const useUserStore = create((set) => ({
  dashboard: null,
  vehicles: [],
  diagnostics: [],
  statistics: null,
  recentActivity: [],
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const { data } = await userAPI.getDashboard();
      set({ dashboard: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load dashboard', loading: false });
    }
  },

  fetchVehicles: async () => {
    try {
      const { data } = await userAPI.getVehicles();
      set({ vehicles: data.vehicles });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load vehicles' });
    }
  },

  fetchDiagnostics: async (params) => {
    try {
      const { data } = await userAPI.getDiagnostics(params);
      set({ diagnostics: data.diagnostics });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load diagnostics' });
    }
  },

  fetchStatistics: async () => {
    try {
      const { data } = await userAPI.getStatistics();
      set({ statistics: data.statistics });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load statistics' });
    }
  },

  fetchRecentActivity: async () => {
    try {
      const { data } = await userAPI.getRecentActivity();
      set({ recentActivity: data.activities });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load activity' });
    }
  }
}));

export default useUserStore;
