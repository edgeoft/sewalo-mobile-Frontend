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

export interface GetNotificationsResponse {
  current_page: number;
  data: Notification[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}
