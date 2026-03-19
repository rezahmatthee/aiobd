import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useUserStore from '../store/userStore';
import StatsBanner from '../components/StatsBanner';
import ActivityFeed from '../components/ActivityFeed';
import DataTable from '../components/DataTable';
import NotificationPanel from '../components/NotificationPanel';

const navStyle = { background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' };
const btnStyle = (bg = '#0066FF') => ({ padding: '8px 16px', background: bg, border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' });

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const { dashboard, recentActivity, loading, fetchDashboard, fetchRecentActivity } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => { fetchDashboard(); fetchRecentActivity(); }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const stats = [
    { title: 'Total Vehicles', value: dashboard?.stats?.totalVehicles ?? 0, icon: '🚗', color: '#0066FF' },
    { title: 'Active Diagnostics', value: dashboard?.stats?.activeDiagnostics ?? 0, icon: '🔍', color: '#00D084' },
    { title: 'Reports Generated', value: dashboard?.stats?.reportsGenerated ?? 0, icon: '📊', color: '#FFA500' }
  ];

  const vehicleColumns = [
    { key: 'make', header: 'Make' },
    { key: 'model', header: 'Model' },
    { key: 'year', header: 'Year' },
    { key: 'status', header: 'Status', render: (v) => (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', background: v === 'active' ? '#00D08420' : '#FF475720', color: v === 'active' ? '#00D084' : '#FF4757', fontSize: '12px' }}>{v}</span>
    )}
  ];

  const diagnosticColumns = [
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status', render: (v) => (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', background: v === 'completed' ? '#00D08420' : '#FFA50020', color: v === 'completed' ? '#00D084' : '#FFA500', fontSize: '12px' }}>{v}</span>
    )},
    { key: 'createdAt', header: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#0066FF', fontWeight: '700', fontSize: '18px' }}>aiobd</span>
          <span style={{ color: '#888', fontSize: '14px' }}>User Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#f5f5f5', fontSize: '14px' }}>{user?.firstName || user?.email}</span>
          <button onClick={handleLogout} style={btnStyle('#2a2a2a')}>Logout</button>
        </div>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Welcome back, {user?.firstName || 'User'}! 👋</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Here's your vehicle diagnostics overview</p>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>Loading dashboard...</div> : (
          <>
            <StatsBanner stats={stats} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>My Vehicles</h3>
                <DataTable columns={vehicleColumns} data={dashboard?.vehicles || []} emptyText="No vehicles added yet" />
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>Recent Diagnostics</h3>
                <DataTable columns={diagnosticColumns} data={dashboard?.recentDiagnostics || []} emptyText="No diagnostics yet" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <ActivityFeed activities={recentActivity} title="Recent Activity" />
              <NotificationPanel notifications={[
                { message: 'Your vehicle diagnostic is complete', type: 'info', time: 'Just now' },
                { message: 'System maintenance scheduled for tomorrow', type: 'warning', time: '1 hour ago' }
              ]} />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button style={btnStyle('#0066FF')}>🔍 Start Diagnosis</button>
              <button style={btnStyle('#2a2a2a')}>🚗 Add Vehicle</button>
              <button style={btnStyle('#2a2a2a')}>📊 View Reports</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
