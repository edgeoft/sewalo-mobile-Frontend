import { BOOKING_STATUSES, type BookingStatus } from '@/types';

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

export const CUSTOMER_BOOKINGS_MOCK: CustomerBookingItem[] = [
  {
    id: 'booking-1',
    avatarUri: 'https://i.pravatar.cc/300?img=47',
    name: 'Pepper Potts',
    serviceLabel: 'Design',
    location: 'Sukedhara, Kathmandu',
    ordersCompleted: '2 Orders Completed',
    rating: '4.2',
    bookedPrice: 'Rs. 2300',
    status: BOOKING_STATUSES.Pending,
    phoneNumber: '+9779802117361',
    email: 'pepperpotts@gmail.com',
    reviewsCount: 13,
  },
  {
    id: 'booking-2',
    avatarUri: 'https://i.pravatar.cc/300?img=12',
    name: 'Sam Williams',
    serviceLabel: 'Cleaning',
    location: 'Kathmandu',
    ordersCompleted: '24 Mar 2026',
    rating: '4.8',
    bookedPrice: 'Rs. 2300',
    status: BOOKING_STATUSES.Confirmed,
  },
  {
    id: 'booking-3',
    avatarUri: 'https://i.pravatar.cc/300?img=32',
    name: 'Amina Shrestha',
    serviceLabel: 'Plumbing',
    location: 'Boudha, Kathmandu',
    ordersCompleted: '18 Orders Completed',
    rating: '4.7',
    bookedPrice: 'Rs. 1800',
    status: BOOKING_STATUSES.Completed,
  },
  {
    id: 'booking-4',
    avatarUri: 'https://i.pravatar.cc/300?img=20',
    name: 'Sita Rana',
    serviceLabel: 'Beauty',
    location: 'Lalitpur, Nepal',
    ordersCompleted: '24 Orders Completed',
    rating: '4.6',
    bookedPrice: 'Rs. 1200',
    status: BOOKING_STATUSES.Cancelled,
    cancelReason: 'Client requested cancellation due to a change in travel plans.',
  },
  {
    id: 'booking-5',
    avatarUri: 'https://i.pravatar.cc/300?img=8',
    name: 'Nabin Gurung',
    serviceLabel: 'Electrical',
    location: 'Chabahil, Kathmandu',
    ordersCompleted: '14 Orders Completed',
    rating: '4.9',
    bookedPrice: 'Rs. 2100',
    status: BOOKING_STATUSES.Rejected,
    rejectReason: 'Provider is unavailable during the requested time slot.',
  },
  {
    id: 'booking-6',
    avatarUri: 'https://i.pravatar.cc/300?img=11',
    name: 'Raj Khatri',
    serviceLabel: 'Home Repair',
    location: 'Baneshwor, Kathmandu',
    ordersCompleted: '31 Orders Completed',
    rating: '4.5',
    bookedPrice: 'Rs. 1500',
    status: BOOKING_STATUSES.ReadyToPay,
  },
  {
    id: 'booking-7',
    avatarUri: 'https://i.pravatar.cc/300?img=15',
    name: 'Prakash Rai',
    serviceLabel: 'Tutoring',
    location: 'Kirtipur, Kathmandu',
    ordersCompleted: '11 Orders Completed',
    rating: '4.4',
    bookedPrice: 'Rs. 1000',
    status: BOOKING_STATUSES.PaymentInitiated,
  },
  {
    id: 'booking-8',
    avatarUri: 'https://i.pravatar.cc/300?img=24',
    name: 'Kiran Shahi',
    serviceLabel: 'Appliance Repair',
    location: 'Kalanki, Kathmandu',
    ordersCompleted: '7 Orders Completed',
    rating: '4.3',
    bookedPrice: 'Rs. 1900',
    status: BOOKING_STATUSES.Paid,
  },
  {
    id: 'booking-9',
    avatarUri: 'https://i.pravatar.cc/300?img=29',
    name: 'Anita Lama',
    serviceLabel: 'Cleaning',
    location: 'Bhaktapur',
    ordersCompleted: '9 Orders Completed',
    rating: '4.1',
    bookedPrice: 'Rs. 1600',
    status: BOOKING_STATUSES.InProgress,
  },
  {
    id: 'booking-10',
    avatarUri: 'https://i.pravatar.cc/300?img=33',
    name: 'Sunil Tamang',
    serviceLabel: 'Painting',
    location: 'Lainchaur, Kathmandu',
    ordersCompleted: '5 Orders Completed',
    rating: '4.0',
    bookedPrice: 'Rs. 2600',
    status: BOOKING_STATUSES.Pending,
  },
  {
    id: 'booking-11',
    avatarUri: 'https://i.pravatar.cc/300?img=41',
    name: 'Rina KC',
    serviceLabel: 'Spa',
    location: 'Patan',
    ordersCompleted: '13 Orders Completed',
    rating: '4.9',
    bookedPrice: 'Rs. 2800',
    status: BOOKING_STATUSES.Completed,
  },
  {
    id: 'booking-12',
    avatarUri: 'https://i.pravatar.cc/300?img=52',
    name: 'Deepak Bista',
    serviceLabel: 'Carpentry',
    location: 'Gongabu, Kathmandu',
    ordersCompleted: '16 Orders Completed',
    rating: '4.7',
    bookedPrice: 'Rs. 2400',
    status: BOOKING_STATUSES.Confirmed,
  },
];
