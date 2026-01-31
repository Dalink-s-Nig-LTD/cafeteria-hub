import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { UserRole } from '@/types/cafeteria';

interface AuthContextType {
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (code: string, role: 'cashier' | 'admin') => boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple PIN codes for demo/fallback mode
const ACCESS_CODES = {
  cashier: '1234',
  admin: '0000',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [localRole, setLocalRole] = useState<UserRole>(null);

  // Legacy PIN-based login for demo mode
  const login = (code: string, targetRole: 'cashier' | 'admin'): boolean => {
    if (code === ACCESS_CODES[targetRole]) {
      setLocalRole(targetRole);
      return true;
    }
    return false;
  };

  const logout = async () => {
    setLocalRole(null);
    if (isAuthenticated) {
      await signOut();
    }
  };

  // Use local role for now, can be enhanced with Convex queries later
  const role = localRole;

  return (
    <AuthContext.Provider value={{ 
      role, 
      isLoading, 
      isAuthenticated,
      login, 
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
