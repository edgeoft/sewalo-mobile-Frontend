import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { FALLBACKS } from '@/utils/image';
import { THEME_COLORS } from '@/constants/colors';

interface ProviderHeaderCardProps {
  avatarUri: string;
  name: string;
  isVerified: boolean;
  serviceLabel: string;
  location: string;
  rating: string;
  reviewCount: number;
  isSaved: boolean;
  isGuest?: boolean;
  onReviewPress?: () => void;
  onSharePress?: () => void;
  onFavoritePress?: () => void;
}

export default function ProviderHeaderCard({
  avatarUri,
  name,
  isVerified,
  serviceLabel,
  location,
  rating,
  reviewCount,
  isSaved,
  isGuest = false,
  onReviewPress,
  onSharePress,
  onFavoritePress,
}: ProviderHeaderCardProps) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);

  return (
    <View className="bg-white border border-gray-200 rounded-2xl p-4">
      {/* Top Section: Avatar & Provider Details */}
      <View className="flex-row items-start gap-3.5">
        <Image
          source={{ uri: imgError ? FALLBACKS.avatar : avatarUri }}
          onError={() => setImgError(true)}
          className="h-20 w-20 rounded-2xl bg-gray-50 shrink-0"
          resizeMode="cover"
        />

        <View className="flex-1 min-w-0 justify-center">
          {/* Provider Name + Standardized Verified Badge */}
          <View className="flex-row items-center gap-1.5 mb-1.5 min-w-0">
            <Text className="text-lg font-sans-extrabold text-slate-900 flex-shrink" numberOfLines={1}>
              {name}
            </Text>
            {isVerified && (
              <MaterialIcons
                name="verified"
                size={17}
                color={THEME_COLORS.infoBlue}
                accessible={false}
                style={{ marginTop: 1 }}
              />
            )}
          </View>

          {/* Service Category & Rating */}
          <View className="flex-row items-center flex-wrap gap-x-2 gap-y-1.5 mb-2">
            {Boolean(serviceLabel) && (
              <View className="rounded-md bg-surface-indigo-subtle px-2.5 py-0.5 shrink-0">
                <Text className="text-[11px] font-sans-semibold uppercase tracking-wider text-primary">
                  {serviceLabel}
                </Text>
              </View>
            )}

            <Pressable
              className="flex-row items-center gap-1 active:opacity-70 shrink-0"
              onPress={onReviewPress}
              accessibilityRole="button"
              accessibilityLabel={`Rating ${rating}, ${reviewCount} reviews`}
            >
              <Feather
                name="star"
                size={12}
                color={THEME_COLORS.amberStar}
                fill={THEME_COLORS.amberStar}
                accessible={false}
              />
              <Text className="text-xs font-sans-bold text-slate-900">
                {isNaN(Number(rating)) ? '0.0' : Number(rating).toFixed(1)}
              </Text>
              <Text className="text-xs font-sans-medium text-slate-400" numberOfLines={1}>
                ({reviewCount > 0 ? t('services.reviewsCount', { count: reviewCount }) : t('services.noReviewsCount')})
              </Text>
            </Pressable>
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-1 min-w-0">
            <Feather name="map-pin" size={12} color={THEME_COLORS.slate500} />
            <Text className="flex-1 text-xs font-sans-medium text-slate-500" numberOfLines={1}>
              {location}
            </Text>
          </View>
        </View>
      </View>

      {/* Subtle Divider */}
      <View className="border-t border-gray-100 my-3.5" />

      {/* Prominent Action Buttons: [ ♡ Add to Favorites ] [ ↗ Share ] */}
      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onFavoritePress}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? t('services.savedToFavorites', 'Saved') : t('services.addToFavorites', 'Add to Favorites')
          }
          accessibilityState={{ selected: isSaved }}
          className={`flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-xl border active:opacity-80 ${
            isSaved ? 'border-rose-200 bg-rose-50/70 active:bg-rose-100' : 'border-gray-200 bg-white active:bg-gray-50'
          }`}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={16}
            color={isSaved ? THEME_COLORS.dangerRed : THEME_COLORS.slate700}
            accessible={false}
          />
          <Text
            className={`text-xs font-sans-semibold ml-1.5 ${isSaved ? 'text-rose-600' : 'text-slate-800'}`}
            numberOfLines={1}
          >
            {isSaved ? t('services.savedToFavorites', 'Saved') : t('services.addToFavorites', 'Add to Favorites')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onSharePress}
          accessibilityRole="button"
          accessibilityLabel={t('services.share', 'Share')}
          className="flex-1 flex-row items-center justify-center py-2.5 px-2 rounded-xl border border-gray-200 bg-white active:bg-gray-50 active:opacity-80"
        >
          <Feather name="share-2" size={15} color={THEME_COLORS.slate700} accessible={false} />
          <Text className="text-xs font-sans-semibold text-slate-800 ml-1.5" numberOfLines={1}>
            {t('services.share', 'Share')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
