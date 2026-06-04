import { BOOKING_STATUSES, type BookingStatus } from '@/types';

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

export const PROVIDER_BOOKINGS_MOCK: ProviderBookingItem[] = [
  {
    id: 'prov-booking-1',
    customerName: 'Sam Billings',
    customerAvatar: 'https://i.pravatar.cc/300?img=33',
    serviceLabel: 'Deep House Cleaning',
    location: 'Boudha, Kathmandu',
    bookingDate: 'Today, 10:30 AM',
    bookedPrice: 'Rs. 2,500',
    status: BOOKING_STATUSES.Pending,
  },
  {
    id: 'prov-booking-2',
    customerName: 'Aria Sharma',
    customerAvatar: 'https://i.pravatar.cc/300?img=49',
    serviceLabel: 'Bathroom Plumbing Repair',
    location: 'Jhamsikhel, Lalitpur',
    bookingDate: 'Today, 2:00 PM',
    bookedPrice: 'Rs. 1,800',
    status: BOOKING_STATUSES.Confirmed,
  },
  {
    id: 'prov-booking-3',
    customerName: 'Niranjan Thapa',
    customerAvatar: 'https://i.pravatar.cc/300?img=18',
    serviceLabel: 'Living Room Painting',
    location: 'Baneshwor, Kathmandu',
    bookingDate: 'Yesterday, 11:00 AM',
    bookedPrice: 'Rs. 8,500',
    status: BOOKING_STATUSES.Completed,
  },
  {
    id: 'prov-booking-4',
    customerName: 'Esther Howard',
    customerAvatar: 'https://i.pravatar.cc/300?img=41',
    serviceLabel: 'Kitchen Appliance Repair',
    location: 'Kalanki, Kathmandu',
    bookingDate: 'May 30, 4:15 PM',
    bookedPrice: 'Rs. 1,200',
    status: BOOKING_STATUSES.Cancelled,
    cancelReason: 'Customer requested cancellation due to personal reasons.',
  },
];
