import React from 'react';
import { AccessCard } from '@/components/landing/AccessCard';
import { FoodSlider } from '@/components/landing/FoodSlider';
import { Footer } from '@/components/layout/Footer';
import ruLogo from '@/assets/ru-logo.jpg';

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
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
            <img 
              src={ruLogo} 
              alt="Redeemers University Logo" 
              className="w-full h-full object-cover"
            />
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

        {/* Food Slider */}
        <div className="w-full mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <FoodSlider />
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AccessCard type="cashier" onSuccess={onLogin} />
          <AccessCard type="admin" onSuccess={onLogin} />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
