import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { BOOKING_STATUS_PRESENTATION } from '@/constants/bookings';
import { FALLBACKS, getAvatarUrl } from '@/utils/image';
import { THEME_COLORS } from '@/constants/colors';
import type { BookingStatus } from '@/types';

export interface ProviderCardProps {
  avatarUri: string;
  name: string;
  isVerified?: boolean;
  serviceLabel: string;
  location: string;
  ordersCompleted?: string;
  rating: string;
  reviewsCount?: number | string;
  startingFromPrice: string;
  schedule?: string | null;
  availabilityStatus?: string | null;
  bookingStatus?: BookingStatus;
  actionLabel?: string;
  width?: number;
  height?: number;
  onPress?: () => void;
  onFavouritePress?: () => void;
  isFavourite?: boolean;
  variant?: 'details' | 'booking';
  isGuest?: boolean;
}

function ProviderCard({
  avatarUri,
  name,
  isVerified = true,
  serviceLabel,
  location,
  ordersCompleted,
  rating,
  reviewsCount,
  startingFromPrice,
  schedule,
  availabilityStatus,
  bookingStatus,
  actionLabel,
  width,
  height,
  onPress,
  onFavouritePress,
  isFavourite = false,
  variant = 'details',
  isGuest = false,
}: ProviderCardProps) {
  const { t } = useTranslation();
  const showCustomAction = Boolean(actionLabel && actionLabel !== t('home.viewDetails'));
  const [imgError, setImgError] = useState(false);
  const isBookingVariant = variant === 'booking';
  const statusPresentation = bookingStatus ? BOOKING_STATUS_PRESENTATION[bookingStatus] : null;

  const reviewsText = reviewsCount !== undefined ? t('services.reviewsCountShort', { count: reviewsCount }) : null;
  const resolvedAvatar = imgError ? FALLBACKS.avatar : getAvatarUrl(avatarUri);

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          borderCurve: 'continuous',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
        width ? { width } : {},
        height ? { height } : {},
      ]}
      className="shrink-0 rounded-2xl border border-border bg-background p-3.5 justify-between h-[204px] min-h-[204px]"
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Top Right Favourite Heart Button */}
      {!isBookingVariant && !isGuest && (
        <Pressable
          onPress={onFavouritePress}
          accessibilityRole="button"
          accessibilityLabel={`Save ${name}`}
          accessibilityState={{ selected: isFavourite }}
          hitSlop={12}
          className="absolute top-2 right-2 z-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:opacity-70"
        >
          <Ionicons
            name={isFavourite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavourite ? THEME_COLORS.dangerRed : THEME_COLORS.slate400}
            accessible={false}
          />
        </Pressable>
      )}

      {/* Top Row: Avatar, Name + Verified, Category + Rating */}
      <View className="flex-row items-center gap-3 pr-7">
        <Image
          source={{ uri: resolvedAvatar }}
          onError={() => setImgError(true)}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          className="h-14 w-14 rounded-full bg-slate-100 shrink-0"
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />

        <View className="flex-1 justify-center gap-1 min-w-0">
          <View className="flex-row items-center gap-1.5 min-w-0">
            <Text className="text-base font-sans-bold text-slate-900 shrink" numberOfLines={1}>
              {name || t('home.serviceProvider')}
            </Text>
            {isVerified ? (
              <Feather name="check-circle" size={14} color={THEME_COLORS.infoBlue} accessible={false} />
            ) : null}
          </View>

          <View className="flex-row items-center gap-1.5 min-w-0">
            <View className="flex-row items-center gap-1 rounded-md bg-surface-indigo-subtle px-2 py-0.5 shrink">
              <Feather name="tag" size={10} color={THEME_COLORS.primary} accessible={false} />
              <Text className="text-[11px] font-sans-semibold text-primary" numberOfLines={1} ellipsizeMode="tail">
                {serviceLabel || t('home.service')}
              </Text>
            </View>

            <View className="flex-row items-center gap-1 rounded-md bg-surface-warning-subtle px-1.5 py-0.5 shrink-0">
              <Feather
                name="star"
                size={10}
                color={THEME_COLORS.amberStar}
                fill={THEME_COLORS.amberStar}
                accessible={false}
              />
              <Text className="text-[11px] font-sans-bold text-slate-900">
                {isNaN(Number(rating)) ? '0.0' : Number(rating).toFixed(1)}
              </Text>
            </View>

            {reviewsText ? (
              <Text className="text-[11px] font-sans-medium text-slate-500 shrink-0" numberOfLines={1}>
                {reviewsText}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Middle Section: Metadata Rows (Location, Orders Completed, Schedule) */}
      <View className="mt-2.5 gap-y-1.5">
        <View className="flex-row items-center justify-between gap-2 h-5">
          <View className="flex-1 flex-row items-center gap-1.5 min-w-0">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-warning-subtle shrink-0">
              <Feather name="map-pin" size={10} color={THEME_COLORS.amberStar} accessible={false} />
            </View>
            <Text className="flex-1 text-[11.5px] font-sans-medium text-slate-700" numberOfLines={1}>
              {location || t('home.nepal')}
            </Text>
          </View>

          {ordersCompleted ? (
            <View className="flex-row items-center gap-1.5 shrink-0 max-w-[48%]">
              <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-indigo-subtle shrink-0">
                <Feather name="shopping-bag" size={10} color={THEME_COLORS.primary} accessible={false} />
              </View>
              <Text className="text-[11.5px] font-sans-medium text-slate-700 shrink" numberOfLines={1}>
                {ordersCompleted}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="h-5 justify-center">
          {schedule ? (
            <View className="flex-row items-center gap-1.5 min-w-0">
              <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-success-subtle shrink-0">
                <Feather name="calendar" size={10} color={THEME_COLORS.emeraldSuccess} accessible={false} />
              </View>
              <Text
                className="flex-1 text-[11.5px] font-sans-medium text-slate-700"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {schedule}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Bottom Section: Starting Price / Booking Info & Availability / Status Badge */}
      <View className="mt-2.5 flex-row items-end justify-between border-t border-border pt-2.5">
        <View className="gap-0.5 min-h-[38px] justify-center">
          <View className="flex-row items-center gap-1">
            <View className="h-3.5 w-3.5 items-center justify-center rounded-full bg-surface-success-subtle shrink-0">
              <Feather name="dollar-sign" size={9} color={THEME_COLORS.emeraldSuccess} accessible={false} />
            </View>
            <Text className="text-[11px] font-sans-medium text-slate-500" numberOfLines={1}>
              {t('home.startingFrom')}
            </Text>
          </View>
          <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
            {startingFromPrice || t('home.na')}
          </Text>
        </View>

        {statusPresentation ? (
          <View
            className="flex-row items-center rounded-lg px-2.5 py-1 max-h-7"
            style={{ backgroundColor: statusPresentation.backgroundColor }}
          >
            <View
              className="mr-1.5 h-1.5 w-1.5 rounded-full shrink-0"
              style={{ backgroundColor: statusPresentation.dotColor }}
            />
            <Text
              className="text-[11px] font-sans-semibold"
              numberOfLines={1}
              style={{ color: statusPresentation.textColor }}
            >
              {statusPresentation.label}
            </Text>
          </View>
        ) : showCustomAction ? (
          <View className="rounded-lg bg-primary px-3.5 py-1.5 max-h-7 justify-center">
            <Text className="text-xs font-sans-semibold text-primary-foreground" numberOfLines={1}>
              {actionLabel}
            </Text>
          </View>
        ) : availabilityStatus ? (
          <View className="rounded-lg bg-surface-success-subtle px-3 py-1.5 max-h-7 justify-center">
            <Text className="text-xs font-sans-semibold text-emerald-700" numberOfLines={1}>
              {availabilityStatus}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(ProviderCard);
