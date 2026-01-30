import React from 'react';
import { AccessCard } from '@/components/landing/AccessCard';
import { UtensilsCrossed } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <UtensilsCrossed className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Redeemers University
          </h1>
          <p className="text-xl text-gradient font-semibold mb-2">
            New Era Cafeteria
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Welcome to our Point of Sale system. Select your role to continue.
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AccessCard type="cashier" onSuccess={onLogin} />
          <AccessCard type="admin" onSuccess={onLogin} />
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>© 2024 Redeemers University. All rights reserved.</p>
          <p className="mt-1">Powered by New Era Technology</p>
        </footer>
      </div>
    </div>
  );
}
