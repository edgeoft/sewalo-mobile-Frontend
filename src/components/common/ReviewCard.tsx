import React from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import type { Rating } from '@/types';
import { cardShadow } from '@/constants/shadows';
import StarRating from '@/components/ui/StarRating';
import { getSource } from '@/utils/image';
import { formatDate } from '@/utils/time';

export interface ReviewCardProps {
  rating: Rating;
  /** Whose identity is shown: the reviewed provider or the reviewing user. */
  counterpart: 'provider' | 'user';
  onEdit?: (rating: Rating) => void;
  onDelete?: (rating: Rating) => void;
}

/**
 * Shared review card used by the customer "my reviews" list and the
 * provider reviews list.
 */
export default function ReviewCard({ rating, counterpart, onEdit, onDelete }: ReviewCardProps) {
  const { t } = useTranslation();

  const person = counterpart === 'provider' ? (rating.provider ?? rating.booking?.provider) : rating.user;
  const nameFallback = counterpart === 'provider' ? 'Provider' : 'Customer';

  return (
    <View style={cardShadow} className="bg-background rounded-xl border border-border p-4 mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={getSource(person?.avatar, 'avatar')}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            className="h-10 w-10 rounded-full border border-border bg-secondary mr-3 shrink-0"
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View className="flex-1">
            <Text className="text-sm font-sans-bold text-foreground">{person?.name || nameFallback}</Text>
            <Text className="text-[11px] font-sans-medium text-muted-foreground mt-0.5">
              {rating.booking?.service?.name || 'Service'}
            </Text>
          </View>
        </View>
        <Text className="text-[10px] font-sans-medium text-muted-foreground">{formatDate(rating.created_at)}</Text>
      </View>

      <StarRating value={rating.rate} readOnly className="flex-row items-center gap-0.5 my-1.5" />

      <Text className="text-xs font-sans-regular text-slate-600 leading-5 mt-1">&ldquo;{rating.review}&rdquo;</Text>

      {onEdit && onDelete && (
        <View className="flex-row justify-end border-t border-border mt-3 pt-3 gap-2">
          <Pressable
            onPress={() => onEdit(rating)}
            accessibilityRole="button"
            hitSlop={8}
            className="flex-row items-center min-h-[36px] px-3 py-1.5 rounded-lg active:bg-accent"
          >
            <Feather name="edit-2" size={13} color={THEME_COLORS.primary} accessible={false} />
            <Text className="text-xs font-sans-semibold text-primary ml-1.5">{t('customer.edit')}</Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(rating)}
            accessibilityRole="button"
            hitSlop={8}
            className="flex-row items-center min-h-[36px] px-3 py-1.5 rounded-lg active:bg-surface-danger-subtle"
          >
            <Feather name="trash-2" size={13} color={THEME_COLORS.dangerRed} accessible={false} />
            <Text className="text-xs font-sans-semibold text-destructive ml-1.5">{t('customer.delete')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
