import React, { useState } from 'react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { useProtocol } from '../hooks/useProtocol';
import { ProtocolIndicator } from '../components/ProtocolIndicator';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { ProtocolType } from '../types/protocol';
import { Vehicle } from '../types/diagnostic';

const SAMPLE_VEHICLES: Vehicle[] = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2022, vin: 'JT2BF22K3W0108950' },
  { id: '2', make: 'Ford', model: 'F-150', year: 2021, vin: '1FTFW1ET1MFC12345' },
  { id: '3', make: 'BMW', model: '3 Series', year: 2023 },
];

export const Dashboard: React.FC = () => {
  const { protocolType, protocolStatus, isConnected, connect, disconnect } = useProtocol();
  const { selectedVehicle, setSelectedVehicle, setVehicles } = useDiagnosticStore();
  const [port, setPort] = useState('/dev/ttyUSB0');

  React.useEffect(() => {
    setVehicles(SAMPLE_VEHICLES);
  }, [setVehicles]);

  const handleConnect = () => {
    connect(port);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px 0' }}>
          AIOBD Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Universal Automotive Diagnostic Platform</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Protocol Status</h3>
          <ProtocolIndicator protocolType={protocolType} status={protocolStatus} />
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Connection</h3>
          <ConnectionStatus
            status={protocolStatus}
            vehicleName={selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : undefined}
            onConnect={handleConnect}
            onDisconnect={disconnect}
          />
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Connection Settings</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Adapter Port
            </label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="/dev/ttyUSB0"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                width: '200px',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px', color: '#374151', display: 'block', marginBottom: '4px' }}>
              Protocol
            </label>
            <select
              value={protocolType}
              onChange={(e) => useDiagnosticStore.getState().setProtocol(e.target.value as ProtocolType)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              {Object.values(ProtocolType).map((p) => (
                <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', backgroundColor: 'white' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Vehicles</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SAMPLE_VEHICLES.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              style={{
                padding: '12px 16px',
                border: `2px solid ${selectedVehicle?.id === vehicle.id ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedVehicle?.id === vehicle.id ? '#eff6ff' : 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                {vehicle.vin && (
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                    VIN: {vehicle.vin}
                  </div>
                )}
              </div>
              {selectedVehicle?.id === vehicle.id && (
                <span style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}>
                  Selected
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isConnected && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '8px',
          color: '#166534',
        }}>
          ✓ Connected via {protocolType.replace(/_/g, ' ')} — Navigate to Diagnostics or Real-time Monitor to view data.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
