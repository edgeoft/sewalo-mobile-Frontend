import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';
import { useGetFavoritesQuery } from '@/api/user/hooks/favourites';
import { FavoriteItem } from '@/api/user/types/favourites';
import { getImageUrl } from '@/features/auth/utils/image';
import { Skeleton } from '@/components/ui';
import Button from '@/components/ui/Button';
import EmptyFavouritesState from '../components/EmptyFavouritesState';

const FavoriteSkeleton = () => (
  <View className="shrink-0 rounded-xl border border-gray-200 bg-white p-3 mb-4">
    <View className="flex-row gap-3">
      <Skeleton className="h-24 w-24 rounded-xl" />
      <View className="flex-1 justify-between py-0.5 gap-y-2">
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-7 w-7 rounded-xl" />
        </View>
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-xl" />
          <Skeleton className="h-5 w-12 rounded-xl" />
        </View>
        <View className="gap-y-1.5 mt-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </View>
      </View>
    </View>
    <View className="my-2.5 border-t border-gray-100" />
    <View className="flex-row items-center justify-between">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </View>
  </View>
);

export default function CustomerFavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);

  const { data: favoritesData, isLoading, isError, refetch } = useGetFavoritesQuery({ page, limit: 20 });

  const handleRetry = () => {
    refetch();
  };

  const favoritesList = favoritesData?.data || [];

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push(ROUTES.notifications)} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="My Favourites"
          description="View your saved providers and services."
          className="mb-5"
          titleClassName="text-2xl"
        />

        {isError ? (
          <View className="flex-1 justify-center items-center py-10 px-6 bg-white rounded-xl border border-gray-200 my-4">
            <View className="h-12 w-12 rounded-full bg-red-50 items-center justify-center mb-4">
              <Feather name="alert-triangle" size={24} color="#dc2626" />
            </View>
            <Text className="text-base font-sans-bold text-gray-900 mb-1">Failed to load favorites</Text>
            <Text className="text-xs font-sans-medium text-gray-500 text-center mb-6 leading-5">
              We encountered a network issue while retrieving your saved items.
            </Text>
            <View className="w-full max-w-[200px]">
              <Button title="Retry Connection" variant="primary" onPress={handleRetry} />
            </View>
          </View>
        ) : isLoading ? (
          <View className="flex-1">
            <FavoriteSkeleton />
            <FavoriteSkeleton />
            <FavoriteSkeleton />
          </View>
        ) : (
          <LoadMoreList
            data={favoritesList}
            keyExtractor={(item: FavoriteItem) => item.id}
            initialVisibleCount={4}
            pageSize={4}
            loadMoreLabel="Load More Favourites"
            endReachedLabel="No more favourites"
            emptyContent={<EmptyFavouritesState />}
            renderItem={(item: FavoriteItem) => {
              const service = item.service;
              const provider = service?.provider;
              const imageUri = getImageUrl(provider?.avatar) || 'https://via.placeholder.com/150';
              const startingPrice = service?.service_offerings?.[0]?.price
                ? `Rs. ${parseInt(service.service_offerings[0].price, 10)}`
                : 'N/A';

              return (
                <ProviderCard
                  avatarUri={imageUri}
                  name={provider?.name || 'Service Partner'}
                  serviceLabel={service?.category?.name || 'Service'}
                  location={provider?.address || provider?.city || 'Kathmandu, Nepal'}
                  ordersCompleted={`${provider?.profile_views || 0} Views`}
                  rating={service?.average_rating ? parseFloat(service.average_rating).toFixed(1) : '0.0'}
                  startingFromPrice={startingPrice}
                  actionLabel="View Details"
                  variant="details"
                  onPress={() => {
                    const serviceId = service?.id || item.service_id;
                    router.push(ROUTES.providerDetail(serviceId));
                  }}
                />
              );
            }}
          />
        )}

        <View className="h-3" />
      </ContentLayout>
    </View>
  );
}
