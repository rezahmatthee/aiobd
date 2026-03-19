import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSuperAdminStore from '../store/superAdminStore';
import StatsBanner from '../components/StatsBanner';
import DataTable from '../components/DataTable';
import ActivityFeed from '../components/ActivityFeed';
import ConfirmDialog from '../components/ConfirmDialog';

const navStyle = { background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' };
const tabStyle = (active) => ({ padding: '8px 16px', background: active ? '#DC2626' : 'transparent', border: active ? 'none' : '1px solid #2a2a2a', borderRadius: '8px', color: active ? '#fff' : '#888', cursor: 'pointer', fontSize: '14px' });

function HealthBar({ label, value }) {
  const color = (value || 0) > 80 ? '#FF4757' : (value || 0) > 60 ? '#FFA500' : '#00D084';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '14px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '14px', color }}>{(value || 0).toFixed(1)}%</span>
      </div>
      <div style={{ background: '#2a2a2a', borderRadius: '9999px', height: '6px' }}>
        <div style={{ width: `${Math.min(value || 0, 100)}%`, height: '100%', borderRadius: '9999px', background: color }} />
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuthStore();
  const { metrics, admins, systemHealth, securityAudit, loading, fetchMetrics, fetchAdmins, fetchSystemHealth, fetchSecurityAudit, removeAdmin, triggerBackup } = useSuperAdminStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [confirm, setConfirm] = useState(null);
  const [backupMsg, setBackupMsg] = useState('');

  useEffect(() => {
    fetchMetrics();
    fetchAdmins();
    fetchSystemHealth();
    fetchSecurityAudit();
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleBackup = async () => {
    try {
      const d = await triggerBackup();
      setBackupMsg(`Backup initiated at ${new Date(d.timestamp).toLocaleTimeString()}`);
      setTimeout(() => setBackupMsg(''), 5000);
    } catch {}
  };

  const platformStats = [
    { title: 'Total Users', value: metrics?.totalUsers ?? 0, icon: '👥', color: '#DC2626' },
    { title: 'MAU', value: metrics?.mau ?? 0, icon: '📈', color: '#0066FF' },
    { title: 'DAU', value: metrics?.dau ?? 0, icon: '🟢', color: '#00D084' },
    { title: 'Total Diagnostics', value: metrics?.totalDiagnostics ?? 0, icon: '🔍', color: '#FFA500' }
  ];

  const adminColumns = [
    { key: 'email', header: 'Email' },
    { key: 'firstName', header: 'Name', render: (v, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—' },
    { key: 'role', header: 'Role', render: (v) => <span style={{ padding: '2px 8px', borderRadius: '9999px', background: '#DC262620', color: '#DC2626', fontSize: '12px' }}>{v}</span> },
    { key: 'lastLogin', header: 'Last Login', render: (v) => v ? new Date(v).toLocaleDateString() : 'Never' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#DC2626', fontWeight: '700', fontSize: '18px' }}>aiobd</span>
          <span style={{ color: '#888', fontSize: '14px' }}>Super Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', padding: '2px 8px', background: '#DC262620', color: '#DC2626', borderRadius: '9999px' }}>Super Admin</span>
          <span style={{ color: '#f5f5f5', fontSize: '14px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#2a2a2a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Platform Control Center</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Complete platform management and oversight</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['overview', 'admins', 'system', 'security'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <StatsBanner stats={platformStats} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>System Health</h3>
                <HealthBar label="CPU Usage" value={systemHealth?.cpuUsage} />
                <HealthBar label="Memory Usage" value={systemHealth?.memoryUsage} />
                <HealthBar label="Disk Usage" value={systemHealth?.diskUsage} />
                <p style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>Active Users: {systemHealth?.activeUsers ?? 0} | Uptime: {Math.floor((metrics?.uptime || 0) / 3600)}h</p>
              </div>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Platform Summary</h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Admins: {metrics?.admins ?? 0}</p>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '8px' }}>Vehicles: {metrics?.totalVehicles ?? 0}</p>
                <p style={{ color: '#888', fontSize: '14px' }}>Uptime: {Math.floor((metrics?.uptime || 0) / 3600)}h {Math.floor(((metrics?.uptime || 0) % 3600) / 60)}m</p>
              </div>
            </div>
          </>
        )}

        {tab === 'admins' && (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Admin Management</h3>
            <DataTable
              columns={adminColumns}
              data={admins}
              emptyText="No admins found"
              onAction={(row) => row.role !== 'superadmin' ? (
                <button onClick={() => setConfirm({ id: row._id, email: row.email })} style={{ padding: '4px 10px', background: '#FF4757', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
              ) : <span style={{ color: '#888', fontSize: '12px' }}>Protected</span>}
            />
          </div>
        )}

        {tab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>System Controls</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={handleBackup} style={{ padding: '12px', background: '#00D08420', border: '1px solid #00D084', borderRadius: '8px', color: '#00D084', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                  💾 Trigger Database Backup
                </button>
                {backupMsg && <p style={{ color: '#00D084', fontSize: '13px' }}>{backupMsg}</p>}
                <button style={{ padding: '12px', background: '#FFA50020', border: '1px solid #FFA500', borderRadius: '8px', color: '#FFA500', cursor: 'pointer', fontSize: '14px', textAlign: 'left' }}>
                  🔧 Toggle Maintenance Mode
                </button>
              </div>
            </div>
            <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Resource Monitoring</h3>
              <HealthBar label="CPU Usage" value={systemHealth?.cpuUsage} />
              <HealthBar label="Memory Usage" value={systemHealth?.memoryUsage} />
              <HealthBar label="Disk Usage" value={systemHealth?.diskUsage} />
            </div>
          </div>
        )}

        {tab === 'security' && (
          <ActivityFeed activities={securityAudit} title="Security Audit Log" />
        )}
      </main>

      <ConfirmDialog
        open={!!confirm}
        title="Remove Admin"
        message={`Remove admin privileges from ${confirm?.email}? They will become a regular user.`}
        onConfirm={() => { removeAdmin(confirm.id); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
        confirmText="Remove Admin"
        danger
      />
    </div>
  );
}
