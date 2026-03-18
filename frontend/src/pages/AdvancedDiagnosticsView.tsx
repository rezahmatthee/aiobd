/**
 * AdvancedDiagnosticsView - Dashboard for all Phase 2 advanced diagnostic features
 */

import React, { useState } from 'react';
import { AdvancedMonitorViewer } from '../components/AdvancedMonitorViewer';
import { VehicleInfoDisplay } from '../components/VehicleInfoDisplay';
import { FreezeFrameBrowser } from '../components/FreezeFrameBrowser';
import { useMonitorTests, useVehicleInfo, useFreezeFrames } from '../hooks/useAdvancedDiagnostics';

type TabId = 'monitors' | 'vehicleInfo' | 'freezeFrames';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'monitors', label: 'Monitor Tests' },
  { id: 'vehicleInfo', label: 'Vehicle Info' },
  { id: 'freezeFrames', label: 'Freeze Frames' },
];

interface AdvancedDiagnosticsViewProps {
  vehicleId: string;
}

export const AdvancedDiagnosticsView: React.FC<AdvancedDiagnosticsViewProps> = ({ vehicleId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('monitors');

  const { monitors, loading: monitorsLoading, fetchMonitors, requestMonitors } = useMonitorTests(vehicleId);
  const { vehicleInfo, loading: vehicleInfoLoading, fetchVehicleInfo } = useVehicleInfo(vehicleId);
  const { freezeFrames, loading: freezeFramesLoading, fetchFreezeFrames, clearFreezeFrame } = useFreezeFrames(vehicleId);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>Advanced Diagnostics</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
          Vehicle: <strong>{vehicleId}</strong> — Mode $06, Mode $09, Freeze Frames
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '24px',
          gap: '4px',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              color: activeTab === tab.id ? '#3b82f6' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {activeTab === 'monitors' && (
          <AdvancedMonitorViewer
            monitors={monitors}
            loading={monitorsLoading}
            onRefresh={() => requestMonitors()}
          />
        )}

        {activeTab === 'vehicleInfo' && (
          <VehicleInfoDisplay
            vehicleInfo={vehicleInfo}
            loading={vehicleInfoLoading}
            onRefresh={fetchVehicleInfo}
          />
        )}

        {activeTab === 'freezeFrames' && (
          <FreezeFrameBrowser
            freezeFrames={freezeFrames}
            loading={freezeFramesLoading}
            onRefresh={fetchFreezeFrames}
            onClear={clearFreezeFrame}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedDiagnosticsView;
