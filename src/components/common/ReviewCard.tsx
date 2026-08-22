import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
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

  const person = counterpart === 'provider' ? rating.provider : rating.user;
  const nameFallback = counterpart === 'provider' ? 'Provider' : 'Customer';

  return (
    <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={getSource(person?.avatar, 'avatar')}
            className="h-10 w-10 rounded-full border border-gray-100 bg-gray-50 mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-sm font-sans-bold text-gray-900">{person?.name || nameFallback}</Text>
            <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
              {rating.booking?.service?.name || 'Service'}
            </Text>
          </View>
        </View>
        <Text className="text-[10px] font-sans-medium text-gray-400">{formatDate(rating.created_at)}</Text>
      </View>

      <StarRating value={rating.rate} readOnly className="flex-row items-center gap-0.5 my-1.5" />

      <Text className="text-xs font-sans-regular text-gray-600 leading-5 mt-1">&ldquo;{rating.review}&rdquo;</Text>

      {onEdit && onDelete && (
        <View className="flex-row justify-end border-t border-gray-50 mt-3 pt-3 gap-2">
          <Pressable
            onPress={() => onEdit(rating)}
            accessibilityRole="button"
            className="flex-row items-center px-3 py-1.5 rounded-lg active:bg-indigo-50"
          >
            <Feather name="edit-2" size={13} color="#485aff" accessible={false} />
            <Text className="text-xs font-sans-semibold text-primary ml-1.5">{t('customer.edit')}</Text>
          </Pressable>
          <Pressable
            onPress={() => onDelete(rating)}
            accessibilityRole="button"
            className="flex-row items-center px-3 py-1.5 rounded-lg active:bg-red-50"
          >
            <Feather name="trash-2" size={13} color="#ef4444" accessible={false} />
            <Text className="text-xs font-sans-semibold text-red-500 ml-1.5">{t('customer.delete')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
