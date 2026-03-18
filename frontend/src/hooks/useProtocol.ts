import { useCallback } from 'react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { ProtocolType, ProtocolStatus } from '../types/protocol';
import { diagnosticsAPI } from '../services/api';

export function useProtocol() {
  const {
    protocolType,
    protocolStatus,
    isConnected,
    selectedVehicle,
    setProtocol,
    setProtocolStatus,
    setConnected,
    setSessionId,
    setError,
    startSession,
    endSession,
  } = useDiagnosticStore();

  const connect = useCallback(
    async (port: string = '/dev/ttyUSB0') => {
      if (!selectedVehicle) {
        setError('No vehicle selected');
        return;
      }
      setProtocolStatus(ProtocolStatus.CONNECTING);
      try {
        const response = await diagnosticsAPI.connect({
          vehicleId: selectedVehicle.id,
          port,
          protocol: protocolType !== ProtocolType.AUTO ? protocolType : undefined,
        });
        setSessionId(response.data.sessionId);
        setConnected(true);
        setProtocolStatus(ProtocolStatus.CONNECTED);
        setProtocol(response.data.protocol as ProtocolType);
        startSession(selectedVehicle.id, response.data.protocol);
      } catch (err) {
        setProtocolStatus(ProtocolStatus.ERROR);
        setError('Failed to connect to vehicle');
        console.error(err);
      }
    },
    [selectedVehicle, protocolType, setProtocol, setProtocolStatus, setConnected, setSessionId, setError, startSession]
  );

  const disconnect = useCallback(() => {
    setConnected(false);
    setProtocolStatus(ProtocolStatus.DISCONNECTED);
    setSessionId(null);
    endSession();
  }, [setConnected, setProtocolStatus, setSessionId, endSession]);

  return {
    protocolType,
    protocolStatus,
    isConnected,
    connect,
    disconnect,
    setProtocol,
  };
}
