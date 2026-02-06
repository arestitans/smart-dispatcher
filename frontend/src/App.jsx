import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Technicians from './pages/Technicians';
import Claims from './pages/Claims';
import Reports from './pages/Reports';
import Users from './pages/Users';
import SpreadsheetImport from './pages/SpreadsheetImport';
import { useAuthStore } from './store/authStore';
import './index.css';

// Protected Route component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const { isAuthenticated, login } = useAuthStore();

  useEffect(() => {
    // Auto-login in public mode so the dashboard is usable without credentials.
    if (!isAuthenticated && import.meta.env.VITE_PUBLIC_MODE === 'true') {
      const role = import.meta.env.VITE_PUBLIC_LOGIN_ROLE || 'guest';
      const demoUser = { id: 0, username: role, name: 'Public User', role };
      login(demoUser, 'public-token');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a3d24',
            color: '#fff',
            border: '1px solid #2d5a3d'
          }
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'helpdesk']}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="technicians" element={<Technicians />} />
          <Route path="claims" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <Claims />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="import" element={
            <ProtectedRoute allowedRoles={['admin', 'supervisor', 'helpdesk']}>
              <SpreadsheetImport />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
