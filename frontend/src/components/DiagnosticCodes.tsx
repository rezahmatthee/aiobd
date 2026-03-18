import React from 'react';
import { DTCCode } from '../types/diagnostic';

interface DiagnosticCodesProps {
  codes: DTCCode[];
  onClear?: () => void;
}

const SYSTEM_LABELS: Record<string, string> = {
  P: 'Powertrain',
  C: 'Chassis',
  B: 'Body',
  U: 'Network',
};

const SYSTEM_COLORS: Record<string, string> = {
  P: '#ef4444',
  C: '#f59e0b',
  B: '#3b82f6',
  U: '#8b5cf6',
};

export const DiagnosticCodes: React.FC<DiagnosticCodesProps> = ({ codes, onClear }) => {
  if (codes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#22c55e' }}>
        <div style={{ fontSize: '48px' }}>✓</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>No Fault Codes</div>
        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Vehicle systems are operating normally</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>
          {codes.length} Diagnostic Trouble Code{codes.length !== 1 ? 's' : ''} Found
        </h3>
        {onClear && (
          <button
            onClick={onClear}
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
            Clear All Codes
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {codes.map((code, index) => (
          <div
            key={index}
            style={{
              border: `1px solid ${SYSTEM_COLORS[code.system] || '#e5e7eb'}`,
              borderLeft: `4px solid ${SYSTEM_COLORS[code.system] || '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              backgroundColor: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  color: SYSTEM_COLORS[code.system] || '#374151',
                  fontFamily: 'monospace',
                }}>
                  {code.code}
                </span>
                <span style={{
                  marginLeft: '8px',
                  fontSize: '12px',
                  backgroundColor: SYSTEM_COLORS[code.system] || '#e5e7eb',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  {SYSTEM_LABELS[code.system] || code.system}
                </span>
              </div>
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                textTransform: 'capitalize',
              }}>
                {code.type}
              </span>
            </div>
            <div style={{ marginTop: '4px', fontSize: '14px', color: '#374151' }}>
              {code.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiagnosticCodes;
