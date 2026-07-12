import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetCategoriesQuery, useGetNearbyProvidersQuery } from '@/api';
import NearbyServicesMap from '@/components/map/NearbyServicesMap';
import Header from '@/components/navigation/Header';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import ServiceFilterModal from '../components/ServiceFilterModal';
import CategoryScrollSelector from '../components/CategoryScrollSelector';

export default function MapServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const currentUser = useAuthStore((state) => state.user);

  // Default coordinates to Kathmandu if user coordinates are not set or user is guest
  const userLocation = useMemo(() => {
    if (currentUser?.coordinates) {
      return {
        lat: currentUser.coordinates.lat,
        lng: currentUser.coordinates.lng,
      };
    }
    return { lat: 27.700769, lng: 85.30014 };
  }, [currentUser]);

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

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Panned map center coordinates state (defaults to userLocation)
  const [mapCenter, setMapCenter] = useState({
    lat: userLocation.lat,
    lng: userLocation.lng,
  });

  // Debounced map center to optimize API requests during panning
  const [debouncedCenter, setDebouncedCenter] = useState({
    lat: userLocation.lat,
    lng: userLocation.lng,
  });

  // Synchronize map center when userLocation changes on load (during render to avoid cascading renders warning)
  const [prevUserLocation, setPrevUserLocation] = useState(userLocation);

  if (userLocation.lat !== prevUserLocation.lat || userLocation.lng !== prevUserLocation.lng) {
    setPrevUserLocation(userLocation);
    setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
    setDebouncedCenter({ lat: userLocation.lat, lng: userLocation.lng });
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCenter(mapCenter);
    }, 400);
    return () => clearTimeout(handler);
  }, [mapCenter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Nearby Providers
  const { data: providersData, isLoading: isLoadingProviders } = useGetNearbyProvidersQuery({
    lat: debouncedCenter.lat,
    lng: debouncedCenter.lng,
    radius: 25, // default 25km radius
    limit: 50,
    category: selectedCategorySlug || undefined,
    min_rating: appliedFilters.minRating ? Number(appliedFilters.minRating) : undefined,
    min_price: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : undefined,
    max_price: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : undefined,
    service_location: appliedFilters.serviceLocation || undefined,
    search: debouncedSearch || undefined,
  });

  const providers = useMemo(() => {
    return providersData?.data || [];
  }, [providersData]);

  const selectedProvider = useMemo(() => {
    if (!selectedProviderId) return null;
    return providers.find((p) => p.id === selectedProviderId) || null;
  }, [selectedProviderId, providers]);

  const [hasAutoselected, setHasAutoselected] = useState(false);

  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId && !hasAutoselected) {
      const firstId = providers[0].id;
      setTimeout(() => {
        setSelectedProviderId(firstId);
        setHasAutoselected(true);
      }, 0);
    }
  }, [providers, selectedProviderId, hasAutoselected]);

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

  const handleSwitchToList = () => {
    const searchParams = new URLSearchParams();
    if (selectedCategorySlug) searchParams.append('category', selectedCategorySlug);
    if (debouncedSearch) searchParams.append('search', debouncedSearch);
    if (appliedFilters.minPrice) searchParams.append('minPrice', appliedFilters.minPrice);
    if (appliedFilters.maxPrice) searchParams.append('maxPrice', appliedFilters.maxPrice);
    if (appliedFilters.minRating) searchParams.append('minRating', appliedFilters.minRating);
    if (appliedFilters.serviceLocation) searchParams.append('serviceLocation', appliedFilters.serviceLocation);

    const url = `${isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices}?${searchParams.toString()}`;
    router.replace(url as any);
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

      <View
        className="flex-1"
        style={{
          paddingTop: 20,
        }}
      >
        {/* Page Header (Title + Subtitle) */}
        <View className="px-4 mb-6">
          <Text className="text-2xl font-sans-extrabold text-left text-gray-950 mb-1.5 tracking-tight">
            {t('services.findServicesTitle')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
            {t('services.findServicesSubtitle')}
          </Text>
        </View>

        {/* Search Bar & Filters Button */}
        <View className="flex-row items-center gap-2 mb-6 px-4">
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
            onPress={handleSwitchToList}
            className="h-12 w-12 rounded-xl border border-gray-200 bg-white items-center justify-center active:opacity-85"
          >
            <Feather name="list" size={18} color="#485aff" />
          </Pressable>
        </View>

        {/* Categories Horizontal Scroll */}
        <CategoryScrollSelector
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={(slug) => {
            router.replace(
              `${isGuest ? ROUTES.guest.mapServices : ROUTES.customer.mapServices}?category=${slug || ''}`,
            );
          }}
          categories={categoriesData?.data}
          isLoading={isLoadingCategories}
          horizontalPaddingClass="px-4"
        />

        {/* Map Area */}
        <View className="flex-1 relative">
          {isLoadingProviders ? (
            <View className="flex-1 items-center justify-center bg-gray-150">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : (
            <NearbyServicesMap
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              providers={providers}
              selectedProviderId={selectedProviderId}
              onSelectProvider={setSelectedProviderId}
              onMapCenterChange={(lat, lng) => {
                setMapCenter({ lat, lng });
              }}
            />
          )}

          {/* Floating Details Preview Card */}
          {selectedProvider && (
            <Pressable
              onPress={() => handleProviderPress(selectedProvider.slug || selectedProvider.id)}
              style={{
                position: 'absolute',
                bottom: Math.max(insets.bottom, 12),
                left: 14,
                right: 14,
                backgroundColor: '#ffffff',
                borderRadius: 10,
                paddingVertical: 12,
                paddingLeft: 12,
                paddingRight: 14,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#1e293b',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 1,
                borderColor: '#f1f5f9',
              }}
              className="active:opacity-95"
            >
              {/* Close Button */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedProviderId(null);
                }}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -4,
                  zIndex: 10,
                  backgroundColor: '#ffffff',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.12,
                  shadowRadius: 3,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: '#f1f5f9',
                }}
                className="active:opacity-60"
              >
                <Feather name="x" size={10} color="#94a3b8" />
              </Pressable>

              {/* Avatar with accent ring */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  borderWidth: 2,
                  borderColor: '#485aff',
                  padding: 1.5,
                  marginRight: 12,
                }}
              >
                <Image
                  source={{ uri: getImageUrl(selectedProvider.avatar) || FALLBACKS.avatar }}
                  style={{ width: '100%', height: '100%', borderRadius: 20 }}
                  className="bg-gray-100"
                  resizeMode="cover"
                />
              </View>

              {/* Info section */}
              <View className="flex-1" style={{ minWidth: 0 }}>
                {/* Name + city inline */}
                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <Feather name="user" size={11} color="#485aff" />
                  <Text
                    className="text-[13px] font-sans-extrabold text-gray-900"
                    numberOfLines={1}
                    style={{ flexShrink: 1 }}
                  >
                    {selectedProvider.name}
                  </Text>
                  <View className="bg-primary/10 px-1.5 py-px rounded">
                    <Text className="text-[9px] font-sans-bold text-primary uppercase tracking-wide">
                      {selectedProvider.city || 'Provider'}
                    </Text>
                  </View>
                </View>

                {/* Rating + Distance row */}
                <View className="flex-row items-center mt-1.5" style={{ gap: 8 }}>
                  <View className="flex-row items-center" style={{ gap: 2 }}>
                    <Feather name="star" size={10} color="#f59e0b" />
                    <Text className="text-[11px] font-sans-extrabold text-gray-800">
                      {typeof selectedProvider.avg_rating === 'number' ? selectedProvider.avg_rating.toFixed(1) : '0.0'}
                    </Text>
                  </View>
                  <Text className="text-[11px] font-sans-bold text-gray-300">|</Text>
                  <Feather name="map-pin" size={10} color="#64748b" />
                  <Text className="text-[11px] font-sans-bold text-gray-700">
                    {selectedProvider.distance_km.toFixed(2)} km away
                  </Text>
                </View>
              </View>

              {/* Arrow CTA */}
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: '#485aff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                }}
              >
                <Feather name="chevron-right" size={16} color="#ffffff" />
              </View>
            </Pressable>
          )}
        </View>
      </View>

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
