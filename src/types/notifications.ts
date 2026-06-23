import { PaginatedResponse } from './common';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  referenceable_id: string | null;
  referenceable_type: string | null;
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
