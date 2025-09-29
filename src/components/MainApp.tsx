import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { AdminDashboard } from './AdminDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return showRegister ? (
      <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginPage onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
};