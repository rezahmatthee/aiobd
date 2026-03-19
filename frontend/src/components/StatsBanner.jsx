import React from 'react';
import DashboardCard from './DashboardCard';

export default function StatsBanner({ stats = [] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {stats.map((stat, i) => (
        <DashboardCard key={i} title={stat.title} value={stat.value} subtitle={stat.subtitle} icon={stat.icon} color={stat.color} trend={stat.trend} />
      ))}
    </div>
  );
}
