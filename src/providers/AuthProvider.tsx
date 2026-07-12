import { UserProfile, UserRole } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface AuthStateContextType {
  role: UserRole;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

interface AuthActionsContextType {
  setRole: (role: UserRole) => void;
  login: (user: UserProfile, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined);

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

  const stateValue = useMemo(() => ({ role, isLoggedIn, user, isLoading }), [role, isLoggedIn, user, isLoading]);
  const actionsValue = useMemo(() => ({ setRole, login, logout }), [setRole, login, logout]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  return (
    <AuthStateContext.Provider value={stateValue}>
      <AuthActionsContext.Provider value={actionsValue}>{children}</AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions() {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('useAuthActions must be used within an AuthProvider');
  }
  return context;
}

export function useAuth(): AuthStateContextType & AuthActionsContextType {
  const state = useAuthState();
  const actions = useAuthActions();
  return { ...state, ...actions };
}
