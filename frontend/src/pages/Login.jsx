import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      const role = data.user?.role;
      if (role === 'superadmin') navigate('/dashboard/superadmin');
      else if (role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/user');
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0066FF' }}>aiobd</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Sign in to your account</p>
        </div>
        {error && <div style={{ background: '#FF475720', border: '1px solid #FF4757', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#FF4757', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '6px' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
              style={{ width: '100%', padding: '12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '6px' }}>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
              style={{ width: '100%', padding: '12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none' }} />
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0066FF', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '16px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#0066FF' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
