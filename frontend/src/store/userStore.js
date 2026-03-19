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
    const { data } = await userAPI.getVehicles();
    set({ vehicles: data.vehicles });
  },

  fetchDiagnostics: async (params) => {
    const { data } = await userAPI.getDiagnostics(params);
    set({ diagnostics: data.diagnostics });
  },

  fetchStatistics: async () => {
    const { data } = await userAPI.getStatistics();
    set({ statistics: data.statistics });
  },

  fetchRecentActivity: async () => {
    const { data } = await userAPI.getRecentActivity();
    set({ recentActivity: data.activities });
  }
}));

export default useUserStore;
