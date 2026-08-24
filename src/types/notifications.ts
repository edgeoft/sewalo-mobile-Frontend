import { PaginatedResponse } from './common';

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
  type?: string;
  unread_only?: boolean;
};

export type GetNotificationsResponse = PaginatedResponse<Notification>;

export interface UnreadCountResponse {
  unread_count: number;
}

export interface DeviceTokenPayload {
  device_token: string;
  platform: 'android' | 'ios';
}

export interface UnregisterDeviceTokenPayload {
  device_token: string;
}

export interface FcmPushDataPayload {
  notification_id?: string;
  notification_type?: string;
  route?: string;
  referenceable_id?: string;
  referenceable_type?: string;
  [key: string]: string | undefined;
}
