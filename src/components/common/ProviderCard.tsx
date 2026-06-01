import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { BOOKING_STATUS_PRESENTATION } from '@/constants/bookings';
import type { BookingStatus } from '@/types';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface ProviderCardProps {
  avatarUri: string;
  name: string;
  serviceLabel: string;
  location: string;
  ordersCompleted?: string;
  rating: string;
  startingFromPrice: string;
  bookingStatus?: BookingStatus;
  actionLabel?: string;
  width?: number;
  onPress?: () => void;
  variant?: 'details' | 'booking';
}

export default function ProviderCard({
  avatarUri,
  name,
  serviceLabel,
  location,
  ordersCompleted,
  rating,
  startingFromPrice,
  bookingStatus,
  actionLabel = 'View Details',
  width,
  onPress,
  variant = 'details',
}: ProviderCardProps) {
  const isBookingVariant = variant === 'booking';
  const renderIcon = (icon: FeatherIconName, color: string, size: number) => (
    <Feather name={icon} size={size} color={color} />
  );
  const statusPresentation = bookingStatus ? BOOKING_STATUS_PRESENTATION[bookingStatus] : null;

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        },
        width ? { width } : {},
      ]}
      className="shrink-0 rounded-xl border border-gray-200 bg-white p-3"
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <View className="flex-row gap-3">
        <Image source={{ uri: avatarUri }} resizeMode="cover" className="h-24 w-24 rounded-xl bg-gray-50" />

        <View className="flex-1 justify-between py-0.5">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base font-sans-bold text-gray-900" numberOfLines={1}>
              {name}
            </Text>
            {!isBookingVariant && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Save ${name}`}
                className="ml-2 h-7 w-7 items-center justify-center rounded-xl bg-gray-50"
              >
                {renderIcon('heart', '#94a3b8', 14)}
              </Pressable>
            )}
          </View>

          <View className="flex-row items-center gap-2">
            <View className="rounded-xl bg-[#eef1ff] px-2 py-0.5">
              <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{serviceLabel}</Text>
            </View>

            <View className="flex-row items-center gap-1 rounded-xl bg-[#fff6e6] px-2 py-0.5">
              {renderIcon('star', '#fbbf24', 11)}
              <Text className="text-[10px] font-sans-bold text-gray-900">{rating}</Text>
            </View>
          </View>

          <View className="gap-1 mt-1">
            <View className="flex-row items-center gap-1">
              {renderIcon('map-pin', '#64748b', 12)}
              <Text className="flex-1 text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                {location}
              </Text>
            </View>

            {isBookingVariant ? (
              <View className="flex-row items-center gap-1">
                {renderIcon('dollar-sign', '#64748b', 12)}
                <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                  {startingFromPrice}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                {renderIcon('award', '#64748b', 12)}
                <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                  {ordersCompleted}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="my-2.5 border-t border-gray-100" />

      <View className="flex-row items-center justify-between">
        {statusPresentation ? (
          <View
            className="flex-row items-center rounded-xl px-2.5 py-1"
            style={{ backgroundColor: statusPresentation.backgroundColor }}
          >
            <View
              className="h-1.5 w-1.5 rounded-full mr-1.5"
              style={{ backgroundColor: statusPresentation.dotColor }}
            />
            <Text className="text-xs font-sans-medium" style={{ color: statusPresentation.textColor }}>
              {statusPresentation.label}
            </Text>
          </View>
        ) : !isBookingVariant ? (
          <View className="flex-row items-center">
            <Text className="text-xs font-sans-medium text-gray-400">Starting from </Text>
            <Text className="text-sm font-sans-bold text-primary">{startingFromPrice}</Text>
          </View>
        ) : null}

        <View className="rounded-md bg-primary px-4 py-2">
          <Text className="text-xs font-sans-semibold text-white">{actionLabel}</Text>
        </View>
      </View>
    </Pressable>
  );
}
