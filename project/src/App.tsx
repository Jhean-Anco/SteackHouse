import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import LoginScreen from './components/auth/LoginScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import MozoDashboard from './components/mozo/MozoDashboard';
import CocinaDashboard from './components/cocina/CocinaDashboard';
import ClienteDashboard from './components/cliente/ClienteDashboard';

function AppContent() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <LoginScreen />;
  }

  switch (currentUser.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'mozo':
      return <MozoDashboard />;
    case 'cocina':
      return <CocinaDashboard />;
    case 'cliente':
      return <ClienteDashboard />;
    default:
      return <LoginScreen />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;