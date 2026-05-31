import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES, UserRole } from '@/types';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Default to guest for testing and initial loading
  const [role, setRole] = useState<UserRole>(USER_ROLES.Guest);

  const isLoggedIn = role !== USER_ROLES.Guest;

  const login = (newRole: UserRole) => {
    setRole(newRole);
  };

  const logout = () => {
    setRole(USER_ROLES.Guest);
  };

  return <AuthContext.Provider value={{ role, setRole, isLoggedIn, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
