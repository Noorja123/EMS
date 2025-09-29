import React from 'react';
import { AuthProvider } from './components/AuthContext';
import { EmployeeProvider } from './components/EmployeeContext';
import { MainApp } from './components/MainApp';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <MainApp />
        <Toaster />
      </EmployeeProvider>
    </AuthProvider>
  );
}