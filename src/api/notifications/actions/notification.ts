import { internalClient } from '@/api/clients/internal';
import type {
  Notification,
  GetNotificationsParams,
  GetNotificationsResponse,
  UnreadCountResponse,
} from '../types/notification';

export const getNotificationsAction = async (
  params: GetNotificationsParams = {},
): Promise<GetNotificationsResponse> => {
  return internalClient.get('/notifications', { params });
};

export const getUnreadCountAction = async (): Promise<UnreadCountResponse> => {
  return internalClient.get('/notifications/unread-count');
};

export const markNotificationReadAction = async (id: string): Promise<void> => {
  return internalClient.post(`/notifications/${id}/mark-read`);
};

export const markAllNotificationsReadAction = async (): Promise<void> => {
  return internalClient.post('/notifications/mark-all-read');
};

export const deleteNotificationAction = async (id: string): Promise<void> => {
  return internalClient.delete(`/notifications/${id}`);
};

export const registerDeviceTokenAction = async (payload: {
  device_token: string;
  platform: 'ios' | 'android';
}): Promise<void> => {
  return internalClient.post('/device-tokens', payload);
};
