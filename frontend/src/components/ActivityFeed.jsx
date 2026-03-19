import React from 'react';

const actionColors = { login: '#0066FF', logout: '#888', update_user: '#FFA500', delete_user: '#FF4757', create_admin: '#7C3AED', system_backup: '#00D084' };

export default function ActivityFeed({ activities = [], title = 'Recent Activity' }) {
  const fmt = (ts) => new Date(ts).toLocaleString();
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>{title}</h3>
      {activities.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '24px 0' }}>No activity yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: actionColors[a.action] || '#0066FF', marginTop: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', margin: 0 }}>
                  <strong style={{ textTransform: 'capitalize' }}>{a.action?.replace(/_/g, ' ')}</strong>
                  {a.resourceType && <span style={{ color: '#888' }}> on {a.resourceType}</span>}
                </p>
                <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0' }}>{fmt(a.timestamp)}</p>
              </div>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', background: a.status === 'failed' ? '#FF475720' : '#00D08420', color: a.status === 'failed' ? '#FF4757' : '#00D084' }}>
                {a.status || 'success'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
