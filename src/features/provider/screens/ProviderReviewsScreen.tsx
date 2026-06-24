import React from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader, LoadMoreList } from '@/components/common';
import { useGetMyRatingsQuery } from '@/api';
import type { Rating } from '@/types';
import { getSource } from '@/utils/image';

function formatDate(isoString: string) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

function StarDisplay({ rate }: { rate: number }) {
  return (
    <View className="flex-row items-center gap-0.5 my-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Feather key={star} name="star" size={14} color={star <= rate ? '#f59e0b' : '#cbd5e1'} />
      ))}
    </View>
  );
}

const cardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 1,
};

function ReviewCard({ rating }: { rating: Rating }) {
  return (
    <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <Image
            source={getSource(rating.user?.avatar, 'avatar')}
            className="h-10 w-10 rounded-full border border-gray-100 bg-gray-50 mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-sm font-sans-bold text-gray-900">{rating.user?.name || 'Customer'}</Text>
            <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
              {rating.booking?.service?.name || 'Service'}
            </Text>
          </View>
        </View>
        <Text className="text-[10px] font-sans-medium text-gray-400">{formatDate(rating.created_at)}</Text>
      </View>

      <StarDisplay rate={rating.rate} />

      <Text className="text-xs font-sans-regular text-gray-600 leading-5 mt-1">&ldquo;{rating.review}&rdquo;</Text>
    </View>
  );
}

export default function ProviderReviewsScreen() {
  const insets = useSafeAreaInsets();

  const { data: ratingsData, isLoading } = useGetMyRatingsQuery({ limit: 50 });

  const ratings = ratingsData?.data || [];

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="My Reviews"
          description="See what your customers are saying about your services."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        ) : (
          <LoadMoreList
            data={ratings}
            keyExtractor={(item) => item.id}
            initialVisibleCount={4}
            pageSize={4}
            loadMoreLabel="Load More Reviews"
            endReachedLabel="No more reviews"
            emptyContent={
              <View className="items-center justify-center py-12 px-6">
                <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Feather name="star" size={28} color="#94a3b8" />
                </View>
                <Text className="text-base font-sans-bold text-gray-900 mb-1 text-center">No reviews yet</Text>
                <Text className="text-xs font-sans-medium text-gray-400 text-center leading-5">
                  Reviews from your customers will appear here once they complete bookings.
                </Text>
              </View>
            }
            renderItem={(item) => <ReviewCard rating={item} />}
          />
        )}
      </ContentLayout>
    </View>
  );
}
