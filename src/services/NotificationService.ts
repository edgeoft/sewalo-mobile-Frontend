import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { router, type Href } from 'expo-router';
import { ROUTES } from '@/constants/routes';
import type { FcmPushDataPayload } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: true,
  }),
});

/**
 * Headless background message handler for FCM.
 */
if (Platform.OS !== 'web') {
  try {
    setBackgroundMessageHandler(getMessaging(), async (_remoteMessage: RemoteMessage): Promise<void> => {});
  } catch {
    // Native Firebase App initializes during native boot
  }
}

/**
 * Route user based on notification data payload.
 */
export function navigateFromPushData(data?: FcmPushDataPayload | Record<string, unknown> | null): void {
  if (!data) {
    router.push(ROUTES.notifications);
    return;
  }

  const destinationRoute = data.route;
  if (typeof destinationRoute === 'string' && destinationRoute.startsWith('/')) {
    router.push(destinationRoute as Href);
    return;
  }

  router.push(ROUTES.notifications);
}

/**
 * Handle notification tap on foreground local banner.
 */
export function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data as FcmPushDataPayload | undefined;
  navigateFromPushData(data);
}

/**
 * Request device push notification permissions and configure Android channel.
 */
export async function requestPermissionsAsync(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#485aff',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
    });
  }

  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Retrieve native FCM Device Registration Token.
 */
export async function getFcmToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  // Ensure notification channel and permission are requested
  await requestPermissionsAsync().catch(() => false);

  try {
    const messaging = getMessaging();
    const token = await getToken(messaging);
    return token || null;
  } catch (error) {
    console.warn('[NotificationService] Failed to retrieve FCM token:', error);
    return null;
  }
}

/**
 * Hook to observe push notification events (Foreground, Background tap, Cold-start tap).
 */
export function useNotificationObserver(): void {
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    if (Platform.OS === 'web') {
      return () => {
        responseListener.current?.remove();
      };
    }

    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeOnNotificationOpened: (() => void) | undefined;

    try {
      const messaging = getMessaging();

      // 1. Foreground Push: Schedule local banner
      unsubscribeOnMessage = onMessage(messaging, async (remoteMessage: RemoteMessage) => {
        const title = remoteMessage.notification?.title ?? 'Sewalo';
        const body = remoteMessage.notification?.body ?? '';
        const data = remoteMessage.data ?? {};

        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data,
            sound: 'default',
          },
          trigger: null,
        });
      });

      // 2. Background Tap: Navigate to route
      unsubscribeOnNotificationOpened = onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
        navigateFromPushData(remoteMessage.data);
      });

      // 3. Cold Start: Check initial notification
      void getInitialNotification(messaging).then((remoteMessage: RemoteMessage | null) => {
        if (remoteMessage) {
          navigateFromPushData(remoteMessage.data);
        }
      });
    } catch (e) {
      console.warn('[NotificationService] Firebase messaging initialization skipped:', e);
    }

    return () => {
      responseListener.current?.remove();
      unsubscribeOnMessage?.();
      unsubscribeOnNotificationOpened?.();
    };
  }, []);
}
