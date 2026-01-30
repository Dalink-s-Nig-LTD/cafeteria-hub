import React, { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsCards } from '@/components/admin/StatsCards';
import { SalesChart } from '@/components/admin/SalesChart';
import { CategoryChart } from '@/components/admin/CategoryChart';
import { MenuManagement } from '@/components/admin/MenuManagement';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, UtensilsCrossed } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'menu';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader onLogout={onLogout} />
      
      <main className="flex-1 p-6 overflow-auto">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'menu' ? 'default' : 'outline'}
            onClick={() => setActiveTab('menu')}
            className="gap-2"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Menu Management
          </Button>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <StatsCards />

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <SalesChart />
              <CategoryChart />
            </div>

            {/* Recent Orders */}
            <RecentOrders />
          </div>
        ) : (
          <div className="animate-fade-in">
            <MenuManagement />
          </div>
        )}
      </main>
    </div>
  );
}
