import React, { useState } from 'react';

export default function NotificationPanel({ notifications = [] }) {
  const [visible, setVisible] = useState(true);
  if (!visible || notifications.length === 0) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
        <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '18px' }}>×</button>
      </div>
      {notifications.map((n, i) => (
        <div key={i} style={{ padding: '12px', borderRadius: '8px', background: '#2a2a2a', marginBottom: '8px', borderLeft: `3px solid ${n.type === 'error' ? '#FF4757' : n.type === 'warning' ? '#FFA500' : '#0066FF'}` }}>
          <p style={{ margin: 0, fontSize: '14px' }}>{n.message}</p>
          {n.time && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#888' }}>{n.time}</p>}
        </div>
      ))}
    </div>
  );
}
