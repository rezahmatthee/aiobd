import React from 'react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '28px', maxWidth: '400px', width: '90%' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>{title}</h3>
        <p style={{ color: '#888', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #2a2a2a', background: 'transparent', color: '#f5f5f5' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: danger ? '#FF4757' : '#0066FF', color: '#fff', fontWeight: '600' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
