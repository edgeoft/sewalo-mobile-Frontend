import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getMessaging, onTokenRefresh } from '@react-native-firebase/messaging';
import { useAuthStore } from '@/store/useAuthStore';
import { useRegisterDeviceToken } from '@/api/services/notifications/hooks';
import { getFcmToken } from '@/services/NotificationService';
import type { DeviceTokenPayload } from '@/types';

const SECURE_STORE_FCM_KEY = 'SEWALO_LAST_REGISTERED_FCM_TOKEN';
const SECURE_STORE_USER_KEY = 'SEWALO_LAST_REGISTERED_USER_ID';

export function usePushRegistration(): void {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const { mutate: registerToken } = useRegisterDeviceToken();
  const isRegisteringRef = useRef(false);

  const performRegistration = useCallback(
    async (forcedToken?: string): Promise<void> => {
      if (Platform.OS === 'web' || !isLoggedIn || !user?.id || isRegisteringRef.current) {
        return;
      }

      isRegisteringRef.current = true;
      try {
        const fcmToken = forcedToken ?? (await getFcmToken());
        if (!fcmToken) {
          return;
        }

        const lastToken = await SecureStore.getItemAsync(SECURE_STORE_FCM_KEY).catch(() => null);
        const lastUserId = await SecureStore.getItemAsync(SECURE_STORE_USER_KEY).catch(() => null);

        if (lastToken === fcmToken && lastUserId === user.id) {
          return;
        }

        const payload: DeviceTokenPayload = {
          device_token: fcmToken,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        };

        registerToken(payload, {
          onSuccess: async () => {
            await SecureStore.setItemAsync(SECURE_STORE_FCM_KEY, fcmToken).catch(() => {});
            await SecureStore.setItemAsync(SECURE_STORE_USER_KEY, user.id).catch(() => {});
          },
          onError: (error) => {
            console.warn('[usePushRegistration] Token registration failed:', error);
          },
        });
      } finally {
        isRegisteringRef.current = false;
      }
    },
    [isLoggedIn, user?.id, registerToken],
  );

  useEffect(() => {
    if (!isLoggedIn || Platform.OS === 'web') {
      return;
    }

    void performRegistration();

    let unsubscribeTokenRefresh: (() => void) | undefined;
    try {
      const messaging = getMessaging();
      unsubscribeTokenRefresh = onTokenRefresh(messaging, (newToken: string) => {
        if (newToken) {
          void performRegistration(newToken);
        }
      });
    } catch {
      // Firebase messaging not ready
    }

    const handleAppStateChange = (nextAppState: AppStateStatus): void => {
      if (nextAppState === 'active') {
        void performRegistration();
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribeTokenRefresh?.();
      appStateSubscription.remove();
    };
  }, [isLoggedIn, performRegistration]);
}
