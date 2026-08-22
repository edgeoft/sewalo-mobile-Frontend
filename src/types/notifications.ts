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

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: string;
  unread_only?: boolean;
}

export type GetNotificationsResponse = PaginatedResponse<Notification>;

export interface UnreadCountResponse {
  unread_count: number;
}
