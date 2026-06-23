import React, { useState } from 'react';
import { View, Text, Image, Alert, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import { useGetMyRatingsQuery, useDeleteRating } from '@/api/bookings';
import type { Rating } from '@/api/bookings';
import { getImageUrl } from '@/utils/image';
import RatingModal from '../components/RatingModal';

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

export default function MyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [editingRating, setEditingRating] = useState<Rating | null>(null);

  const { data: ratingsData, isLoading, isFetching } = useGetMyRatingsQuery({ page, limit: 10 });
  const deleteRating = useDeleteRating();

  const ratings = ratingsData?.data || [];
  const totalPages = ratingsData?.last_page || 1;
  const total = ratingsData?.total || 0;

  const handleDeleteReview = (rating: Rating) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRating.mutate(rating.id, {
            onError: (error) => Alert.alert('Error', error.message || 'Failed to delete review.'),
          });
        },
      },
    ]);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
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
          title="My Reviews"
          description="Manage and view the reviews you have submitted for your service bookings."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        ) : ratings.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12 px-6">
            <View className="h-16 w-16 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Feather name="star" size={28} color="#94a3b8" />
            </View>
            <Text className="text-base font-sans-bold text-gray-900 mb-1 text-center">No reviews yet</Text>
            <Text className="text-xs font-sans-medium text-gray-400 text-center leading-5">
              Once you complete a booking, you can share your feedback and see it here.
            </Text>
          </View>
        ) : (
          <>
            {ratings.map((item) => (
              <View key={item.id} style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                {/* Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1">
                    <Image
                      source={{ uri: getImageUrl(item.provider?.avatar) || 'https://i.pravatar.cc/100' }}
                      className="h-10 w-10 rounded-full border border-gray-100 bg-gray-50 mr-3"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-sans-bold text-gray-900">{item.provider?.name || 'Provider'}</Text>
                      <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                        {item.booking?.service?.name || 'Service'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-sans-medium text-gray-400">{formatDate(item.created_at)}</Text>
                </View>

                {/* Rating */}
                <StarDisplay rate={item.rate} />

                {/* Comment */}
                <Text className="text-xs font-sans-regular text-gray-600 leading-5 mt-1">
                  &ldquo;{item.review}&rdquo;
                </Text>

                {/* Footer Actions */}
                <View className="flex-row justify-end border-t border-gray-50 mt-3 pt-3 gap-2">
                  <Pressable
                    onPress={() => setEditingRating(item)}
                    className="flex-row items-center px-3 py-1.5 rounded-lg active:bg-indigo-50"
                  >
                    <Feather name="edit-2" size={13} color="#485aff" />
                    <Text className="text-xs font-sans-semibold text-primary ml-1.5">Edit</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteReview(item)}
                    className="flex-row items-center px-3 py-1.5 rounded-lg active:bg-red-50"
                  >
                    <Feather name="trash-2" size={13} color="#ef4444" />
                    <Text className="text-xs font-sans-semibold text-red-500 ml-1.5">Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <View className="flex-row items-center justify-center gap-3 mt-2 mb-4">
                <Pressable
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="h-9 w-9 rounded-lg border border-gray-200 items-center justify-center active:bg-gray-50 disabled:opacity-40"
                >
                  <Feather name="chevron-left" size={16} color="#64748b" />
                </Pressable>
                <Text className="text-xs font-sans-medium text-gray-500">
                  Page {page} of {totalPages}
                </Text>
                <Pressable
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="h-9 w-9 rounded-lg border border-gray-200 items-center justify-center active:bg-gray-50 disabled:opacity-40"
                >
                  <Feather name="chevron-right" size={16} color="#64748b" />
                </Pressable>
              </View>
            )}

            {total > 0 && (
              <Text className="text-xs font-sans-medium text-gray-400 text-center mb-2">
                Showing {ratingsData?.from || 0}-{ratingsData?.to || 0} of {total} reviews
              </Text>
            )}
          </>
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
