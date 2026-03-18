import React from 'react';
import { ProtocolStatus } from '../types/protocol';

interface ConnectionStatusProps {
  status: ProtocolStatus;
  vehicleName?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  vehicleName,
  onConnect,
  onDisconnect,
}) => {
  const isConnected = status === ProtocolStatus.CONNECTED;
  const isConnecting = status === ProtocolStatus.CONNECTING;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: isConnected ? '#f0fdf4' : '#fafafa',
      border: `1px solid ${isConnected ? '#86efac' : '#e5e7eb'}`,
      borderRadius: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: isConnected ? '#22c55e' : isConnecting ? '#f59e0b' : '#6b7280',
        }} />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </div>
          {vehicleName && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{vehicleName}</div>
          )}
        </div>
      </div>
      <div>
        {!isConnected && !isConnecting && onConnect && (
          <button
            onClick={onConnect}
            style={{
              padding: '6px 14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Connect
          </button>
        )}
        {isConnected && onDisconnect && (
          <button
            onClick={onDisconnect}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Disconnect
          </button>
        )}
        {isConnecting && (
          <span style={{ fontSize: '14px', color: '#f59e0b' }}>Please wait...</span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
