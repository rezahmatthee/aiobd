import React from 'react';
import { ProtocolType, ProtocolStatus, PROTOCOL_INFO } from '../types/protocol';

interface ProtocolIndicatorProps {
  protocolType: ProtocolType;
  status: ProtocolStatus;
}

const STATUS_COLORS: Record<ProtocolStatus, string> = {
  [ProtocolStatus.CONNECTED]: '#22c55e',
  [ProtocolStatus.CONNECTING]: '#f59e0b',
  [ProtocolStatus.DISCONNECTED]: '#6b7280',
  [ProtocolStatus.ERROR]: '#ef4444',
};

const STATUS_LABELS: Record<ProtocolStatus, string> = {
  [ProtocolStatus.CONNECTED]: 'Connected',
  [ProtocolStatus.CONNECTING]: 'Connecting...',
  [ProtocolStatus.DISCONNECTED]: 'Disconnected',
  [ProtocolStatus.ERROR]: 'Error',
};

export const ProtocolIndicator: React.FC<ProtocolIndicatorProps> = ({ protocolType, status }) => {
  const info = PROTOCOL_INFO[protocolType];
  const color = STATUS_COLORS[status];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      border: `2px solid ${color}`,
      borderRadius: '8px',
      backgroundColor: 'rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color,
        animation: status === ProtocolStatus.CONNECTING ? 'pulse 1s infinite' : 'none',
      }} />
      <div>
        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{info?.name || protocolType}</div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>{STATUS_LABELS[status]}</div>
      </div>
    </div>
  );
};

export default ProtocolIndicator;
