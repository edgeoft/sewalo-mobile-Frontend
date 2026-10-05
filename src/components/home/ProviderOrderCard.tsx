import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BOOKING_STATUS_PRESENTATION } from '@/constants/bookings';
import { BOOKING_STATUSES } from '@/types';
import type { ProviderBookingItem } from '@/types';
import { THEME_COLORS } from '@/constants/colors';
import { FALLBACKS, getAvatarUrl } from '@/utils/image';

interface ProviderOrderCardProps {
  order: ProviderBookingItem;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onPress?: () => void;
}

export default function ProviderOrderCard({ order, onAccept, onDecline, onPress }: ProviderOrderCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const statusPresentation = BOOKING_STATUS_PRESENTATION[order.status];
  const isPending = order.status === BOOKING_STATUSES.Pending;
  const resolvedAvatar = imgError ? FALLBACKS.avatar : getAvatarUrl(order.customerAvatar);

  return (
    <Pressable
      onPress={onPress}
      className="rounded-lg border border-border bg-background p-3 active:opacity-95"
      accessibilityRole="button"
      accessibilityLabel={`Order from ${order.customerName}`}
    >
      <View className="flex-row gap-3">
        {/* Customer Avatar */}
        <Image
          source={{ uri: resolvedAvatar }}
          onError={() => setImgError(true)}
          className="h-16 w-16 rounded-lg bg-secondary shrink-0"
          style={{ width: 64, height: 64, borderRadius: 8 }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />

        {/* Customer & Order Details */}
        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-sans-bold text-foreground" numberOfLines={1}>
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
              <Text className="text-xs font-sans-medium text-muted-foreground">{order.bookingDate}</Text>
            </View>

            {/* Location */}
            <View className="flex-row items-center gap-1.5">
              <Feather name="map-pin" size={12} color={THEME_COLORS.slate500} />
              <Text className="text-xs font-sans-medium text-muted-foreground" numberOfLines={1}>
                {order.location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="my-2.5 border-t border-border" />

      {/* Bottom Bar: Price & Action Buttons */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] font-sans-medium text-muted-foreground">{t('home.totalPrice')}</Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Feather name="tag" size={13} color={THEME_COLORS.primary} />
            <Text className="text-base font-sans-bold text-foreground">{order.bookedPrice}</Text>
          </View>
        </View>

        {isPending ? (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => onDecline?.(order.id)}
              accessibilityRole="button"
              hitSlop={8}
              className="min-h-[44px] justify-center items-center rounded-md border border-destructive/30 bg-surface-danger-subtle px-3.5 py-2 active:opacity-75"
            >
              <Text className="text-xs font-sans-bold text-destructive">{t('home.decline')}</Text>
            </Pressable>

            <Pressable
              onPress={() => onAccept?.(order.id)}
              accessibilityRole="button"
              hitSlop={8}
              className="min-h-[44px] justify-center items-center rounded-md bg-primary px-4 py-2 active:opacity-90"
            >
              <Text className="text-xs font-sans-bold text-primary-foreground">{t('home.accept')}</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            hitSlop={8}
            className="min-h-[44px] justify-center items-center rounded-md bg-surface-indigo-subtle px-3.5 py-1.5 active:opacity-90"
          >
            <Text className="text-xs font-sans-bold text-primary">{t('home.viewDetails')}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}
