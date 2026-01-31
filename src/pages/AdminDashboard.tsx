import React, { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StatsCards } from '@/components/admin/StatsCards';
import { SalesChart } from '@/components/admin/SalesChart';
import { CategoryChart } from '@/components/admin/CategoryChart';
import { MenuManagement } from '@/components/admin/MenuManagement';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { UserManagement } from '@/components/admin/UserManagement';
import { AccessCodeGenerator } from '@/components/admin/AccessCodeGenerator';
import { ExportReports } from '@/components/admin/ExportReports';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Users, 
  Key, 
  FileText, 
  Menu,
  Crown
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserRole } from '@/types/cafeteria';

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = 'overview' | 'menu' | 'users' | 'codes' | 'reports';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  superadminOnly?: boolean;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // For demo, assume superadmin role - in production this comes from auth context
  const userRole: UserRole = 'superadmin';
  const isSuperadmin = userRole === 'superadmin';

  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'menu', label: 'Menu', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" />, superadminOnly: true },
    { id: 'codes', label: 'Access Codes', icon: <Key className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  const visibleTabs = tabs.filter(tab => !tab.superadminOnly || isSuperadmin);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <StatsCards />
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              <SalesChart />
              <CategoryChart />
            </div>
            <RecentOrders />
          </div>
        );
      case 'menu':
        return (
          <div className="animate-fade-in">
            <MenuManagement />
          </div>
        );
      case 'users':
        return isSuperadmin ? (
          <div className="animate-fade-in">
            <UserManagement />
          </div>
        ) : null;
      case 'codes':
        return (
          <div className="animate-fade-in">
            <AccessCodeGenerator isSuperadmin={isSuperadmin} />
          </div>
        );
      case 'reports':
        return (
          <div className="animate-fade-in">
            <ExportReports />
          </div>
        );
      default:
        return null;
    }
  };

  const TabNavigation = () => (
    <div className="flex flex-col gap-1">
      {visibleTabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'ghost'}
          onClick={() => handleTabChange(tab.id)}
          className="justify-start gap-2"
        >
          {tab.icon}
          {tab.label}
          {tab.superadminOnly && (
            <Crown className="w-3 h-3 ml-auto text-accent" />
          )}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader onLogout={onLogout} />
      
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 border-r border-border p-4 bg-card/50">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Navigation
            </h2>
          </div>
          <TabNavigation />
        </aside>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden border-b border-border bg-card/50">
          <div className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hide">
            {/* Mobile Menu Trigger for more tabs */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="py-4">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Navigation
                  </h2>
                  <TabNavigation />
                </div>
              </SheetContent>
            </Sheet>

            {/* Quick access tabs */}
            {visibleTabs.slice(0, 3).map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleTabChange(tab.id)}
                className="gap-1.5 shrink-0"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
