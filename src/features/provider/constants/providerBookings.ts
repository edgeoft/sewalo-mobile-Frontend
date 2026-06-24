import { type BookingStatus } from '@/types';

export interface ProviderBookingItem {
  id: string;
  customerName: string;
  customerAvatar: string;
  serviceLabel: string;
  location: string;
  bookingDate: string;
  bookedPrice: string;
  status: BookingStatus;
  cancelReason?: string;
  rejectReason?: string;
}
