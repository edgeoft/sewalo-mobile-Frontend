import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader, LoadMoreList } from '@/components/common';
import { useGetMyRatingsQuery, useDeleteRating } from '@/api';
import type { Rating } from '@/types';
import RatingModal from '../components/RatingModal';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import ReviewCard from '@/components/common/ReviewCard';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';

export default function MyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [editingRating, setEditingRating] = useState<Rating | null>(null);

  const { data: ratingsData, isLoading, isError, refetch } = useGetMyRatingsQuery({ limit: 50 });
  const deleteRating = useDeleteRating();
  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const ratings = ratingsData?.data || [];

  const handleDeleteReview = (rating: Rating) => {
    showError({
      title: t('customer.deleteReview'),
      message: t('customer.deleteReviewConfirm'),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteRating.mutate(rating.id, {
              onSuccess: () => showSnackbar({ message: t('customer.reviewDeleted'), type: 'success' }),
            });
          },
        },
      ],
    });
  };

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
          title={t('customer.myReviewsTitle')}
          description={t('customer.myReviewsDesc')}
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
            renderItem={(item) => (
              <ReviewCard
                rating={item}
                counterpart="provider"
                onEdit={setEditingRating}
                onDelete={handleDeleteReview}
              />
            )}
          />
        )}
      </ContentLayout>

      {editingRating && (
        <RatingModal
          visible={!!editingRating}
          onClose={() => setEditingRating(null)}
          bookingId={editingRating.booking_id}
          providerId={editingRating.provider_id}
          providerName={editingRating.provider?.name || 'Provider'}
          serviceName={editingRating.booking?.service?.name || 'Service'}
          existingRating={editingRating}
        />
      )}
    </View>
  );
}
