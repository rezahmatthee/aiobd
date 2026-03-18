import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { DiagnosticsView } from './pages/DiagnosticsView';
import { RealtimeMonitor } from './pages/RealtimeMonitor';
import { ProtocolSelector } from './pages/ProtocolSelector';
import { useDiagnosticStore } from './store/diagnosticStore';
import { ProtocolStatus } from './types/protocol';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/diagnostics', label: 'Diagnostics' },
  { path: '/monitor', label: 'Live Monitor' },
  { path: '/protocols', label: 'Protocols' },
];

const App: React.FC = () => {
  const { isConnected, protocolStatus } = useDiagnosticStore();

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <nav style={{
          backgroundColor: '#1e293b',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
              🔧 AIOBD
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {NAV_LINKS.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  style={({ isActive }) => ({
                    color: isActive ? 'white' : '#94a3b8',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                  })}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#22c55e' : protocolStatus === ProtocolStatus.CONNECTING ? '#f59e0b' : '#6b7280',
            }} />
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diagnostics" element={<DiagnosticsView />} />
            <Route path="/monitor" element={<RealtimeMonitor />} />
            <Route path="/protocols" element={<ProtocolSelector />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
