import { internalClient } from '@/api/client/instances/internal';
import { API_ENDPOINTS } from '@/constants/api';
import type {
  DeviceTokenPayload,
  GetNotificationsParams,
  GetNotificationsResponse,
  UnreadCountResponse,
  UnregisterDeviceTokenPayload,
} from '@/types';

export const getNotificationsAction = async (
  params: GetNotificationsParams = {},
): Promise<GetNotificationsResponse> => {
  return internalClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
};

export const getUnreadCountAction = async (): Promise<UnreadCountResponse> => {
  return internalClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
};

export const markNotificationReadAction = async (id: string): Promise<void> => {
  return internalClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
};

export const markAllNotificationsReadAction = async (): Promise<void> => {
  return internalClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
};

export const deleteNotificationAction = async (id: string): Promise<void> => {
  return internalClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
};

export const registerDeviceTokenAction = async (payload: DeviceTokenPayload): Promise<void> => {
  return internalClient.post(API_ENDPOINTS.DEVICE_TOKENS.REGISTER, payload);
};

export const unregisterDeviceTokenAction = async (payload: UnregisterDeviceTokenPayload): Promise<void> => {
  return internalClient.post(API_ENDPOINTS.DEVICE_TOKENS.UNREGISTER, payload);
};
