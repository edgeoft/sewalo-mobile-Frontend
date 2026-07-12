import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const useGetNotificationsQuery = (params: GetNotificationsParams = {}) => {
  return useQuery<GetNotificationsResponse, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.LIST(params),
    queryFn: () => getNotificationsAction(params),
    retry: false,
  });
};

export const useUnreadCountQuery = ({ enabled }: { enabled?: boolean } = {}) => {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: getUnreadCountAction,
    refetchInterval: 5000,
    retry: false,
    enabled,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: markNotificationReadAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteNotificationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT });
    },
  });
};

export const useRegisterDeviceToken = () => {
  return useMutation<void, Error, { device_token: string; platform: 'ios' | 'android' }>({
    mutationFn: registerDeviceTokenAction,
  });
};
