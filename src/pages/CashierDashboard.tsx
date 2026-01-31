import React, { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { MenuGrid } from '@/components/cashier/MenuGrid';
import { Cart } from '@/components/cashier/Cart';
import { MobileCart, FloatingCartButton } from '@/components/cashier/MobileCart';
import { useIsMobile } from '@/hooks/use-mobile';

interface CashierDashboardProps {
  onLogout: () => void;
}

export function CashierDashboard({ onLogout }: CashierDashboardProps) {
  const isMobile = useIsMobile();
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader onLogout={onLogout} />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Menu Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-hidden">
          <MenuGrid />
        </div>

        {/* Cart Sidebar - Desktop only */}
        {!isMobile && (
          <div className="w-80 lg:w-96 border-l border-border p-6 bg-card/50 hidden md:block">
            <Cart />
          </div>
        )}
      </main>

      {/* Mobile Cart */}
      {isMobile && (
        <>
          <FloatingCartButton onClick={() => setMobileCartOpen(true)} />
          <MobileCart isOpen={mobileCartOpen} onOpenChange={setMobileCartOpen} />
        </>
      )}
    </div>
  );
}
