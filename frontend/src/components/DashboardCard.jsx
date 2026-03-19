import React from 'react';

export default function DashboardCard({ title, value, subtitle, icon, color = '#0066FF', trend }) {
  return (
    <div style={{
      background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px',
      padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
          <h3 style={{ fontSize: '28px', fontWeight: '700', color: '#f5f5f5', margin: 0 }}>{value ?? '—'}</h3>
          {subtitle && <p style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>{subtitle}</p>}
          {trend !== undefined && (
            <span style={{ fontSize: '12px', color: trend >= 0 ? '#00D084' : '#FF4757', marginTop: '8px', display: 'block' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
            </span>
          )}
        </div>
        {icon && (
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px'
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: color, opacity: 0.6 }} />
    </div>
  );
}
