import React, { useEffect, useState } from 'react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { useDiagnostic } from '../hooks/useDiagnostic';
import { PIDDisplay } from '../components/PIDDisplay';

const MONITORED_PIDS = [
  { mode: '01', pid: '0C', name: 'Engine RPM' },
  { mode: '01', pid: '0D', name: 'Vehicle Speed' },
  { mode: '01', pid: '05', name: 'Coolant Temp' },
  { mode: '01', pid: '04', name: 'Engine Load' },
  { mode: '01', pid: '11', name: 'Throttle Position' },
  { mode: '01', pid: '0F', name: 'Intake Air Temp' },
];

export const RealtimeMonitor: React.FC = () => {
  const { sessionId, isConnected } = useDiagnosticStore();
  const { pidValues, startLiveDataPolling, stopLiveDataPolling } = useDiagnostic();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [selectedPIDs, setSelectedPIDs] = useState<string[]>(['0C', '0D', '05']);

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    selectedPIDs.forEach((pid) => {
      startLiveDataPolling('01', pid, 1000);
    });
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    stopLiveDataPolling();
  };

  useEffect(() => {
    return () => {
      stopLiveDataPolling();
    };
  }, [stopLiveDataPolling]);

  const togglePID = (pid: string) => {
    setSelectedPIDs((prev) =>
      prev.includes(pid) ? prev.filter((p) => p !== pid) : [...prev, pid]
    );
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Real-time Monitor</h2>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Live OBD2 parameter monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isMonitoring ? (
            <button
              onClick={handleStartMonitoring}
              disabled={!isConnected}
              style={{
                padding: '8px 16px',
                backgroundColor: isConnected ? '#22c55e' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
            >
              ▶ Start Monitoring
            </button>
          ) : (
            <button
              onClick={handleStopMonitoring}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ■ Stop Monitoring
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Select PIDs to Monitor</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MONITORED_PIDS.map(({ pid, name }) => (
            <button
              key={pid}
              onClick={() => togglePID(pid)}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedPIDs.includes(pid) ? '#3b82f6' : '#f3f4f6',
                color: selectedPIDs.includes(pid) ? 'white' : '#374151',
                border: '1px solid ' + (selectedPIDs.includes(pid) ? '#3b82f6' : '#d1d5db'),
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {name} (0x{pid})
            </button>
          ))}
        </div>
      </div>

      {isMonitoring && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#166534',
        }}>
          <span style={{ color: '#22c55e' }}>●</span>
          Monitoring {selectedPIDs.length} PID{selectedPIDs.length !== 1 ? 's' : ''} — {pidValues.length} readings collected
        </div>
      )}

      <PIDDisplay pidValues={pidValues} maxItems={20} />
    </div>
  );
};

export default RealtimeMonitor;
