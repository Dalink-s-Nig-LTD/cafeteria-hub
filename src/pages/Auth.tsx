import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Utensils, ShoppingBag, CreditCard, ChefHat, Coffee } from 'lucide-react';
import ruLogo from '@/assets/ru-logo.jpg';

type AuthMode = 'signin' | 'signup';

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        console.log('Signup:', { email, password, name });
      } else {
        console.log('Signin:', { email, password, rememberMe });
      }
      
      setTimeout(() => {
        navigate('/');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-primary">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Main Card */}
      <Card className="relative w-full max-w-4xl overflow-hidden shadow-2xl border-0 flex flex-col lg:flex-row min-h-[500px] lg:min-h-[560px]">
        {/* Left Side - Form */}
        <div className="flex-1 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-card">
          <div className="max-w-sm mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-8 text-center lg:text-left">
              {mode === 'signin' ? 'Login' : 'Sign Up'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Username or email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  {mode === 'signin' && (
                    <Button 
                      variant="link" 
                      className="px-0 text-sm text-primary h-auto p-0 font-normal"
                      type="button"
                    >
                      Forgot password ?
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-secondary/50 border-0 pr-12 focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-muted-foreground/50"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer font-normal">
                    Remember me
                  </Label>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  mode === 'signin' ? 'Login' : 'Sign Up'
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account ?" : 'Already have an account ?'}
              <Button
                variant="link"
                className="px-1 text-primary font-medium"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
              >
                {mode === 'signin' ? 'Sign up' : 'Login'}
              </Button>
            </p>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary/80 to-secondary items-center justify-center p-8 relative overflow-hidden">
          {/* Floating Icons */}
          <div className="absolute inset-0">
            <div className="absolute top-8 right-12 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
              <Utensils className="w-7 h-7 text-primary" />
            </div>
            <div className="absolute top-20 left-16 w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
              <Coffee className="w-6 h-6 text-accent" />
            </div>
            <div className="absolute bottom-32 right-20 w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <div className="absolute bottom-20 left-12 w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center animate-float" style={{ animationDelay: '1.5s' }}>
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute top-1/3 right-8 w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
              <ChefHat className="w-5 h-5 text-accent" />
            </div>
          </div>

          {/* Center content */}
          <div className="relative z-10 text-center max-w-xs">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-white">
              <img 
                src={ruLogo} 
                alt="Redeemers University Logo" 
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-xl font-display font-bold text-foreground mb-3">
              New Era Cafeteria POS
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Streamline your cafeteria operations with our modern point of sale system. Fast, efficient, and designed for your needs.
            </p>

            {/* Dots indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <span className="w-8 h-2 rounded-full bg-primary" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        </div>
      </Card>

      {/* Back to home link */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10"
        onClick={() => navigate('/')}
      >
        ← Back to home
      </Button>
    </div>
  );
}
