import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  const { user, token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user) fetchMe();
  }, []);

  const getDashboardRoute = () => {
    if (!user) return '/login';
    if (user.role === 'superadmin') return '/dashboard/superadmin';
    if (user.role === 'admin') return '/dashboard/admin';
    return '/dashboard/user';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/user" element={
          <ProtectedRoute roles={['user', 'admin', 'superadmin']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute roles={['admin', 'superadmin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/superadmin" element={
          <ProtectedRoute roles={['superadmin']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navigate to={getDashboardRoute()} replace />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
