import { type BookingStatus } from '@/types';

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

export interface BookingStatusPresentation {
  label: string;
  dotColor: string;
  backgroundColor: string;
  textColor: string;
}

export const BOOKING_STATUS_PRESENTATION: Record<BookingStatus, BookingStatusPresentation> = {
  [BOOKING_STATUSES.All]: {
    label: 'All bookings',
    dotColor: '#6b7280',
    backgroundColor: '#f3f4f6',
    textColor: '#374151',
  },
  [BOOKING_STATUSES.Pending]: {
    label: 'Pending',
    dotColor: '#eab308',
    backgroundColor: '#fff9db',
    textColor: '#a16207',
  },
  [BOOKING_STATUSES.Confirmed]: {
    label: 'Confirmed',
    dotColor: '#22c55e',
    backgroundColor: '#dcfce7',
    textColor: '#15803d',
  },
  [BOOKING_STATUSES.InProgress]: {
    label: 'In Progress',
    dotColor: '#3b82f6',
    backgroundColor: '#dbeafe',
    textColor: '#1d4ed8',
  },
  [BOOKING_STATUSES.Completed]: {
    label: 'Completed',
    dotColor: '#10b981',
    backgroundColor: '#d1fae5',
    textColor: '#047857',
  },
  [BOOKING_STATUSES.Cancelled]: {
    label: 'Cancelled',
    dotColor: '#ef4444',
    backgroundColor: '#fee2e2',
    textColor: '#b91c1c',
  },
  [BOOKING_STATUSES.Rejected]: {
    label: 'Rejected',
    dotColor: '#f97316',
    backgroundColor: '#ffedd5',
    textColor: '#c2410c',
  },
  [BOOKING_STATUSES.ReadyToPay]: {
    label: 'Ready to pay',
    dotColor: '#6366f1',
    backgroundColor: '#e0e7ff',
    textColor: '#4338ca',
  },
  [BOOKING_STATUSES.PaymentInitiated]: {
    label: 'Payment Initiated',
    dotColor: '#2563eb',
    backgroundColor: '#dbeafe',
    textColor: '#1d4ed8',
  },
  [BOOKING_STATUSES.Paid]: {
    label: 'Paid',
    dotColor: '#0f766e',
    backgroundColor: '#ccfbf1',
    textColor: '#115e59',
  },
};

export const BOOKING_STATUS_FILTER_OPTIONS: BookingStatus[] = [
  BOOKING_STATUSES.All,
  BOOKING_STATUSES.Pending,
  BOOKING_STATUSES.Confirmed,
  BOOKING_STATUSES.InProgress,
  BOOKING_STATUSES.Completed,
  BOOKING_STATUSES.Cancelled,
  BOOKING_STATUSES.Rejected,
  BOOKING_STATUSES.ReadyToPay,
  BOOKING_STATUSES.PaymentInitiated,
  BOOKING_STATUSES.Paid,
];
