/**
 * VehicleInfoDisplay - Display Mode $09 vehicle information
 */

import React, { useState } from 'react';
import { VehicleInfo } from '../types/advanced_diagnostic';

interface VehicleInfoDisplayProps {
  vehicleInfo: VehicleInfo | null;
  loading?: boolean;
  onRefresh?: () => void;
}

interface InfoRowProps {
  label: string;
  value?: string;
  copyable?: boolean;
}

function InfoRow({ label, value, copyable = false }: InfoRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #e2e8f0',
      }}
    >
      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: value ? '#1e293b' : '#94a3b8' }}>
          {value || 'N/A'}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              background: copied ? '#22c55e' : '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: copied ? 'white' : '#64748b',
              transition: 'all 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  );
}

export const VehicleInfoDisplay: React.FC<VehicleInfoDisplayProps> = ({
  vehicleInfo,
  loading = false,
  onRefresh,
}) => {
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Vehicle Information (Mode $09)</h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {loading && !vehicleInfo ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          Loading vehicle information...
        </div>
      ) : (
        <div
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <InfoRow label="VIN (Vehicle Identification Number)" value={vehicleInfo?.vin} copyable />
          <InfoRow label="Calibration ID" value={vehicleInfo?.calibrationId} copyable />
          <InfoRow label="CVN (Calibration Verification Number)" value={vehicleInfo?.cvn} copyable />
          <InfoRow label="ECU Name" value={vehicleInfo?.ecuName} />
          <InfoRow label="Performance Tracking" value={vehicleInfo?.performanceTracking} />
        </div>
      )}
    </div>
  );
};

export default VehicleInfoDisplay;
