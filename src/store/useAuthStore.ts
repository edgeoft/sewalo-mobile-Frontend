import { internalClient } from '@/api/client/instances/internal';
import { queryClient } from '@/api/client/query/queryClient';
import { getProfileAction, logoutAction } from '@/features/auth/api/actions';
import { UserProfile, USER_ROLES, UserRole } from '@/types';
import { create } from 'zustand';

interface AuthState {
  role: UserRole;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  login: (user: UserProfile, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: USER_ROLES.Guest,
  isLoggedIn: false,
  user: null,
  isLoading: true,

  setRole: (role: UserRole) =>
    set({
      role,
      isLoggedIn: role !== USER_ROLES.Guest,
    }),

  updateUser: (user: UserProfile) =>
    set({
      user,
      role: user.current_role || user.role,
    }),

  login: async (user: UserProfile, accessToken: string, refreshToken?: string) => {
    // Save tokens securely in expo-secure-store via our client's token manager
    if (internalClient.tokenManager) {
      await internalClient.tokenManager.setTokens({
        accessToken,
        refreshToken: refreshToken || accessToken, // fallback to accessToken if single is used
      });
    }

    set({
      user,
      role: user.current_role || user.role,
      isLoggedIn: true,
      isLoading: false,
    });
  },

  logout: async () => {
    // Clear tokens from secure store immediately
    if (internalClient.tokenManager) {
      try {
        await internalClient.tokenManager.clearTokens();
      } catch (err) {
        console.warn('[AuthStore] Clear tokens failed:', err);
      }
    }

    // Reset all TanStack Query caches to prevent stale data from previous session
    queryClient.clear();

    // Reset Zustand state immediately
    set({
      role: USER_ROLES.Guest,
      isLoggedIn: false,
      user: null,
      isLoading: false,
    });

    // Fire backend logout in the background, best-effort and non-blocking
    logoutAction().catch((error) => {
      console.warn('[AuthStore] Backend logout background call failed:', error);
    });
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // Check if we have an active access token in SecureStore
      const token = internalClient.tokenManager ? await internalClient.tokenManager.getAccessToken() : null;

      if (token) {
        // Fetch fresh profile data to verify the token is valid
        const response = await getProfileAction();
        set({
          user: response.user,
          role: response.user.current_role || response.user.role,
          isLoggedIn: true,
          isLoading: false,
        });
      } else {
        set({
          role: USER_ROLES.Guest,
          isLoggedIn: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.warn('[AuthStore] Initialization session verification failed:', error);
      // Clean up session only if token is invalid or expired (401/403)
      const isAuthError = error?.status === 401 || error?.status === 403;
      if (isAuthError && internalClient.tokenManager) {
        await internalClient.tokenManager.clearTokens();
      }
      set({
        role: USER_ROLES.Guest,
        isLoggedIn: false,
        user: null,
        isLoading: false,
      });
    }
  },
}));
