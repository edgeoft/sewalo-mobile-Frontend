import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { EmptyStateCard, ProviderCard, SectionHeader } from '@/components/common';
import type { CustomerBookingItem } from '@/features/customer/constants/customerBookings';
import { THEME_COLORS } from '@/constants/colors';

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
        <EmptyStateCard
          title={t('home.noRecentBookings')}
          description={t('home.noRecentBookingsDesc')}
          buttonTitle={t('home.exploreServices')}
          onButtonPress={onExplorePress}
          icon={
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Rect x="20" y="15" width="80" height="60" rx="12" fill={THEME_COLORS.surfaceIndigoSubtle} />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              <Rect x="25" y="22" width="70" height="12" rx="4" fill={THEME_COLORS.primary} />
              <Circle cx="37" cy="45" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="50" cy="45" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="63" cy="45" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="76" cy="45" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="37" cy="57" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="50" cy="57" r="4" fill={THEME_COLORS.slate200} />
              <Circle cx="80" cy="58" r="14" fill="#fef3c7" />
              <Path d="M76 58h8M80 54v8" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          }
        />
      )}
    </View>
  );
}
