// Re-export Constants
import { USER_ROLES, USER_STATUSES } from '@/constants/roles';
import { BOOKING_STATUSES } from '@/constants/bookings';
import { NOTIFICATION_FILTERS } from '@/constants/notifications';
import { SERVICE_LOCATIONS, DELIVERY_TYPES } from '@/constants/services';
import { PAYMENT_METHODS } from '@/constants/payment';

export {
  USER_ROLES,
  USER_STATUSES,
  BOOKING_STATUSES,
  NOTIFICATION_FILTERS,
  SERVICE_LOCATIONS,
  DELIVERY_TYPES,
  PAYMENT_METHODS,
};

// Re-export Helper Types from Constants
export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[keyof typeof NOTIFICATION_FILTERS];
export type ServiceLocation = (typeof SERVICE_LOCATIONS)[keyof typeof SERVICE_LOCATIONS];
export type DeliveryType = (typeof DELIVERY_TYPES)[keyof typeof DELIVERY_TYPES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Re-export Module/Feature Types
export * from './common';
export * from './auth';
export * from './user';
export * from './categories';
export * from './services';
export * from './provider';
export * from './bookings';
export * from './notifications';
export * from './referral';
export * from './settings';
export * from './blog';
export * from './account';
