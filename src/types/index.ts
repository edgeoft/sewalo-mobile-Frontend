export const USER_ROLES = {
  Customer: 'customer',
  Provider: 'provider',
  Guest: 'guest',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const BOOKING_STATUSES = {
  All: 'all',
  Pending: 'pending',
  Confirmed: 'confirmed',
  InProgress: 'in_progress',
  Completed: 'completed',
  Cancelled: 'cancelled',
  Rejected: 'rejected',
  ReadyToPay: 'ready_to_pay',
  PaymentInitiated: 'payment_initiated',
  Paid: 'paid',
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

export const NOTIFICATION_FILTERS = {
  All: 'all',
  Unread: 'unread',
} as const;

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[keyof typeof NOTIFICATION_FILTERS];

export interface NotificationItem {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'promo' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: boolean;
  relatedId?: string;
}

export const SERVICE_LOCATIONS = {
  Fixed: 'fixed_location',
  Remote: 'remote_location',
  Customer: 'customer_location',
} as const;

export type ServiceLocation = (typeof SERVICE_LOCATIONS)[keyof typeof SERVICE_LOCATIONS];

export const DELIVERY_TYPES = {
  Fixed: 'fixed',
  Remote: 'remote',
  Customer: 'at_customer',
} as const;

export type DeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];
