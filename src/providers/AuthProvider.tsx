import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
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

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthRole = () => useAuthStore((state) => state.role);
export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);

export function useAuthState() {
  return useAuthStore(
    useShallow((state) => ({
      role: state.role,
      isLoggedIn: state.isLoggedIn,
      user: state.user,
      isLoading: state.isLoading,
    })),
  );
}

export function useAuthActions() {
  return useAuthStore(
    useShallow((state) => ({
      setRole: state.setRole,
      login: state.login,
      logout: state.logout,
      updateUser: state.updateUser,
    })),
  );
}

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      role: state.role,
      isLoggedIn: state.isLoggedIn,
      user: state.user,
      isLoading: state.isLoading,
      setRole: state.setRole,
      login: state.login,
      logout: state.logout,
    })),
  );
}
