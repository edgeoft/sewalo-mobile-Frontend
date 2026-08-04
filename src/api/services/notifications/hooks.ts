import { createQueryHook, createMutationHook } from '@/api/client/query/factory';
import { QUERY_KEYS } from '@/constants/queryKeys';
import {
  getNotificationsAction,
  getUnreadCountAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
  registerDeviceTokenAction,
} from './actions';
import type { GetNotificationsParams, GetNotificationsResponse, UnreadCountResponse } from '@/types';

const notificationsQueryHook = createQueryHook<GetNotificationsResponse, GetNotificationsParams | undefined>(
  (params) => QUERY_KEYS.NOTIFICATIONS.LIST(params ?? {}),
  (params) => getNotificationsAction(params ?? {}),
);

export const useGetNotificationsQuery = (params: GetNotificationsParams = {}) => notificationsQueryHook(params);

const unreadCountQueryHook = createQueryHook<UnreadCountResponse, void>(
  () => QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
  getUnreadCountAction,
  {
    refetchInterval: 60000, // 60 seconds (P5 fix)
  },
);

export const useUnreadCountQuery = ({ enabled }: { enabled?: boolean } = {}) =>
  unreadCountQueryHook(undefined, { enabled });

const notificationInvalidationKeys = () => [QUERY_KEYS.NOTIFICATIONS.ALL, QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT];

export const useMarkNotificationRead = createMutationHook<void, string>(markNotificationReadAction, {
  invalidateKeys: notificationInvalidationKeys,
});

export const useMarkAllNotificationsRead = createMutationHook<void, void>(markAllNotificationsReadAction, {
  invalidateKeys: notificationInvalidationKeys,
});

export const useDeleteNotification = createMutationHook<void, string>(deleteNotificationAction, {
  invalidateKeys: notificationInvalidationKeys,
});

export const useRegisterDeviceToken = createMutationHook<void, { device_token: string; platform: 'ios' | 'android' }>(
  registerDeviceTokenAction,
);
