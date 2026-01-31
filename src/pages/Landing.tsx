import React from 'react';
import { AccessCard } from '@/components/landing/AccessCard';
import { FoodSlider } from '@/components/landing/FoodSlider';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import ruLogo from '@/assets/ru-logo.jpg';

interface LandingProps {
  onLogin: () => void;
}

export function Landing({ onLogin }: LandingProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Logo & Title */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
            <img 
              src={ruLogo} 
              alt="Redeemers University Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
            Redeemers University
          </h1>
          <p className="text-lg sm:text-xl text-gradient font-semibold mb-2">
            New Era Cafeteria
          </p>
          <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base px-4">
            Welcome to our Point of Sale system. Select your role to continue.
          </p>
        </div>

        {/* Food Slider */}
        <div className="w-full mb-6 sm:mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <FoodSlider />
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl px-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <AccessCard type="cashier" onSuccess={onLogin} />
          <AccessCard type="admin" onSuccess={onLogin} />
        </div>

        {/* Sign up / Sign in option */}
        <div className="mt-6 sm:mt-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Sign in with Email
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
