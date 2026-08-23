import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import type { ReviewItem } from '@/types';
import { THEME_COLORS } from '@/constants/colors';

const REVIEWS_PAGE_SIZE = 8;

interface ProviderReviewsTabProps {
  rating: string;
  reviewCount: number;
  reviews: ReviewItem[];
}

// Star rendering helper
const renderStars = (ratingVal: number, size = 10) => {
  const stars = [];
  const floorRating = Math.floor(ratingVal);
  for (let i = 1; i <= 5; i++) {
    if (i <= floorRating) {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={size}
          color={THEME_COLORS.amberStar}
          fill={THEME_COLORS.amberStar}
          style={{ marginRight: 2 }}
        />,
      );
    } else if (i - 0.5 <= ratingVal) {
      stars.push(
        <View key={i} style={{ flexDirection: 'row', marginRight: 2 }}>
          <Feather
            name="star"
            size={size}
            color={THEME_COLORS.amberStar}
            fill={THEME_COLORS.amberStar}
            style={{ position: 'absolute' }}
          />
          <View style={{ width: size / 2, overflow: 'hidden' }}>
            <Feather name="star" size={size} color={THEME_COLORS.slate200} fill={THEME_COLORS.slate200} />
          </View>
        </View>,
      );
    } else {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={size}
          color={THEME_COLORS.slate200}
          fill={THEME_COLORS.slate200}
          style={{ marginRight: 2 }}
        />,
      );
    }
  }
  return <View className="flex-row items-center">{stars}</View>;
};

const ReviewRow = React.memo(function ReviewRow({ rev }: { rev: ReviewItem }) {
  const { t } = useTranslation();
  return (
    <View className="bg-white border border-gray-200 rounded-lg p-4">
      {/* User Avatar + Date Row */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Image
            source={{ uri: rev.customerAvatar }}
            className="h-8 w-8 rounded-full bg-gray-100 mr-2.5"
            contentFit="cover"
            transition={150}
            cachePolicy="memory-disk"
          />
          <View>
            <Text className="text-xs font-sans-bold text-gray-900">{rev.customerName}</Text>
            <View className="mt-0.5">{renderStars(rev.rating, 10)}</View>
          </View>
        </View>

        <Text className="text-[10px] font-sans-medium text-gray-400">{rev.date}</Text>
      </View>

      {/* Review Comment */}
      <Text className="text-xs font-sans-medium text-gray-600 leading-4.5">{rev.comment}</Text>

      {/* Optional Provider Reply */}
      {rev.reply && (
        <View className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3 ml-2.5">
          <View className="flex-row items-center mb-1">
            <Feather name="corner-down-right" size={12} color={THEME_COLORS.primary} className="mr-1.5" />
            <Text className="text-[10px] font-sans-bold text-primary uppercase tracking-wider">
              {t('services.replyFromProvider')}
            </Text>
          </View>
          <Text className="text-xs font-sans-medium text-gray-500 leading-4.5">{rev.reply}</Text>
        </View>
      )}
    </View>
  );
});

export default function ProviderReviewsTab({ rating, reviewCount, reviews }: ProviderReviewsTabProps) {
  const { t } = useTranslation();
  // Incremental reveal bounds initial mount cost inside the parent ScrollView.
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

  const handleShowMore = useCallback(() => {
    setVisibleCount((count) => count + REVIEWS_PAGE_SIZE);
  }, []);

  // Rating Stats Counts
  const ratingStats = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { stars, count, percentage };
      }),
    [reviews],
  );

  if (reviews.length === 0) {
    return (
      <View className="bg-white border border-gray-200 rounded-lg px-5 py-8 items-center">
        <View className="h-16 w-16 bg-amber-50 rounded-full items-center justify-center mb-3 border border-amber-100">
          <Feather name="message-square" size={28} color={THEME_COLORS.amberStar} />
        </View>
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{t('services.noReviewsYet')}</Text>
        <Text className="text-xs font-sans-medium text-gray-400 text-center leading-4 max-w-[240px]">
          {t('services.noReviewsDesc')}
        </Text>
      </View>
    );
  }

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <View className="gap-y-4">
      {/* Rating Breakdown Header */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center">
        <View className="items-center justify-center pr-5 border-r border-gray-100 mr-5">
          <Text className="text-3xl font-sans-extrabold text-gray-950">
            {isNaN(Number(rating)) ? '0.0' : Number(rating).toFixed(1)}
          </Text>
          <View className="my-1">{renderStars(isNaN(Number(rating)) ? 0 : parseFloat(rating), 12)}</View>
          <Text className="text-[10px] font-sans-semibold text-gray-400">
            {t('services.reviewsCount', { count: reviewCount })}
          </Text>
        </View>

        {/* Progress Bars */}
        <View className="flex-1 gap-y-1">
          {ratingStats.map((stat) => (
            <View key={stat.stars} className="flex-row items-center">
              <Text className="text-[10px] font-sans-bold text-gray-500 w-3">{stat.stars}</Text>
              <Feather
                name="star"
                size={9}
                color={THEME_COLORS.amberStar}
                fill={THEME_COLORS.amberStar}
                style={{ marginHorizontal: 3 }}
              />

              {/* Progress bar line */}
              <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-2">
                <View className="h-full bg-amber-400 rounded-full" style={{ width: `${stat.percentage}%` }} />
              </View>

              <Text className="text-[9px] font-sans-medium text-gray-400 w-4 text-right">{stat.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews List (incrementally rendered) */}
      <View className="gap-y-3">
        {visibleReviews.map((rev) => (
          <ReviewRow key={rev.id} rev={rev} />
        ))}

        {hasMore && (
          <Pressable
            onPress={handleShowMore}
            accessibilityRole="button"
            className="bg-white border border-gray-200 rounded-lg py-3 items-center active:opacity-80"
          >
            <Text className="text-xs font-sans-bold text-primary">
              {t('common.loadMore')} ({reviews.length - visibleCount})
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
