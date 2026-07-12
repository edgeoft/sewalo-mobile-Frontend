import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
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

export default function FindServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const {
    category: categoryParam,
    search: searchParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
    minRating: minRatingParam,
    serviceLocation: serviceLocationParam,
  } = useLocalSearchParams<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    serviceLocation?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam || '');
  const selectedCategorySlug = categoryParam || undefined;

  // Filters Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(minPriceParam || '');
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '');
  const [minRating, setMinRating] = useState(minRatingParam || '');
  const [serviceLocation, setServiceLocation] = useState(serviceLocationParam || '');

  // Active filters applied to query
  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: minPriceParam || '',
    maxPrice: maxPriceParam || '',
    minRating: minRatingParam || '',
    serviceLocation: serviceLocationParam || '',
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSwitchToMap = () => {
    const searchParams = new URLSearchParams();
    if (selectedCategorySlug) searchParams.append('category', selectedCategorySlug);
    if (debouncedSearch) searchParams.append('search', debouncedSearch);
    if (appliedFilters.minPrice) searchParams.append('minPrice', appliedFilters.minPrice);
    if (appliedFilters.maxPrice) searchParams.append('maxPrice', appliedFilters.maxPrice);
    if (appliedFilters.minRating) searchParams.append('minRating', appliedFilters.minRating);
    if (appliedFilters.serviceLocation) searchParams.append('serviceLocation', appliedFilters.serviceLocation);

    const url = `${isGuest ? ROUTES.guest.mapServices : ROUTES.customer.mapServices}?${searchParams.toString()}`;
    router.replace(url as any);
  };

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Services with server-side filters
  const { data: servicesData, isLoading: isLoadingServices } = useGetServicesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategorySlug || undefined,
    min_price: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : undefined,
    max_price: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : undefined,
    min_rating: appliedFilters.minRating ? Number(appliedFilters.minRating) : undefined,
    service_location: appliedFilters.serviceLocation || undefined,
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

  const getStartingPrice = (serviceOfferings: any[]) => {
    if (!serviceOfferings || serviceOfferings.length === 0) return 'N/A';
    const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return 'N/A';
    const minPrice = Math.min(...prices);
    return formatPriceInNepali(minPrice);
  };

  const formatLocation = (provider: any) => {
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
    setAppliedFilters({
      minPrice,
      maxPrice,
      minRating,
      serviceLocation,
    });
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setServiceLocation('');
    setAppliedFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      serviceLocation: '',
    });
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
      addRemoveFav.mutate(
        { service_id: serviceId },
        { onSuccess: () => showSnackbar({ message: 'Added to favourites', type: 'success' }) },
      );
    }
  };

  const activeFiltersCount = Object.values(appliedFilters).filter(Boolean).length;

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

        {/* Search Bar & Filters Button */}
        <View className="flex-row items-center gap-2 mb-6">
          <View className="flex-1">
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
          <Pressable
            onPress={() => setIsFilterModalOpen(true)}
            className={`h-12 w-12 rounded-xl border items-center justify-center relative active:opacity-85 ${
              activeFiltersCount > 0 ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Feather name="sliders" size={18} color={activeFiltersCount > 0 ? '#ffffff' : '#485aff'} />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full h-5 w-5 items-center justify-center border border-white">
                <Text className="text-[10px] font-sans-bold text-white">{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={handleSwitchToMap}
            className="h-12 w-12 rounded-xl border border-gray-200 bg-white items-center justify-center active:opacity-85"
          >
            <Feather name="map" size={18} color="#485aff" />
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
            <View className="gap-4">
              {verifiedServices.map((service) => (
                <ProviderCard
                  key={service.id}
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
              ))}
            </View>
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
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}
