import { useTranslation } from 'react-i18next';
import { View, Text } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { ProviderCard, SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import type { CustomerBookingItem } from '@/features/customer/constants/customerBookings';

export interface RecentBookingsSectionProps {
  title: string;
  actionLabel?: string;
  bookings: CustomerBookingItem[];
  onActionPress?: () => void;
  onBookingPress?: (booking: CustomerBookingItem) => void;
  onExplorePress?: () => void;
}

export default function RecentBookingsSection({
  title,
  actionLabel,
  bookings,
  onActionPress,
  onBookingPress,
  onExplorePress,
}: RecentBookingsSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="pt-5">
      <SectionHeader
        title={title}
        actionLabel={bookings.length > 0 ? actionLabel : undefined}
        onActionPress={onActionPress}
        className="mb-5"
      />

      {bookings.length > 0 ? (
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
      ) : (
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center">
          <View className="mb-4">
            <Svg width={120} height={90} viewBox="0 0 120 90">
              {/* Calendar Card Background */}
              <Rect x="20" y="15" width="80" height="60" rx="12" fill="#eef2ff" />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              {/* Calendar Header */}
              <Rect x="25" y="22" width="70" height="12" rx="4" fill="#485aff" />
              {/* Mini details representing empty slots */}
              <Circle cx="37" cy="45" r="4" fill="#e2e8f0" />
              <Circle cx="50" cy="45" r="4" fill="#e2e8f0" />
              <Circle cx="63" cy="45" r="4" fill="#e2e8f0" />
              <Circle cx="76" cy="45" r="4" fill="#e2e8f0" />
              <Circle cx="37" cy="57" r="4" fill="#e2e8f0" />
              <Circle cx="50" cy="57" r="4" fill="#e2e8f0" />
              {/* Pulsing check/plus icon in gold/yellow to draw attention */}
              <Circle cx="80" cy="58" r="14" fill="#fef3c7" />
              <Path d="M76 58h8M80 54v8" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{t('home.noRecentBookings')}</Text>
          <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-5 px-4">
            {t('home.noRecentBookingsDesc')}
          </Text>
          <Button
            title={t('home.exploreServices')}
            variant="primary"
            size="sm"
            onPress={onExplorePress}
            className="w-full max-w-[200px]"
          />
        </View>
      )}
    </View>
  );
}
