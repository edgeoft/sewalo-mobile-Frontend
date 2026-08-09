import { useTranslation } from 'react-i18next';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BOOKING_STATUS_PRESENTATION } from '@/constants/bookings';
import { BOOKING_STATUSES } from '@/types';
import type { ProviderBookingItem } from '@/features/provider/constants/providerBookings';
import { THEME_COLORS } from '@/constants/colors';

interface ProviderOrderCardProps {
  order: ProviderBookingItem;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onPress?: () => void;
}

export default function ProviderOrderCard({ order, onAccept, onDecline, onPress }: ProviderOrderCardProps) {
  const { t } = useTranslation();
  const statusPresentation = BOOKING_STATUS_PRESENTATION[order.status];
  const isPending = order.status === BOOKING_STATUSES.Pending;

  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg border border-gray-200 bg-white p-3 active:opacity-95"
      accessibilityRole="button"
      accessibilityLabel={`Order from ${order.customerName}`}
    >
      <View className="flex-row gap-3">
        {/* Customer Avatar */}
        <Image source={{ uri: order.customerAvatar }} className="h-16 w-16 rounded-lg bg-gray-50" resizeMode="cover" />

        {/* Customer & Order Details */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-sans-bold text-gray-900" numberOfLines={1}>
              {order.customerName}
            </Text>
            {statusPresentation && (
              <View
                className="flex-row items-center rounded-full px-2 py-0.5"
                style={{ backgroundColor: statusPresentation.backgroundColor }}
              >
                <View
                  className="h-1.5 w-1.5 rounded-full mr-1"
                  style={{ backgroundColor: statusPresentation.dotColor }}
                />
                <Text className="text-[10px] font-sans-semibold" style={{ color: statusPresentation.textColor }}>
                  {statusPresentation.label}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-xs font-sans-bold text-primary mb-1.5">{order.serviceLabel}</Text>

          <View className="gap-y-1">
            {/* Scheduled Date/Time */}
            <View className="flex-row items-center gap-1.5">
              <Feather name="calendar" size={12} color={THEME_COLORS.slate500} />
              <Text className="text-xs font-sans-medium text-gray-500">{order.bookingDate}</Text>
            </View>

            {/* Location */}
            <View className="flex-row items-center gap-1.5">
              <Feather name="map-pin" size={12} color={THEME_COLORS.slate500} />
              <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                {order.location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="my-2.5 border-t border-gray-100" />

      {/* Bottom Bar: Price & Action Buttons */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-sans-medium text-gray-400">{t('home.totalPrice')}</Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Feather name="tag" size={13} color={THEME_COLORS.primary} />
            <Text className="text-base font-sans-bold text-gray-900">{order.bookedPrice}</Text>
          </View>
        </View>

        {isPending ? (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onDecline?.(order.id)}
              accessibilityRole="button"
              className="rounded-md border border-red-200 bg-red-50/50 px-3.5 py-2 active:bg-red-50"
            >
              <Text className="text-xs font-sans-bold text-red-600">{t('home.decline')}</Text>
            </Pressable>

            <Pressable
              onPress={() => onAccept?.(order.id)}
              accessibilityRole="button"
              className="rounded-md bg-primary px-4 py-2 active:opacity-90"
            >
              <Text className="text-xs font-sans-bold text-white">{t('home.accept')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className="rounded-md bg-surface-indigo-subtle px-3.5 py-1.5 active:opacity-90"
          >
            <Text className="text-xs font-sans-bold text-primary">{t('home.viewDetails')}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
