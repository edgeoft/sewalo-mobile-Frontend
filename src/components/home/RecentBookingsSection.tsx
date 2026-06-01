import { ProviderCard, SectionHeader } from '@/components/common';
import { View } from 'react-native';

import type { PopularProvider } from './PopularProvidersSection';

export interface RecentBookingsSectionProps {
  title: string;
  actionLabel: string;
  bookings: PopularProvider[];
  onActionPress?: () => void;
  onBookingPress?: (booking: PopularProvider) => void;
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
            key={booking.name}
            avatarUri={booking.avatarUri}
            name={booking.name}
            serviceLabel={booking.serviceLabel}
            location={booking.location}
            ordersCompleted={booking.ordersCompleted}
            rating={booking.rating}
            startingFromPrice={booking.startingFromPrice}
            onPress={() => onBookingPress?.(booking)}
          />
        ))}
      </View>
    </View>
  );
}
