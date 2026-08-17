import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';
import { useGetFavoritesQuery, useAddRemoveFavorite } from '@/api';
import type { FavoriteItem } from '@/types';
import { FALLBACKS, getImageUrl } from '@/features/auth/utils/image';
import { useSnackbar } from '@/components/ui/Snackbar';
import { formatProviderSchedule, getProviderAvailabilityBadge } from '@/features/services/utils/providerAvailability';

import Button from '@/components/ui/Button';
import EmptyFavouritesState from '../components/EmptyFavouritesState';

export default function CustomerFavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [page] = useState(1);

  const { data: favoritesData, isLoading, isError, refetch, isRefetching } = useGetFavoritesQuery({ page, limit: 20 });

  const addRemoveFav = useAddRemoveFavorite();
  const { showSnackbar } = useSnackbar();

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
        onRefresh={() => {
          refetch();
        }}
        refreshing={isRefetching}
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={t('customer.myFavouritesTitle')}
          description={t('customer.myFavouritesDesc')}
          className="mb-5"
          titleClassName="text-2xl"
        />

        {isError ? (
          <View className="flex-1 justify-center items-center py-10 px-6 bg-white rounded-xl border border-gray-200 my-4">
            <View className="h-12 w-12 rounded-full bg-red-50 items-center justify-center mb-4">
              <Feather name="alert-triangle" size={24} color="#dc2626" />
            </View>
            <Text className="text-base font-sans-bold text-gray-900 mb-1">{t('customer.failedToLoadFavorites')}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 text-center mb-6 leading-5">
              {t('customer.failedToLoadFavoritesDesc')}
            </Text>
            <View className="w-full max-w-[200px]">
              <Button title={t('customer.retryConnection')} variant="primary" onPress={handleRetry} />
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
            loadMoreLabel={t('customer.loadMoreFavourites')}
            endReachedLabel={t('customer.noMoreFavourites')}
            emptyContent={<EmptyFavouritesState />}
            renderItem={(item: FavoriteItem) => {
              const service = item.service;
              const provider = service?.provider;
              const imageUri = getImageUrl(provider?.avatar) || FALLBACKS.image;
              const startingPrice = service?.service_offerings?.[0]?.price
                ? `Rs. ${parseInt(service.service_offerings[0].price, 10)}`
                : 'N/A';

              return (
                <ProviderCard
                  avatarUri={imageUri}
                  name={provider?.name || 'Service Partner'}
                  isVerified={true}
                  serviceLabel={service?.category?.name || 'Service'}
                  location={provider?.address || provider?.city || 'Kathmandu, Nepal'}
                  ordersCompleted={t('services.ordersCompletedCount', { count: service?.total_ratings || 0 })}
                  rating={Number(service?.average_rating || 0).toFixed(1)}
                  reviewsCount={service?.total_ratings}
                  startingFromPrice={startingPrice}
                  schedule={formatProviderSchedule(provider, t)}
                  availabilityStatus={getProviderAvailabilityBadge(provider, t)}
                  isFavourite={true}
                  onFavouritePress={() => {
                    const serviceId = service?.id || item.service_id;
                    addRemoveFav.mutate(
                      { service_id: serviceId },
                      {
                        onSuccess: () =>
                          showSnackbar({ message: t('customer.removedFromFavourites'), type: 'success' }),
                      },
                    );
                    refetch();
                  }}
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
