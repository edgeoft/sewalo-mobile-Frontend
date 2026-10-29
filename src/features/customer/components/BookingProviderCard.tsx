import { memo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { THEME_COLORS } from '@/constants/colors';
import { FALLBACKS, getAvatarUrl } from '@/utils/image';
import { IMAGE_PRESETS } from '@/constants/layout';

interface BookingProviderCardProps {
  booking: CustomerBookingItem;
}

function BookingProviderCard({ booking }: BookingProviderCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const resolvedAvatar = imgError ? FALLBACKS.avatar : getAvatarUrl(booking.avatarUri);

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header Info: Avatar, Name, Rating, Service */}
      <View className="flex-row gap-4 mb-4">
        <Image
          source={{ uri: resolvedAvatar }}
          onError={() => setImgError(true)}
          contentFit="cover"
          transition={150}
          cachePolicy="memory-disk"
          style={IMAGE_PRESETS.avatar.xl}
          className="h-16 w-16 rounded-xl bg-gray-50 shrink-0"
        />
        <View className="flex-1 gap-1 min-w-0">
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-sans-bold text-gray-900 shrink" numberOfLines={1}>
              {booking.name}
            </Text>
            <Feather name="check-circle" size={15} color={THEME_COLORS.primary} />
          </View>

          <View className="flex-row items-center bg-surface-indigo-subtle px-2 py-0.5 rounded-lg self-start gap-1 max-w-full">
            <Feather name="tag" size={10} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-semibold text-primary uppercase shrink" numberOfLines={1}>
              {booking.serviceLabel}
            </Text>
          </View>

          <View className="flex-row items-center gap-1 mt-0.5 min-w-0">
            <Feather name="star" size={11} color={THEME_COLORS.amberStar} fill={THEME_COLORS.amberStar} />
            <Text className="text-xs font-sans-bold text-gray-900">{booking.rating || '0.0'}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 shrink" numberOfLines={1}>
              (
              {booking.reviewsCount !== undefined
                ? t('services.reviewsCountShort', { count: booking.reviewsCount })
                : t('services.noReviewsCount')}
              )
            </Text>
            <Text className="text-xs text-gray-300">|</Text>
            <Feather name="map-pin" size={11} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500 flex-1" numberOfLines={1}>
              {booking.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Detailed rows */}
      <View className="border-t border-gray-100 pt-2 gap-1.5">
        {/* Phone */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="phone" size={14} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500">Mobile Number</Text>
          </View>
          <Text className="text-xs font-sans-semibold text-gray-900">{booking.phoneNumber || t('home.na')}</Text>
        </View>

        {/* Email */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="mail" size={14} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500">Email</Text>
          </View>
          <Text className="text-xs font-sans-semibold text-gray-900">{booking.email || t('home.na')}</Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="map-pin" size={14} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500">Location</Text>
          </View>
          <Text className="text-xs font-sans-semibold text-gray-900 flex-1 text-right ml-2" numberOfLines={1}>
            {booking.location}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <Pressable
        accessibilityRole="button"
        className="mt-4 py-3 rounded-lg border border-gray-200 bg-white items-center justify-center active:bg-gray-50"
      >
        <Text className="text-sm font-sans-semibold text-gray-900">Call Provider</Text>
      </Pressable>
    </View>
  );
}

export default memo(BookingProviderCard);
