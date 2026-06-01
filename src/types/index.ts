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
