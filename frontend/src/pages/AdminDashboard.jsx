import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useAdminStore from '../store/adminStore';
import StatsBanner from '../components/StatsBanner';
import DataTable from '../components/DataTable';
import ActivityFeed from '../components/ActivityFeed';
import ConfirmDialog from '../components/ConfirmDialog';

const navStyle = { background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' };
const tabStyle = (active) => ({ padding: '8px 16px', background: active ? '#0066FF' : 'transparent', border: active ? 'none' : '1px solid #2a2a2a', borderRadius: '8px', color: active ? '#fff' : '#888', cursor: 'pointer', fontSize: '14px' });
const btnSm = (color = '#0066FF') => ({ padding: '4px 10px', background: color, border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' });

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const { dashboard, users, loading, fetchDashboard, fetchUsers, deleteUser, changeRole, fetchActivityLog, activityLogs } = useAdminStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchDashboard(); fetchUsers(); fetchActivityLog(); }, []);
  useEffect(() => { const t = setTimeout(() => fetchUsers({ search }), 400); return () => clearTimeout(t); }, [search]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const stats = [
    { title: 'Total Users', value: dashboard?.totalUsers ?? 0, icon: '👥', color: '#0066FF' },
    { title: 'Active Users', value: dashboard?.activeUsers ?? 0, icon: '✅', color: '#00D084' },
    { title: 'Total Vehicles', value: dashboard?.totalVehicles ?? 0, icon: '🚗', color: '#FFA500' },
    { title: 'Diagnostics', value: dashboard?.totalDiagnostics ?? 0, icon: '🔍', color: '#7C3AED' }
  ];

  const userColumns = [
    { key: 'email', header: 'Email' },
    { key: 'firstName', header: 'Name', render: (v, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—' },
    { key: 'role', header: 'Role', render: (v) => (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', background: v === 'admin' ? '#7C3AED20' : '#0066FF20', color: v === 'admin' ? '#7C3AED' : '#0066FF', fontSize: '12px' }}>{v}</span>
    )},
    { key: 'status', header: 'Status', render: (v) => (
      <span style={{ padding: '2px 8px', borderRadius: '9999px', background: v === 'active' ? '#00D08420' : '#FF475720', color: v === 'active' ? '#00D084' : '#FF4757', fontSize: '12px' }}>{v}</span>
    )},
    { key: 'lastLogin', header: 'Last Login', render: (v) => v ? new Date(v).toLocaleDateString() : 'Never' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f' }}>
      <nav style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#7C3AED', fontWeight: '700', fontSize: '18px' }}>aiobd</span>
          <span style={{ color: '#888', fontSize: '14px' }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', padding: '2px 8px', background: '#7C3AED20', color: '#7C3AED', borderRadius: '9999px' }}>Admin</span>
          <span style={{ color: '#f5f5f5', fontSize: '14px' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#2a2a2a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Admin Dashboard</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Platform management and monitoring</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['overview', 'users', 'activity'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {loading && tab === 'overview' ? <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>Loading...</div> : (
          <>
            {tab === 'overview' && (
              <>
                <StatsBanner stats={stats} />
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>System Status</h3>
                  <p style={{ color: '#888', fontSize: '14px' }}>Uptime: {Math.floor((dashboard?.systemUptime || 0) / 3600)}h {Math.floor(((dashboard?.systemUptime || 0) % 3600) / 60)}m</p>
                </div>
              </>
            )}
            {tab === 'users' && (
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>User Management</h3>
                  <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none', width: '220px' }} />
                </div>
                <DataTable
                  columns={userColumns}
                  data={users}
                  emptyText="No users found"
                  onAction={(row) => (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => changeRole(row._id, row.role === 'admin' ? 'user' : 'admin')} style={btnSm('#7C3AED')}>
                        {row.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button onClick={() => setConfirm({ id: row._id, email: row.email })} style={btnSm('#FF4757')}>Delete</button>
                    </div>
                  )}
                />
              </div>
            )}
            {tab === 'activity' && (
              <ActivityFeed activities={activityLogs} title="Activity Log" />
            )}
          </>
        )}
      </main>

      <ConfirmDialog
        open={!!confirm}
        title="Delete User"
        message={`Are you sure you want to deactivate ${confirm?.email}? This action cannot be undone.`}
        onConfirm={() => { deleteUser(confirm.id); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
        confirmText="Delete"
        danger
      />
    </div>
  );
}
