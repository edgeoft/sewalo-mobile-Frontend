import { ProviderCard, SectionHeader } from '@/components/common';
import { View } from 'react-native';

import type { CustomerBookingItem } from '@/features/customer/constants/customerBookings';

export interface RecentBookingsSectionProps {
  title: string;
  actionLabel: string;
  bookings: CustomerBookingItem[];
  onActionPress?: () => void;
  onBookingPress?: (booking: CustomerBookingItem) => void;
}

export default function RecentBookingsSection({
  title,
  actionLabel,
  bookings,
  onActionPress,
  onBookingPress,
}: RecentBookingsSectionProps) {
  return (
    <View className="pt-8">
      <SectionHeader title={title} actionLabel={actionLabel} onActionPress={onActionPress} className="mb-5" />

      <View className="gap-4">
        {bookings.slice(0, 2).map((booking) => (
          <ProviderCard
            key={booking.id}
            avatarUri={booking.avatarUri}
            name={booking.name}
            serviceLabel={booking.serviceLabel}
            location={booking.location}
            rating={booking.rating}
            startingFromPrice={booking.bookedPrice}
            bookingStatus={booking.status}
            onPress={() => onBookingPress?.(booking)}
            variant="booking"
          />
        ))}
      </View>
    </View>
  );
}
