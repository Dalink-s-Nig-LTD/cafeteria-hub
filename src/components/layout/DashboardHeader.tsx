import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  onLogout: () => void;
}

export function DashboardHeader({ onLogout }: DashboardHeaderProps) {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isAdmin ? 'bg-accent/20' : 'bg-primary/10'}
          `}>
            {isAdmin ? (
              <Shield className="w-5 h-5 text-accent" />
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              {isAdmin ? 'Admin Dashboard' : 'Cashier Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Redeemers University · New Era Cafeteria
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
