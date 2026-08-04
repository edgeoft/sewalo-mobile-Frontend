import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { THEME_COLORS } from '@/constants/colors';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useAuthStore((state) => state.isLoading);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View className="flex-1">
      {children}
      {isLoading && (
        <View className="absolute inset-0 z-50 bg-secondary justify-center items-center">
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      )}
    </View>
  );
}

export function useAuthState() {
  const role = useAuthStore((state) => state.role);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  return { role, isLoggedIn, user, isLoading };
}

export function useAuthActions() {
  const setRole = useAuthStore((state) => state.setRole);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  return { setRole, login, logout };
}

export function useAuth() {
  const role = useAuthStore((state) => state.role);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setRole = useAuthStore((state) => state.setRole);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    role,
    isLoggedIn,
    user,
    isLoading,
    setRole,
    login,
    logout,
  };
}
