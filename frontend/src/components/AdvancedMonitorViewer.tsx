/**
 * AdvancedMonitorViewer - Display Mode $06 monitor test results
 */

import React from 'react';
import { MonitorTest, MonitorType } from '../types/advanced_diagnostic';

interface AdvancedMonitorViewerProps {
  monitors: MonitorTest[];
  loading?: boolean;
  onRefresh?: () => void;
}

const MONITOR_TYPE_LABELS: Record<MonitorType, string> = {
  [MonitorType.OXYGEN_SENSOR]: 'Oxygen Sensor',
  [MonitorType.FUEL_SYSTEM]: 'Fuel System',
  [MonitorType.EVAP_SYSTEM]: 'EVAP System',
  [MonitorType.EGR_SYSTEM]: 'EGR System',
  [MonitorType.CATALYST]: 'Catalyst',
  [MonitorType.HEATED_CATALYST]: 'Heated Catalyst',
  [MonitorType.SECONDARY_AIR]: 'Secondary Air',
  [MonitorType.MISFIRE]: 'Misfire',
  [MonitorType.COMPREHENSIVE]: 'Comprehensive',
};

function TestStatusBadge({ passed, enabled, complete }: Pick<MonitorTest, 'passed' | 'enabled' | 'complete'>) {
  if (!enabled) {
    return <span style={{ color: '#888', fontSize: '0.75rem' }}>Disabled</span>;
  }
  if (!complete) {
    return <span style={{ color: '#f0a500', fontSize: '0.75rem' }}>Incomplete</span>;
  }
  if (passed) {
    return <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ PASS</span>;
  }
  return <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>✗ FAIL</span>;
}

function MonitorTestRow({ test }: { test: MonitorTest }) {
  const percentage = test.maxLimit > test.minLimit
    ? Math.min(100, Math.max(0, ((test.testValue - test.minLimit) / (test.maxLimit - test.minLimit)) * 100))
    : 0;

  return (
    <div
      style={{
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '8px',
        background: test.passed ? '#f0fdf4' : test.enabled && test.complete ? '#fef2f2' : '#f8f9fa',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>
            {MONITOR_TYPE_LABELS[test.monitorType]} — Test 0x{test.testId.toString(16).padStart(2, '0').toUpperCase()}
          </span>
          <br />
          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
            Component: 0x{test.componentId.toString(16).padStart(2, '0').toUpperCase()}
          </span>
        </div>
        <TestStatusBadge passed={test.passed} enabled={test.enabled} complete={test.complete} />
      </div>

      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
          <span>Min: {test.minLimit}</span>
          <span>Value: <strong>{test.testValue}</strong></span>
          <span>Max: {test.maxLimit}</span>
        </div>
        <div
          style={{
            marginTop: '4px',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: test.passed ? '#22c55e' : '#ef4444',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export const AdvancedMonitorViewer: React.FC<AdvancedMonitorViewerProps> = ({
  monitors,
  loading = false,
  onRefresh,
}) => {
  const passedCount = monitors.filter((m) => m.passed).length;
  const failedCount = monitors.filter((m) => m.enabled && m.complete && !m.passed).length;

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>On-board Monitor Tests (Mode $06)</h2>
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

      {monitors.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{passedCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Passed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{failedCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Failed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{monitors.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total</div>
          </div>
        </div>
      )}

      {loading && monitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          Loading monitor tests...
        </div>
      ) : monitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          No monitor test data available. Click Refresh to request data.
        </div>
      ) : (
        <div>
          {monitors.map((test, idx) => (
            <MonitorTestRow key={`${test.testId}-${test.componentId}-${idx}`} test={test} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedMonitorViewer;
