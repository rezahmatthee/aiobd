import React from 'react';

export default function DataTable({ columns = [], data = [], onAction, emptyText = 'No data found' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
            {columns.map((col, i) => (
              <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: '#888', fontWeight: '500', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.header}
              </th>
            ))}
            {onAction && <th style={{ padding: '12px 16px', color: '#888', fontWeight: '500', fontSize: '12px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length + (onAction ? 1 : 0)} style={{ textAlign: 'center', padding: '32px', color: '#888' }}>{emptyText}</td></tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #1e1e1e' }}>
                {columns.map((col, ci) => (
                  <td key={ci} style={{ padding: '12px 16px', color: '#f5f5f5' }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
                {onAction && <td style={{ padding: '12px 16px' }}>{onAction(row)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
