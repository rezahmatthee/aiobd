import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children, roles }) {
  const { user, token, fetchMe, loading } = useAuthStore();

  useEffect(() => {
    if (token && !user) fetchMe();
  }, [token, user, fetchMe]);

  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>;
  if (user && roles && !roles.includes(user.role)) return <Navigate to={`/dashboard/${user.role === 'superadmin' ? 'superadmin' : user.role === 'admin' ? 'admin' : 'user'}`} replace />;
  return children;
}
