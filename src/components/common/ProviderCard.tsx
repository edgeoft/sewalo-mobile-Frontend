import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, Text, View } from 'react-native';

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
      ]}
      className="shrink-0 rounded-2xl border border-gray-200 bg-white p-3.5"
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
          hitSlop={8}
          className="absolute top-2.5 right-2.5 z-10 h-8 w-8 items-center justify-center rounded-full active:opacity-70"
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
          resizeMode="cover"
        />

        <View className="flex-1 justify-center gap-1">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-base font-sans-bold text-slate-900" numberOfLines={1}>
              {name}
            </Text>
            {isVerified ? (
              <MaterialIcons name="verified" size={15} color={THEME_COLORS.infoBlue} accessible={false} />
            ) : null}
          </View>

          <View className="flex-row items-center flex-wrap gap-1.5">
            <View className="flex-row items-center gap-1 rounded-md bg-surface-indigo-subtle px-2 py-0.5">
              <Feather name="tag" size={10} color={THEME_COLORS.primary} accessible={false} />
              <Text className="text-[11px] font-sans-semibold text-primary">{serviceLabel}</Text>
            </View>

            <View className="flex-row items-center gap-1 rounded-md bg-surface-warning-subtle px-1.5 py-0.5">
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

            {reviewsText && <Text className="text-[11px] font-sans-medium text-slate-500">{reviewsText}</Text>}
          </View>
        </View>
      </View>

      {/* Middle Section: Metadata Rows (Location, Orders Completed, Schedule) */}
      <View className="mt-2.5 gap-y-1.5">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-1.5 mr-1">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-warning-subtle">
              <Feather name="map-pin" size={10} color={THEME_COLORS.amberStar} accessible={false} />
            </View>
            <Text className="flex-1 text-[11.5px] font-sans-medium text-slate-700" numberOfLines={1}>
              {location}
            </Text>
          </View>

          {ordersCompleted ? (
            <View className="flex-row items-center gap-1.5 shrink-0">
              <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-indigo-subtle">
                <Feather name="shopping-bag" size={10} color={THEME_COLORS.primary} accessible={false} />
              </View>
              <Text className="text-[11.5px] font-sans-medium text-slate-700">{ordersCompleted}</Text>
            </View>
          ) : null}
        </View>

        {schedule ? (
          <View className="flex-row items-center gap-1.5">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-surface-success-subtle">
              <Feather name="calendar" size={10} color={THEME_COLORS.emeraldSuccess} accessible={false} />
            </View>
            <Text className="text-[11.5px] font-sans-medium text-slate-700">{schedule}</Text>
          </View>
        ) : null}
      </View>

      {/* Bottom Section: Starting Price / Booking Info & Availability / Status Badge */}
      <View className="mt-2.5 flex-row items-end justify-between border-t border-gray-100 pt-2.5">
        <View className="gap-0.5">
          <View className="flex-row items-center gap-1">
            <View className="h-3.5 w-3.5 items-center justify-center rounded-full bg-surface-success-subtle">
              <Feather name="dollar-sign" size={9} color={THEME_COLORS.emeraldSuccess} accessible={false} />
            </View>
            <Text className="text-[11px] font-sans-medium text-slate-500">{t('home.startingFrom')}</Text>
          </View>
          <Text className="text-xl font-sans-extrabold text-primary">{startingFromPrice}</Text>
        </View>

        {statusPresentation ? (
          <View
            className="flex-row items-center rounded-lg px-2.5 py-1"
            style={{ backgroundColor: statusPresentation.backgroundColor }}
          >
            <View
              className="mr-1.5 h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: statusPresentation.dotColor }}
            />
            <Text className="text-[11px] font-sans-semibold" style={{ color: statusPresentation.textColor }}>
              {statusPresentation.label}
            </Text>
          </View>
        ) : showCustomAction ? (
          <View className="rounded-lg bg-primary px-3.5 py-1.5">
            <Text className="text-xs font-sans-semibold text-white">{actionLabel}</Text>
          </View>
        ) : availabilityStatus ? (
          <View className="rounded-lg bg-surface-success-subtle px-3 py-1.5">
            <Text className="text-xs font-sans-semibold text-emerald-700">{availabilityStatus}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(ProviderCard);
