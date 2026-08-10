import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Pressable, Text, View, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { useGetCategoriesQuery, useGetServicesQuery, useAddRemoveFavorite } from '@/api';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { useSnackbar } from '@/components/ui/Snackbar';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import ProviderCard from '@/components/common/ProviderCard';
import ServiceFilterModal from '../components/ServiceFilterModal';
import CategoryScrollSelector from '../components/CategoryScrollSelector';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function FindServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const searchQuery = useServiceFiltersStore((s) => s.searchQuery);
  const setSearchQuery = useServiceFiltersStore((s) => s.setSearchQuery);
  const selectedCategorySlug = useServiceFiltersStore((s) => s.selectedCategorySlug);
  const setSelectedCategorySlug = useServiceFiltersStore((s) => s.setSelectedCategorySlug);
  const minPriceStore = useServiceFiltersStore((s) => s.minPrice);
  const maxPriceStore = useServiceFiltersStore((s) => s.maxPrice);
  const minRatingStore = useServiceFiltersStore((s) => s.minRating);
  const serviceLocationStore = useServiceFiltersStore((s) => s.serviceLocation);
  const radiusStore = useServiceFiltersStore((s) => s.radius);
  const setFilters = useServiceFiltersStore((s) => s.setFilters);
  const resetFiltersStore = useServiceFiltersStore((s) => s.resetFilters);

  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategorySlug) {
      setSelectedCategorySlug(categoryParam);
    }
  }, [categoryParam, selectedCategorySlug, setSelectedCategorySlug]);

  const debouncedSearch = useDebouncedValue(searchQuery, 400);

  // Filters Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(minPriceStore);
  const [maxPrice, setMaxPrice] = useState(maxPriceStore);
  const [minRating, setMinRating] = useState(minRatingStore);
  const [serviceLocation, setServiceLocation] = useState(serviceLocationStore);
  const [radius, setRadius] = useState(radiusStore);

  const handleSwitchToMap = () => {
    const route = isGuest ? ROUTES.guest.mapServices : ROUTES.customer.mapServices;
    router.replace(route);
  };

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Services with server-side filters
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategorySlug || undefined,
    min_price: minPriceStore ? Number(minPriceStore) : undefined,
    max_price: maxPriceStore ? Number(maxPriceStore) : undefined,
    min_rating: minRatingStore ? Number(minRatingStore) : undefined,
    service_location: serviceLocationStore || undefined,
    limit: 50,
  });

  // Display services directly as verified provider filtering is handled server-side
  const verifiedServices = useMemo(() => {
    return servicesData?.data || [];
  }, [servicesData]);

  const getAvatarUri = (avatar: string | null | undefined) => {
    return getImageUrl(avatar) || FALLBACKS.avatar;
  };

  const formatPriceInNepali = (price: number) => {
    return `Rs. ${Number(price).toLocaleString('en-NP', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getStartingPrice = (serviceOfferings: { price: string }[] | undefined) => {
    if (!serviceOfferings || serviceOfferings.length === 0) return 'N/A';
    const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return 'N/A';
    const minPrice = Math.min(...prices);
    return formatPriceInNepali(minPrice);
  };

  const formatLocation = (provider: { city?: string | null; address?: string | null } | undefined | null) => {
    if (!provider) return 'Nepal';
    const city = provider.city;
    const address = provider.address;
    if (city && address) return `${address}, ${city}`;
    return city || address || 'Nepal';
  };

  const handleProviderPress = (providerSlugOrId: string) => {
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
  };

  const handleApplyFilters = () => {
    setFilters({
      minPrice,
      maxPrice,
      minRating,
      serviceLocation,
      radius,
    });
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setServiceLocation('');
    setRadius('25');
    resetFiltersStore();
    setIsFilterModalOpen(false);
  };

  const addRemoveFav = useAddRemoveFavorite();
  const { showSnackbar } = useSnackbar();

  const favouriteIds = useMemo(
    () => new Set(servicesData?.data.filter((s) => s.is_favourite).map((s) => s.id) || []),
    [servicesData],
  );

  const handleFavouritePress = (serviceId: string) => {
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
  };

  const activeFiltersCount = [minPriceStore, maxPriceStore, minRatingStore, serviceLocationStore].filter(
    Boolean,
  ).length;

  return (
    <View className="flex-1 bg-secondary">
      <Header
        variant="menu"
        showNotifications={!isGuest}
        showNotificationBadge={!isGuest}
        onNotificationsPress={() => router.push(ROUTES.notifications)}
      />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 20,
        }}
      >
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
          <Input
            placeholder={t('services.searchPlaceholder2')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            inputClassName="pr-12 text-sm"
            rightIcon={
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                <Feather name="search" size={16} color="#485aff" />
              </View>
            }
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
              color={activeFiltersCount > 0 ? '#ffffff' : '#485aff'}
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
            className="flex-1 flex-row items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-200 bg-white items-center justify-center active:opacity-85"
          >
            <Feather name="map" size={16} color="#485aff" accessible={false} />
            <Text className="text-xs font-sans-bold text-gray-800">{t('services.mapView')}</Text>
          </Pressable>
        </View>

        {/* Categories Horizontal Scroll */}
        <CategoryScrollSelector
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={(slug) => {
            router.replace(
              `${isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices}?category=${slug || ''}`,
            );
          }}
          categories={categoriesData?.data}
          isLoading={isLoadingCategories}
          horizontalPaddingClass="px-0"
        />

        {/* Service Providers Listing */}
        <View className="flex-1">
          <Text className="text-lg font-sans-bold text-gray-950 mb-4 tracking-tight">
            {t('services.serviceProviders')}
          </Text>

          {isLoadingServices ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : verifiedServices.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Feather name="search" size={40} color="#64748b" />
              <Text className="text-sm font-sans-semibold text-gray-900 mt-4">{t('services.noProvidersFound')}</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-1 text-center px-6">
                {t('services.noProvidersFoundDesc')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={verifiedServices}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              initialNumToRender={8}
              maxToRenderPerBatch={5}
              windowSize={5}
              ItemSeparatorComponent={() => <View className="h-4" />}
              renderItem={({ item: service }) => (
                <ProviderCard
                  avatarUri={getAvatarUri(service.provider?.avatar)}
                  name={service.provider?.name || 'Service Provider'}
                  serviceLabel={service.category?.name || 'Service'}
                  location={formatLocation(service.provider)}
                  rating={Number(service.average_rating || 0).toFixed(1)}
                  ordersCompleted={`${service.total_ratings || 0} orders`}
                  startingFromPrice={getStartingPrice(service.service_offerings)}
                  isFavourite={favouriteIds.has(service.id)}
                  isGuest={isGuest}
                  onFavouritePress={() => handleFavouritePress(service.id)}
                  onPress={() => handleProviderPress(service.provider?.slug || service.provider?.id || '')}
                />
              )}
            />
          )}
        </View>
      </ContentLayout>

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
