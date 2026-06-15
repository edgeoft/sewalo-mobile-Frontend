import React, { createContext, useContext, useEffect } from 'react';
import { UserRole } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import { UserProfile } from '@/features/auth/api/types';
import { ActivityIndicator, View } from 'react-native';

interface AuthContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: UserProfile, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const role = useAuthStore((state) => state.role);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setRole = useAuthStore((state) => state.setRole);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ role, setRole, isLoggedIn, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
