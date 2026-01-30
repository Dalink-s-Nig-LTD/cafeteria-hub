import React from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MenuGrid } from '@/components/cashier/MenuGrid';
import { Cart } from '@/components/cashier/Cart';

interface CashierDashboardProps {
  onLogout: () => void;
}

export function CashierDashboard({ onLogout }: CashierDashboardProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader onLogout={onLogout} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Menu Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <MenuGrid />
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 border-l border-border p-6 bg-card/50">
          <Cart />
        </div>
      </main>
    </div>
  );
}
