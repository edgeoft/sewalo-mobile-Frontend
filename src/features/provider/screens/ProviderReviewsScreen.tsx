import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader, LoadMoreList } from '@/components/common';
import ReviewCard from '@/components/common/ReviewCard';
import { useGetMyRatingsQuery } from '@/api';

export default function ProviderReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { data: ratingsData, isLoading, isError, refetch } = useGetMyRatingsQuery({ limit: 50 });

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
          title={t('provider.myReviews')}
          description={t('provider.myReviewsDesc')}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {isLoading ? (
          <LoadingState className="items-center justify-center py-20" />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} className="py-6" />
        ) : (
          <LoadMoreList
            data={ratings}
            keyExtractor={(item) => item.id}
            initialVisibleCount={4}
            pageSize={4}
            loadMoreLabel={t('customer.loadMoreReviews')}
            endReachedLabel={t('customer.noMoreReviews')}
            emptyContent={
              <View className="items-center justify-center py-12 px-6">
                <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Feather name="star" size={28} color="#94a3b8" />
                </View>
                <Text className="text-base font-sans-bold text-gray-900 mb-1 text-center">
                  {t('customer.noReviewsYet')}
                </Text>
                <Text className="text-xs font-sans-medium text-gray-400 text-center leading-5">
                  {t('customer.noReviewsYetDesc')}
                </Text>
              </View>
            }
            renderItem={(item) => <ReviewCard rating={item} counterpart="user" />}
          />
        )}
      </ContentLayout>
    </View>
  );
}
