import React from 'react';
import { ProtocolType, PROTOCOL_INFO } from '../types/protocol';
import { useDiagnosticStore } from '../store/diagnosticStore';

interface ProtocolSelectorProps {
  onSelect?: (protocol: ProtocolType) => void;
}

export const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({ onSelect }) => {
  const { protocolType, setProtocol } = useDiagnosticStore();

  const handleSelect = (protocol: ProtocolType) => {
    setProtocol(protocol);
    onSelect?.(protocol);
  };

  const protocols = Object.values(ProtocolType);

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '8px', fontSize: '24px' }}>Protocol Selection</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Select the OBD2 protocol for your vehicle. Use Auto Detect if unsure.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {protocols.map((protocol) => {
          const info = PROTOCOL_INFO[protocol];
          const isSelected = protocol === protocolType;
          return (
            <div
              key={protocol}
              onClick={() => handleSelect(protocol)}
              style={{
                border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#eff6ff' : 'white',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{info.name}</div>
                {isSelected && (
                  <span style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>Selected</span>
                )}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                {info.description}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#374151', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                  {info.standard}
                </span>
                {info.baudRate > 0 && (
                  <span style={{ fontSize: '12px', color: '#374151', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                    {info.baudRate >= 1000 ? `${info.baudRate / 1000}k` : info.baudRate} bps
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProtocolSelector;
