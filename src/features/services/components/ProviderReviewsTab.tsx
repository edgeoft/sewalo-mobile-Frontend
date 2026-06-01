import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ReviewItem } from '../types';

interface ProviderReviewsTabProps {
  rating: string;
  reviewCount: number;
  reviews: ReviewItem[];
}

export default function ProviderReviewsTab({ rating, reviewCount, reviews }: ProviderReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <View className="bg-white border border-gray-200 rounded-lg px-5 py-8 items-center" style={styles.shadowMin}>
        <View className="h-16 w-16 bg-[#fffbf0] rounded-full items-center justify-center mb-3 border border-[#fef3c7]">
          <Feather name="message-square" size={28} color="#d97706" />
        </View>
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">No reviews yet</Text>
        <Text className="text-xs font-sans-medium text-gray-400 text-center leading-4 max-w-[240px]">
          Be the first one to book a service and write an honest review.
        </Text>
      </View>
    );
  }

  // Star rendering helper
  const renderStars = (ratingVal: number, size = 10) => {
    const stars = [];
    const floorRating = Math.floor(ratingVal);
    for (let i = 1; i <= 5; i++) {
      if (i <= floorRating) {
        stars.push(
          <Feather key={i} name="star" size={size} color="#fbbf24" fill="#fbbf24" style={{ marginRight: 2 }} />,
        );
      } else if (i - 0.5 <= ratingVal) {
        stars.push(
          <View key={i} style={{ flexDirection: 'row', marginRight: 2 }}>
            <Feather name="star" size={size} color="#fbbf24" fill="#fbbf24" style={{ position: 'absolute' }} />
            <View style={{ width: size / 2, overflow: 'hidden' }}>
              <Feather name="star" size={size} color="#e2e8f0" fill="#e2e8f0" />
            </View>
          </View>,
        );
      } else {
        stars.push(
          <Feather key={i} name="star" size={size} color="#e2e8f0" fill="#e2e8f0" style={{ marginRight: 2 }} />,
        );
      }
    }
    return <View className="flex-row items-center">{stars}</View>;
  };

  // Rating Stats Counts
  const ratingStats = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <View className="gap-y-4">
      {/* Rating Breakdown Header */}
      <View className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center" style={styles.shadowMin}>
        <View className="items-center justify-center pr-5 border-r border-gray-100 mr-5">
          <Text className="text-3xl font-sans-extrabold text-gray-950">{rating}</Text>
          <View className="my-1">{renderStars(parseFloat(rating), 12)}</View>
          <Text className="text-[10px] font-sans-semibold text-gray-400">{reviewCount} Reviews</Text>
        </View>

        {/* Progress Bars */}
        <View className="flex-1 gap-y-1">
          {ratingStats.map((stat) => (
            <View key={stat.stars} className="flex-row items-center">
              <Text className="text-[10px] font-sans-bold text-gray-500 w-3">{stat.stars}</Text>
              <Feather name="star" size={9} color="#fbbf24" fill="#fbbf24" style={{ marginHorizontal: 3 }} />

              {/* Progress bar line */}
              <View className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden mr-2">
                <View className="h-full bg-amber-400 rounded-full" style={{ width: `${stat.percentage}%` }} />
              </View>

              <Text className="text-[9px] font-sans-medium text-gray-400 w-4 text-right">{stat.count}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <View className="gap-y-3">
        {reviews.map((rev) => (
          <View key={rev.id} className="bg-white border border-gray-200 rounded-lg p-4" style={styles.shadowMin}>
            {/* User Avatar + Date Row */}
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: rev.customerAvatar }}
                  className="h-8 w-8 rounded-full bg-gray-100 mr-2.5"
                  resizeMode="cover"
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
                  <Feather name="corner-down-right" size={12} color="#485aff" className="mr-1.5" />
                  <Text className="text-[10px] font-sans-bold text-primary uppercase tracking-wider">
                    Reply from Provider
                  </Text>
                </View>
                <Text className="text-xs font-sans-medium text-gray-500 leading-4.5">{rev.reply}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowMin: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
});
