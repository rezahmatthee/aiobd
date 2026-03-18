import { create } from 'zustand';
import { ProtocolType, ProtocolStatus } from '../types/protocol';
import { DiagnosticSession, DTCCode, Vehicle, DiagnosticSessionStatus } from '../types/diagnostic';
import { PIDValue } from '../types/pid';

interface DiagnosticStore {
  // Connection
  isConnected: boolean;
  protocolType: ProtocolType;
  protocolStatus: ProtocolStatus;
  sessionId: string | null;

  // Vehicle
  selectedVehicle: Vehicle | null;
  vehicles: Vehicle[];

  // Diagnostic data
  currentSession: DiagnosticSession | null;
  pidValues: PIDValue[];
  dtcCodes: DTCCode[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setProtocol: (protocol: ProtocolType) => void;
  setProtocolStatus: (status: ProtocolStatus) => void;
  setConnected: (connected: boolean) => void;
  setSessionId: (id: string | null) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  addPIDValue: (value: PIDValue) => void;
  setPIDValues: (values: PIDValue[]) => void;
  setDTCCodes: (codes: DTCCode[]) => void;
  setCurrentSession: (session: DiagnosticSession | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearDiagnosticData: () => void;
  startSession: (vehicleId: string, protocol: ProtocolType) => void;
  endSession: () => void;
}

export const useDiagnosticStore = create<DiagnosticStore>((set) => ({
  isConnected: false,
  protocolType: ProtocolType.AUTO,
  protocolStatus: ProtocolStatus.DISCONNECTED,
  sessionId: null,
  selectedVehicle: null,
  vehicles: [],
  currentSession: null,
  pidValues: [],
  dtcCodes: [],
  isLoading: false,
  error: null,

  setProtocol: (protocol) => set({ protocolType: protocol }),
  setProtocolStatus: (status) => set({ protocolStatus: status }),
  setConnected: (connected) => set({ isConnected: connected }),
  setSessionId: (id) => set({ sessionId: id }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setVehicles: (vehicles) => set({ vehicles }),
  addPIDValue: (value) =>
    set((state) => ({
      pidValues: [value, ...state.pidValues.slice(0, 99)],
    })),
  setPIDValues: (values) => set({ pidValues: values }),
  setDTCCodes: (codes) => set({ dtcCodes: codes }),
  setCurrentSession: (session) => set({ currentSession: session }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearDiagnosticData: () =>
    set({
      pidValues: [],
      dtcCodes: [],
      currentSession: null,
      sessionId: null,
      isConnected: false,
      protocolStatus: ProtocolStatus.DISCONNECTED,
    }),
  startSession: (vehicleId, protocol) =>
    set({
      currentSession: {
        id: `session_${Date.now()}`,
        vehicleId,
        protocol,
        status: DiagnosticSessionStatus.ACTIVE,
        startedAt: new Date().toISOString(),
        pidValues: [],
        dtcCodes: [],
      },
      isConnected: true,
      protocolStatus: ProtocolStatus.CONNECTED,
    }),
  endSession: () =>
    set((state) => ({
      currentSession: state.currentSession
        ? { ...state.currentSession, status: DiagnosticSessionStatus.COMPLETED, endedAt: new Date().toISOString() }
        : null,
      isConnected: false,
      protocolStatus: ProtocolStatus.DISCONNECTED,
    })),
}));
