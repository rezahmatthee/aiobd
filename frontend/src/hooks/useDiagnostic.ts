import { useCallback, useEffect, useRef } from 'react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { diagnosticsAPI } from '../services/api';
import { wsService } from '../services/websocket';

export function useDiagnostic() {
  const {
    sessionId,
    selectedVehicle,
    dtcCodes,
    pidValues,
    isLoading,
    error,
    setDTCCodes,
    addPIDValue,
    setLoading,
    setError,
  } = useDiagnosticStore();

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDTCCodes = useCallback(async () => {
    if (!sessionId || !selectedVehicle) return;
    setLoading(true);
    try {
      const response = await diagnosticsAPI.getDTCCodes(selectedVehicle.id, sessionId);
      setDTCCodes(response.data.codes || []);
    } catch (err) {
      setError('Failed to fetch DTC codes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, selectedVehicle, setDTCCodes, setLoading, setError]);

  const startLiveDataPolling = useCallback(
    (mode: string, pid: string, intervalMs: number = 500) => {
      if (!sessionId || !selectedVehicle) return;
      stopLiveDataPolling();
      pollingRef.current = setInterval(async () => {
        try {
          const response = await diagnosticsAPI.getLiveData(selectedVehicle.id, {
            sessionId,
            mode,
            pid,
          });
          if (response.data.value) {
            addPIDValue(response.data.value);
          }
        } catch (err) {
          console.error('Live data error:', err);
        }
      }, intervalMs);
    },
    [sessionId, selectedVehicle, addPIDValue]
  );

  const stopLiveDataPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      wsService.subscribeToPIDUpdates(selectedVehicle.id, (data) => {
        addPIDValue(data as Parameters<typeof addPIDValue>[0]);
      });
    }
    return () => {
      if (selectedVehicle) {
        wsService.unsubscribeFromPIDUpdates(selectedVehicle.id);
      }
      stopLiveDataPolling();
    };
  }, [selectedVehicle, addPIDValue, stopLiveDataPolling]);

  return {
    dtcCodes,
    pidValues,
    isLoading,
    error,
    fetchDTCCodes,
    startLiveDataPolling,
    stopLiveDataPolling,
  };
}
