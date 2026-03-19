import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.register(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      useAuthStore.setState({ user: data.user, token: data.token });
      navigate('/dashboard/user');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0066FF' }}>aiobd</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Create your account</p>
        </div>
        {error && <div style={{ background: '#FF475720', border: '1px solid #FF4757', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: '#FF4757', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {['firstName', 'lastName', 'email', 'password'].map(field => (
            <div key={field} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#888', marginBottom: '6px', textTransform: 'capitalize' }}>{field.replace(/([A-Z])/g, ' $1')}</label>
              <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} required={field === 'email' || field === 'password'}
                style={{ width: '100%', padding: '12px', background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#f5f5f5', fontSize: '14px', outline: 'none' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0066FF', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '16px', marginTop: '8px' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#0066FF' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
