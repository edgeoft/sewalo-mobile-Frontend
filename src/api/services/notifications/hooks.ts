import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    queryKey: ['notifications', params],
    queryFn: () => getNotificationsAction(params),
    retry: false,
  });
};

export const useUnreadCountQuery = ({ enabled }: { enabled?: boolean } = {}) => {
  return useQuery<UnreadCountResponse, Error>({
    queryKey: ['notification-unread-count'],
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: markAllNotificationsReadAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteNotificationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-unread-count'] });
    },
  });
};

export const useRegisterDeviceToken = () => {
  return useMutation<void, Error, { device_token: string; platform: 'ios' | 'android' }>({
    mutationFn: registerDeviceTokenAction,
  });
};
