import React, { useState } from 'react';
import { View, Text, Image, Alert, FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

interface ReviewItem {
  id: string;
  providerName: string;
  providerAvatar: string;
  serviceName: string;
  date: string;
  rating: number;
  comment: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    providerName: 'Karan Bahadur',
    providerAvatar: 'https://i.pravatar.cc/300?img=12',
    serviceName: 'House Deep Cleaning',
    date: '2026-05-20',
    rating: 5,
    comment:
      'Exceptional service! Karan and his team arrived on time and did an amazing job cleaning the entire house. Highly recommended!',
  },
  {
    id: 'rev-2',
    providerName: 'Sunita Sharma',
    providerAvatar: 'https://i.pravatar.cc/300?img=49',
    serviceName: 'Electrician & Fan Repair',
    date: '2026-04-15',
    rating: 4,
    comment:
      'Very polite and knowledgeable. She fixed the issue with the ceiling fan quickly, though she was about 10 minutes late.',
  },
  {
    id: 'rev-3',
    providerName: 'Rajesh Shrestha',
    providerAvatar: 'https://i.pravatar.cc/300?img=60',
    serviceName: 'Emergency Plumbing Fix',
    date: '2026-03-02',
    rating: 5,
    comment:
      'Saved my day! Had a major pipe burst in the kitchen. Rajesh responded within 20 minutes and fixed it efficiently.',
  },
];

export default function MyReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  const handleDeleteReview = (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review? This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setReviews((prev) => prev.filter((r) => r.id !== id));
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

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row items-center gap-0.5 my-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name="star"
            size={14}
            color={star <= rating ? '#f59e0b' : '#cbd5e1'}
            fill={star <= rating ? '#f59e0b' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
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

        {reviews.length === 0 ? (
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
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
                {/* Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1">
                    <Image
                      source={{ uri: item.providerAvatar }}
                      className="h-10 w-10 rounded-full border border-gray-100 bg-gray-50 mr-3"
                      resizeMode="cover"
                    />
                    <View className="flex-1">
                      <Text className="text-sm font-sans-bold text-gray-900">{item.providerName}</Text>
                      <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">{item.serviceName}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] font-sans-medium text-gray-400">{item.date}</Text>
                </View>

                {/* Rating */}
                {renderStars(item.rating)}

                {/* Comment */}
                <Text className="text-xs font-sans-regular text-gray-600 leading-5 mt-1">
                  &ldquo;{item.comment}&rdquo;
                </Text>

                {/* Footer Actions */}
                <View className="flex-row justify-end border-t border-gray-50 mt-3 pt-3">
                  <Pressable
                    onPress={() => handleDeleteReview(item.id)}
                    className="flex-row items-center px-3 py-1.5 rounded-lg active:bg-red-50"
                  >
                    <Feather name="trash-2" size={13} color="#ef4444" />
                    <Text className="text-xs font-sans-semibold text-red-500 ml-1.5">Delete Review</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </ContentLayout>
    </View>
  );
}
