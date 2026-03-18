import React, { useEffect } from 'react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { useDiagnostic } from '../hooks/useDiagnostic';
import { DiagnosticCodes } from '../components/DiagnosticCodes';
import { PIDDisplay } from '../components/PIDDisplay';
import { diagnosticsAPI } from '../services/api';

export const DiagnosticsView: React.FC = () => {
  const { selectedVehicle, sessionId } = useDiagnosticStore();
  const { dtcCodes, pidValues, isLoading, error, fetchDTCCodes } = useDiagnostic();

  useEffect(() => {
    if (sessionId) {
      fetchDTCCodes();
    }
  }, [sessionId, fetchDTCCodes]);

  const handleClearCodes = async () => {
    if (!selectedVehicle) return;
    try {
      await diagnosticsAPI.clearDTCCodes(selectedVehicle.id);
      fetchDTCCodes();
    } catch (err) {
      console.error('Failed to clear DTC codes:', err);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>Diagnostics</h2>
      {!sessionId && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#92400e',
        }}>
          Not connected to a vehicle. Go to the Dashboard to connect.
        </div>
      )}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#991b1b',
        }}>
          {error}
        </div>
      )}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Live PID Data</h3>
        <PIDDisplay pidValues={pidValues} />
      </div>
      <div>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Diagnostic Trouble Codes</h3>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
        ) : (
          <DiagnosticCodes codes={dtcCodes} onClear={sessionId ? handleClearCodes : undefined} />
        )}
      </div>
    </div>
  );
};

export default DiagnosticsView;
