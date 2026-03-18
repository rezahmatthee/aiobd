import React from 'react';
import { PIDValue } from '../types/pid';

interface PIDDisplayProps {
  pidValues: PIDValue[];
  maxItems?: number;
}

interface PIDCardProps {
  pid: PIDValue;
}

const PIDCard: React.FC<PIDCardProps> = ({ pid }) => {
  const percentage =
    pid.minValue !== undefined && pid.maxValue !== undefined
      ? Math.min(100, Math.max(0, ((Number(pid.value) - pid.minValue) / (pid.maxValue - pid.minValue)) * 100))
      : null;

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      backgroundColor: 'white',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{pid.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
          {typeof pid.value === 'number' ? pid.value.toFixed(1) : pid.value}
        </span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{pid.unit}</span>
      </div>
      {percentage !== null && (
        <div style={{ marginTop: '8px', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: percentage > 80 ? '#ef4444' : '#22c55e',
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
        {new Date(pid.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export const PIDDisplay: React.FC<PIDDisplayProps> = ({ pidValues, maxItems = 12 }) => {
  const displayValues = pidValues.slice(0, maxItems);

  if (displayValues.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        No PID data available. Connect to a vehicle to start monitoring.
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '12px',
    }}>
      {displayValues.map((pid, index) => (
        <PIDCard key={`${pid.pid}-${index}`} pid={pid} />
      ))}
    </div>
  );
};

export default PIDDisplay;
