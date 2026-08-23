import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo } from 'react';
import { Pressable, Text, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import SearchBar from '@/components/ui/SearchBar';
import { ROUTES } from '@/constants/routes';
import { useGetCategoriesQuery, useGetServicesQuery, useAddRemoveFavorite } from '@/api';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import { useSnackbar } from '@/components/ui/Snackbar';
import type { Service } from '@/types';
import { getAvatarUrl } from '@/utils/image';
import { getStartingPrice } from '@/utils/currency';
import { formatProviderLocation } from '@/utils/location';
import ProviderCard from '@/components/common/ProviderCard';
import ServiceFilterModal from '../components/ServiceFilterModal';
import CategoryScrollSelector from '../components/CategoryScrollSelector';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';
import { useServiceFilters } from '@/hooks/useServiceFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatProviderSchedule, getProviderAvailabilityBadge } from '@/features/services/utils/providerAvailability';
import { USER_STATUSES } from '@/constants/roles';
import { useAuthStore } from '@/store/useAuthStore';

const ItemSeparator = () => <View className="h-4" />;

export default function FindServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const currentUser = useAuthStore((state) => state.user);
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const searchQuery = useServiceFiltersStore((s) => s.searchQuery);
  const setSearchQuery = useServiceFiltersStore((s) => s.setSearchQuery);
  const selectedCategorySlug = useServiceFiltersStore((s) => s.selectedCategorySlug);
  const setSelectedCategorySlug = useServiceFiltersStore((s) => s.setSelectedCategorySlug);

  // Shared filter-draft lifecycle (modal editing -> apply commits to store)
  const {
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    isFilterModalOpen,
    setIsFilterModalOpen,
    minPrice,
    maxPrice,
    minRating,
    serviceLocation,
    radius,
    setRadius,
    setMinPrice,
    setMaxPrice,
    setMinRating,
    setServiceLocation,
    handleApplyFilters,
    handleResetFilters,
    activeFiltersCount,
  } = useServiceFilters();

  useEffect(() => {
    const nextCategory = categoryParam || undefined;
    if (nextCategory !== selectedCategorySlug) {
      setSelectedCategorySlug(nextCategory);
    }
  }, [categoryParam, selectedCategorySlug, setSelectedCategorySlug]);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  const handleSwitchToMap = () => {
    const route = isGuest ? ROUTES.guest.mapServices : ROUTES.customer.mapServices;
    router.replace(route);
  };

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Services with server-side filters
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    isError: isServicesError,
    refetch: refetchServices,
  } = useGetServicesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategorySlug || undefined,
    min_price: minPriceStore ? Number(minPriceStore) : undefined,
    max_price: maxPriceStore ? Number(maxPriceStore) : undefined,
    min_rating: minRatingStore ? Number(minRatingStore) : undefined,
    service_location: serviceLocationStore || undefined,
    limit: 50,
  });

  // Display services directly as verified provider filtering is handled server-side,
  // with client-side exclusion of currentUser's own provider services
  const verifiedServices = useMemo(() => {
    const list = servicesData?.data || [];
    if (!currentUser?.id) return list;
    return list.filter((s) => s.provider_id !== currentUser.id && s.provider?.id !== currentUser.id);
  }, [servicesData, currentUser]);

  const handleProviderPress = useCallback(
    (providerSlugOrId: string) => {
      if (isGuest) {
        showError({
          title: t('auth.authRequiredTitle'),
          message: t('auth.authRequiredProviderMsg'),
          actions: [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('auth.login'),
              onPress: () => router.push(ROUTES.auth.signin),
            },
          ],
        });
      } else {
        router.push(ROUTES.providerDetail(providerSlugOrId));
      }
    },
    [isGuest, t, showError, router],
  );

  const addRemoveFav = useAddRemoveFavorite();
  const { showSnackbar } = useSnackbar();

  const favouriteIds = useMemo(
    () => new Set(servicesData?.data.filter((s) => s.is_favourite).map((s) => s.id) || []),
    [servicesData],
  );

  const handleFavouritePress = useCallback(
    (serviceId: string) => {
      if (isGuest) {
        showError({
          title: t('auth.authRequiredTitle'),
          message: t('auth.authRequiredFavMsg'),
          actions: [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('auth.login'),
              onPress: () => router.push(ROUTES.auth.signin),
            },
          ],
        });
      } else {
        const isCurrentlyFav = favouriteIds.has(serviceId);
        addRemoveFav.mutate(
          { service_id: serviceId },
          {
            onSuccess: () =>
              showSnackbar({
                message: isCurrentlyFav ? t('customer.removedFromFavourites') : t('customer.addedToFavourites'),
                type: 'success',
              }),
          },
        );
      }
    },
    [isGuest, t, showError, router, favouriteIds, addRemoveFav, showSnackbar],
  );

  const keyExtractor = useCallback((item: Service) => item.id, []);

  const renderItem = useCallback(
    ({ item: service }: { item: Service }) => (
      <ProviderCard
        avatarUri={getAvatarUrl(service.provider?.avatar)}
        name={service.provider?.name || 'Service Provider'}
        isVerified={
          service.provider?.status === USER_STATUSES.Verified || Boolean(service.provider?.profile_verified_at)
        }
        serviceLabel={service.category?.name || 'Service'}
        location={formatProviderLocation(service.provider)}
        rating={Number(service.average_rating || 0).toFixed(1)}
        reviewsCount={service.total_ratings}
        ordersCompleted={t('services.ordersCompletedCount', { count: service.total_ratings || 0 })}
        startingFromPrice={getStartingPrice(service.service_offerings)}
        schedule={formatProviderSchedule(service.provider, t)}
        availabilityStatus={getProviderAvailabilityBadge(service.provider, t)}
        isFavourite={favouriteIds.has(service.id)}
        isGuest={isGuest}
        onFavouritePress={() => handleFavouritePress(service.id)}
        onPress={() => handleProviderPress(service.provider?.slug || service.provider?.id || '')}
      />
    ),
    [favouriteIds, handleFavouritePress, handleProviderPress, isGuest, t],
  );

  const listHeader = (
    <View>
      {/* Page Header (Title + Subtitle) */}
      <View className="mb-6">
        <Text className="text-2xl font-sans-extrabold text-left text-gray-950 mb-1.5 tracking-tight">
          {t('services.findServicesTitle')}
        </Text>
        <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
          {t('services.findServicesSubtitle')}
        </Text>
      </View>

      {/* Full-width Search Bar */}
      <View className="mb-3">
        <SearchBar
          placeholder={t('services.searchPlaceholder2')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          iconPosition="right"
        />
      </View>

      {/* Filters & Map Action Toolbar */}
      <View className="flex-row items-center justify-between gap-3 mb-6">
        <Pressable
          onPress={() => setIsFilterModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('services.filterTitle')}
          className={`flex-1 flex-row items-center justify-center gap-2 h-11 px-4 rounded-xl border active:opacity-85 ${
            activeFiltersCount > 0 ? 'bg-primary border-primary' : 'bg-white border-gray-200'
          }`}
        >
          <Feather
            name="sliders"
            size={16}
            color={activeFiltersCount > 0 ? '#ffffff' : THEME_COLORS.primary}
            accessible={false}
          />
          <Text className={`text-xs font-sans-bold ${activeFiltersCount > 0 ? 'text-white' : 'text-gray-800'}`}>
            {t('services.filterTitle')}
          </Text>
          {activeFiltersCount > 0 && (
            <View className="bg-red-500 rounded-full h-5 px-1.5 items-center justify-center min-w-[20px]">
              <Text className="text-[10px] font-sans-bold text-white">{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={handleSwitchToMap}
          accessibilityRole="button"
          accessibilityLabel={t('services.mapView')}
          className="flex-1 flex-row items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white active:opacity-85"
        >
          <Feather name="map" size={16} color={THEME_COLORS.primary} accessible={false} />
          <Text className="text-xs font-sans-bold text-gray-800">{t('services.mapView')}</Text>
        </Pressable>
      </View>

      {/* Categories Horizontal Scroll */}
      <CategoryScrollSelector
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={(slug) => {
          setSelectedCategorySlug(slug);
          const baseRoute = isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices;
          router.replace(slug ? `${baseRoute}?category=${slug}` : baseRoute);
        }}
        categories={categoriesData?.data}
        isLoading={isLoadingCategories}
        horizontalPaddingClass="px-0"
      />

      {/* Section title */}
      <Text className="text-lg font-sans-bold text-gray-950 mb-4 mt-6 tracking-tight">
        {t('services.serviceProviders')}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-secondary">
      <Header
        variant="menu"
        showNotifications={!isGuest}
        showNotificationBadge={!isGuest}
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

      <FlatList
        data={isLoadingServices ? [] : verifiedServices}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ItemSeparatorComponent={ItemSeparator}
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoadingServices ? (
            <LoadingState className="py-20" />
          ) : isServicesError ? (
            <ErrorState onRetry={() => refetchServices()} className="py-6 mt-2" />
          ) : (
            <View className="py-12 items-center justify-center">
              <Feather name="search" size={40} color="#64748b" />
              <Text className="text-sm font-sans-semibold text-gray-900 mt-4">{t('services.noProvidersFound')}</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-1 text-center px-6">
                {t('services.noProvidersFoundDesc')}
              </Text>
            </View>
          )
        }
      />

      {/* Reusable Filters Modal */}
      <ServiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minRating={minRating}
        setMinRating={setMinRating}
        serviceLocation={serviceLocation}
        setServiceLocation={setServiceLocation}
        radius={radius}
        setRadius={setRadius}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}
