/**
 * useAdvancedDiagnostics - Custom hooks for advanced OBD2 diagnostic features
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MonitorTest,
  VehicleInfo,
  FreezeFrame,
  MonitorTestsResponse,
  VehicleInfoResponse,
  FreezeFramesResponse,
} from '../types/advanced_diagnostic';

const API_BASE = '/api/diagnostics';

// Helper for API calls
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

/**
 * Hook for fetching and managing Mode $06 monitor test results
 */
export function useMonitorTests(vehicleId: string) {
  const [monitors, setMonitors] = useState<MonitorTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitors = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<MonitorTestsResponse>(
        `${API_BASE}/${vehicleId}/advanced/monitors`
      );
      setMonitors(data.monitors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitor tests');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const requestMonitors = useCallback(async (testId = 0) => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<MonitorTestsResponse>(
        `${API_BASE}/${vehicleId}/advanced/monitors`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testId }),
        }
      );
      setMonitors(data.monitors);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request monitor tests');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  return { monitors, loading, error, fetchMonitors, requestMonitors };
}

/**
 * Hook for fetching Mode $09 vehicle information
 */
export function useVehicleInfo(vehicleId: string) {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicleInfo = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<VehicleInfoResponse>(
        `${API_BASE}/${vehicleId}/advanced/info`
      );
      setVehicleInfo(data.info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vehicle info');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicleInfo();
  }, [fetchVehicleInfo]);

  return { vehicleInfo, loading, error, fetchVehicleInfo };
}

/**
 * Hook for freeze frame management
 */
export function useFreezeFrames(vehicleId: string) {
  const [freezeFrames, setFreezeFrames] = useState<FreezeFrame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFreezeFrames = useCallback(async () => {
    if (!vehicleId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJSON<FreezeFramesResponse>(
        `${API_BASE}/${vehicleId}/advanced/freeze-frames`
      );
      setFreezeFrames(data.freezeFrames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch freeze frames');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const clearFreezeFrame = useCallback(
    async (frameId: string) => {
      try {
        await fetchJSON(`${API_BASE}/${vehicleId}/advanced/freeze-frames/${frameId}`, {
          method: 'DELETE',
        });
        setFreezeFrames((prev) => prev.filter((f) => f.frameId !== frameId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear freeze frame');
      }
    },
    [vehicleId]
  );

  useEffect(() => {
    fetchFreezeFrames();
  }, [fetchFreezeFrames]);

  return { freezeFrames, loading, error, fetchFreezeFrames, clearFreezeFrame };
}
