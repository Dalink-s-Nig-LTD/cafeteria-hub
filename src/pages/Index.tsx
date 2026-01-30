import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Landing } from './Landing';
import { CashierDashboard } from './CashierDashboard';
import { AdminDashboard } from './AdminDashboard';

function AppContent() {
  const { role, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (!role) {
    return <Landing onLogin={() => {}} />;
  }

  if (role === 'cashier') {
    return (
      <CartProvider>
        <CashierDashboard onLogout={handleLogout} />
      </CartProvider>
    );
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
