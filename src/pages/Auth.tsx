import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Utensils } from 'lucide-react';
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
        // TODO: Implement Convex signup
        console.log('Signup:', { email, password, name });
      } else {
        // TODO: Implement Convex signin
        console.log('Signin:', { email, password, rememberMe });
      }
      
      // For now, navigate to home after mock auth
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg">
              <img 
                src={ruLogo} 
                alt="Redeemers University Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <Card className="border-0 shadow-none lg:shadow-card lg:border">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl sm:text-3xl font-display">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </CardTitle>
              <p className="text-muted-foreground text-sm sm:text-base">
                {mode === 'signin' 
                  ? 'Enter your credentials to access your account' 
                  : 'Fill in your details to get started'}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 sm:h-12"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 sm:h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 sm:h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 h-11 sm:h-12"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Button 
                      variant="link" 
                      className="px-0 text-sm text-primary h-auto"
                      type="button"
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 sm:h-12 text-base gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                  <Button
                    variant="link"
                    className="px-1 text-primary"
                    onClick={() => {
                      setMode(mode === 'signin' ? 'signup' : 'signin');
                      setError(null);
                    }}
                  >
                    {mode === 'signin' ? 'Sign up' : 'Sign in'}
                  </Button>
                </p>
              </div>

              {/* Divider with access code option */}
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4 h-11 sm:h-12"
                onClick={() => navigate('/')}
              >
                Use Access Code Instead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
        </div>

        <div className="relative z-10 text-center text-white max-w-lg">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
            <img 
              src={ruLogo} 
              alt="Redeemers University Logo" 
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="font-display text-4xl font-bold mb-4">
            Redeemers University
          </h2>
          <p className="text-2xl font-semibold text-accent mb-6">
            New Era Cafeteria
          </p>
          
          <p className="text-lg text-white/80 mb-8">
            Experience seamless dining with our modern Point of Sale system. 
            Fast, efficient, and designed for the future.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {['Quick Orders', 'Real-time Analytics', 'Secure Payments'].map((feature) => (
              <span 
                key={feature}
                className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Floating food icons */}
          <div className="absolute top-20 right-20 animate-float">
            <Utensils className="w-12 h-12 text-accent/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
