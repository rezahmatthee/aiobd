/**
 * FreezeFrameBrowser - Timeline and detail view for freeze frames
 */

import React, { useState } from 'react';
import { FreezeFrame } from '../types/advanced_diagnostic';

interface FreezeFrameBrowserProps {
  freezeFrames: FreezeFrame[];
  loading?: boolean;
  onRefresh?: () => void;
  onClear?: (frameId: string) => void;
}

interface FreezeFrameDetailProps {
  frame: FreezeFrame;
  onClear?: (frameId: string) => void;
  onClose: () => void;
}

function formatPidHex(pid: number): string {
  return `0x${pid.toString(16).padStart(2, '0').toUpperCase()}`;
}

function exportAsJSON(frame: FreezeFrame) {
  const dataStr = JSON.stringify(frame, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `freeze_frame_${frame.frameId}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportAsCSV(frame: FreezeFrame) {
  const headers = ['PID (hex)', 'Name', 'Value', 'Unit'];
  const rows = frame.pids.map((pid) => [
    `${formatPidHex(pid.pid)}`,
    pid.name,
    String(pid.value),
    pid.unit,
  ]);
  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `freeze_frame_${frame.frameId}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function FreezeFrameDetail({ frame, onClear, onClose }: FreezeFrameDetailProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Freeze Frame Details</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>
              DTC: <strong style={{ color: '#ef4444' }}>{frame.dtc}</strong> •{' '}
              {new Date(frame.timestamp).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>

        <div>
          {frame.pids.map((pid) => (
            <div
              key={pid.pid}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #f1f5f9',
                fontSize: '0.875rem',
              }}
            >
              <span style={{ color: '#64748b' }}>
                <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px', fontSize: '0.75rem' }}>
                  {formatPidHex(pid.pid)}
                </code>{' '}
                {pid.name}
              </span>
              <span style={{ fontWeight: '500' }}>
                {typeof pid.value === 'number' ? pid.value.toFixed(2) : pid.value} {pid.unit}
              </span>
            </div>
          ))}
          {frame.pids.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '16px' }}>No PID data available</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => exportAsJSON(frame)} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Export JSON
          </button>
          <button onClick={() => exportAsCSV(frame)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem' }}>
            Export CSV
          </button>
          {onClear && (
            <button onClick={() => { onClear(frame.frameId); onClose(); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', marginLeft: 'auto' }}>
              Clear Frame
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const FreezeFrameBrowser: React.FC<FreezeFrameBrowserProps> = ({
  freezeFrames,
  loading = false,
  onRefresh,
  onClear,
}) => {
  const [selectedFrame, setSelectedFrame] = useState<FreezeFrame | null>(null);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Freeze Frames</h2>
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

      {loading && freezeFrames.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          Loading freeze frames...
        </div>
      ) : freezeFrames.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          No freeze frames recorded.
        </div>
      ) : (
        <div>
          {freezeFrames.map((frame) => (
            <div
              key={frame.frameId}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                background: 'white',
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => setSelectedFrame(frame)}
            >
              <div>
                <span style={{ fontWeight: '600', color: '#ef4444' }}>{frame.dtc}</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem', marginLeft: '8px' }}>
                  {frame.pids.length} PIDs recorded
                </span>
                <br />
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  {new Date(frame.timestamp).toLocaleString()}
                </span>
              </div>
              <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>View →</span>
            </div>
          ))}
        </div>
      )}

      {selectedFrame && (
        <FreezeFrameDetail
          frame={selectedFrame}
          onClear={onClear}
          onClose={() => setSelectedFrame(null)}
        />
      )}
    </div>
  );
};

export default FreezeFrameBrowser;
