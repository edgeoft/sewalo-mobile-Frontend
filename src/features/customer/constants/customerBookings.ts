import { type BookingStatus } from '@/types';

export interface CustomerBookingItem {
  id: string;
  avatarUri: string;
  name: string;
  serviceLabel: string;
  location: string;
  ordersCompleted: string;
  rating: string;
  bookedPrice: string;
  status: BookingStatus;
  phoneNumber?: string;
  email?: string;
  reviewsCount?: number;
  dateTime?: string;
  specialInstructions?: string;
  serviceName?: string;
  categoryName?: string;
  descriptionText?: string;
  basePrice?: string;
  vatAmount?: string;
  totalPrice?: string;
  cancelReason?: string;
  rejectReason?: string;
}
