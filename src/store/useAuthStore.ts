import { create } from 'zustand';
import { USER_ROLES, UserRole } from '@/types';
import { internalClient } from '@/api';
import { getProfileAction, logoutAction } from '@/features/auth/api/actions';
import { UserProfile } from '@/features/auth/api/types';

interface AuthState {
  role: UserRole;
  isLoggedIn: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  login: (user: UserProfile, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
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
    try {
      // Call backend logout endpoint (best-effort)
      await logoutAction();
    } catch (error) {
      console.warn('[AuthStore] Backend logout failed:', error);
    } finally {
      // Clear tokens from secure store
      if (internalClient.tokenManager) {
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
    } catch (error) {
      console.warn('[AuthStore] Initialization session verification failed, clearing tokens:', error);
      // Clean up session if token is invalid or expired
      if (internalClient.tokenManager) {
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
