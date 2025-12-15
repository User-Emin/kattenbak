/**
 * AUTH CONTEXT - DRY State Management
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '@/types/auth';
import { getUser, getToken, logout as logoutApi } from '@/lib/api/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const token = getToken();
    const storedUser = getUser();
    
    if (token && storedUser) {
      setUser(storedUser);
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    setUser(null);
    logoutApi();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// DRY: Custom hook for using auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

