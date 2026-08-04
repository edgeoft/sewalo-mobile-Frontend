import { memo } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { THEME_COLORS } from '@/constants/colors';

interface BookingProviderCardProps {
  booking: CustomerBookingItem;
}

function BookingProviderCard({ booking }: BookingProviderCardProps) {
  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header Info: Avatar, Name, Rating, Service */}
      <View className="flex-row gap-4 mb-4">
        <Image source={{ uri: booking.avatarUri }} resizeMode="cover" className="h-16 w-16 rounded-xl bg-gray-50" />
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-sans-bold text-gray-900">{booking.name}</Text>
            <MaterialIcons name="verified" size={16} color={THEME_COLORS.primary} />
          </View>

          <View className="flex-row items-center bg-surface-indigo-subtle px-2 py-0.5 rounded-lg self-start gap-1">
            <Feather name="tag" size={10} color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-semibold text-primary uppercase">{booking.serviceLabel}</Text>
          </View>

          <View className="flex-row items-center gap-1 mt-0.5 flex-wrap">
            <Feather name="star" size={11} color={THEME_COLORS.amberStar} fill={THEME_COLORS.amberStar} />
            <Text className="text-xs font-sans-bold text-gray-900">{booking.rating}</Text>
            <Text className="text-xs font-sans-medium text-gray-500">({booking.reviewsCount ?? 13} Reviews)</Text>
            <Text className="text-xs text-gray-300">|</Text>
            <Feather name="map-pin" size={11} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
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
          <Text className="text-xs font-sans-semibold text-gray-900">{booking.phoneNumber ?? '+9779802117361'}</Text>
        </View>

        {/* Email */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="mail" size={14} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500">Email</Text>
          </View>
          <Text className="text-xs font-sans-semibold text-gray-900">{booking.email ?? 'pepperpotts@gmail.com'}</Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Feather name="map-pin" size={14} color={THEME_COLORS.slate500} />
            <Text className="text-xs font-sans-medium text-gray-500">Location</Text>
          </View>
          <Text className="text-xs font-sans-semibold text-gray-900" numberOfLines={1}>
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
