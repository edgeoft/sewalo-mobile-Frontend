import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';
import { useGetFavoritesQuery, useAddRemoveFavorite } from '@/api';
import type { FavoriteItem } from '@/types';
import { getImageUrl } from '@/features/auth/utils/image';

import Button from '@/components/ui/Button';
import EmptyFavouritesState from '../components/EmptyFavouritesState';

export default function CustomerFavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page] = useState(1);

  const { data: favoritesData, isLoading, isError, refetch } = useGetFavoritesQuery({ page, limit: 20 });

  const addRemoveFav = useAddRemoveFavorite();

  const handleRetry = () => {
    refetch();
  };

  const favoritesList = favoritesData?.data || [];

  return (
    <View className="flex-1 bg-secondary">
      <Header
        variant="menu"
        showNotifications
        showNotificationBadge
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

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
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#485aff" />
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
                  rating={Number(service?.average_rating || 0).toFixed(1)}
                  startingFromPrice={startingPrice}
                  isFavourite={true}
                  onFavouritePress={() => {
                    const serviceId = service?.id || item.service_id;
                    addRemoveFav.mutate({ service_id: serviceId });
                    refetch();
                  }}
                  actionLabel="View Details"
                  variant="details"
                  onPress={() => {
                    const slug = provider?.slug || service?.id || item.service_id;
                    router.push(ROUTES.providerDetail(slug));
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
