import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { FALLBACKS } from '@/utils/image';
import { Feather, MaterialIcons } from '@expo/vector-icons';
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
    <View className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-start">
      <Image
        source={{ uri: imgError ? FALLBACKS.avatar : avatarUri }}
        onError={() => setImgError(true)}
        className="h-20 w-20 rounded-xl bg-gray-50 mr-4"
        resizeMode="cover"
      />

      <View className="flex-1 justify-between py-0.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center flex-wrap mb-1">
              <Text className="text-lg font-sans-extrabold text-gray-950 pr-1">{name}</Text>
              {isVerified && (
                <View className="bg-primary rounded-full h-4 w-4 items-center justify-center">
                  <Feather name="check" size={10} color={THEME_COLORS.primaryForeground} />
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-2 mb-2">
              <View className="rounded-xl bg-surface-indigo-subtle px-2.5 py-0.5">
                <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{serviceLabel}</Text>
              </View>

              <Pressable
                className="flex-row items-center gap-1.5 active:opacity-60"
                onPress={onReviewPress}
                accessibilityRole="button"
              >
                <Feather
                  name="star"
                  size={12}
                  color={THEME_COLORS.amberStar}
                  fill={THEME_COLORS.amberStar}
                  accessible={false}
                />
                <Text className="text-[11px] font-sans-bold text-gray-900">
                  {isNaN(Number(rating)) ? '0.0' : Number(rating).toFixed(1)}
                </Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">
                  ({reviewCount > 0 ? t('services.reviewsCount', { count: reviewCount }) : t('services.noReviewsCount')}
                  )
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action buttons (Share & Favorite) inside the card */}
          <View className="flex-row items-center gap-x-2">
            <Pressable
              onPress={onSharePress}
              accessibilityRole="button"
              accessibilityLabel="Share"
              hitSlop={8}
              className="h-7 w-7 items-center justify-center rounded-xl bg-gray-50 active:opacity-75"
            >
              <Feather name="share-2" size={14} color={THEME_COLORS.slate500} accessible={false} />
            </Pressable>
            {!isGuest && (
              <Pressable
                onPress={onFavoritePress}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? 'Remove from favourites' : 'Save to favourites'}
                accessibilityState={{ selected: isSaved }}
                hitSlop={8}
                className="h-7 w-7 items-center justify-center rounded-xl bg-gray-50 active:opacity-75"
              >
                <MaterialIcons
                  name="favorite"
                  size={14}
                  color={isSaved ? THEME_COLORS.dangerRed : THEME_COLORS.slate500}
                  accessible={false}
                />
              </Pressable>
            )}
          </View>
        </View>

        <View className="flex-row items-center gap-1 mt-1">
          <Feather name="map-pin" size={12} color={THEME_COLORS.slate500} />
          <Text className="flex-1 text-xs font-sans-medium text-gray-500" numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}
