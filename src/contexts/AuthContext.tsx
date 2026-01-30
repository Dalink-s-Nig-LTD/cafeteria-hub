import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/types/cafeteria';

interface AuthContextType {
  role: UserRole;
  login: (code: string, role: 'cashier' | 'admin') => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple PIN codes for demo
const ACCESS_CODES = {
  cashier: '1234',
  admin: '0000',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const login = (code: string, targetRole: 'cashier' | 'admin'): boolean => {
    if (code === ACCESS_CODES[targetRole]) {
      setRole(targetRole);
      return true;
    }
    return false;
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
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
