import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
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
import { MapViewport } from '@/types';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import { addBoundingBoxBuffer } from '@/utils/geohash';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';
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

  const searchQuery = useServiceFiltersStore((s) => s.searchQuery);
  const setSearchQuery = useServiceFiltersStore((s) => s.setSearchQuery);
  const selectedCategorySlug = useServiceFiltersStore((s) => s.selectedCategorySlug);
  const minPriceStore = useServiceFiltersStore((s) => s.minPrice);
  const maxPriceStore = useServiceFiltersStore((s) => s.maxPrice);
  const minRatingStore = useServiceFiltersStore((s) => s.minRating);
  const serviceLocationStore = useServiceFiltersStore((s) => s.serviceLocation);
  const setFilters = useServiceFiltersStore((s) => s.setFilters);
  const resetFiltersStore = useServiceFiltersStore((s) => s.resetFilters);

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Filters Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState(minPriceStore);
  const [maxPrice, setMaxPrice] = useState(maxPriceStore);
  const [minRating, setMinRating] = useState(minRatingStore);
  const [serviceLocation, setServiceLocation] = useState(serviceLocationStore);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  // Panned map viewport state (defaults to userLocation)
  const [viewport, setViewport] = useState<MapViewport>({
    center: { lat: userLocation.lat, lng: userLocation.lng },
    zoom: 14,
  });

  // Debounced map viewport to optimize API requests during panning
  const [debouncedViewport, setDebouncedViewport] = useState<MapViewport>({
    center: { lat: userLocation.lat, lng: userLocation.lng },
    zoom: 14,
  });

  // Synchronize map center when userLocation changes on load
  const [prevUserLocation, setPrevUserLocation] = useState(userLocation);

  if (userLocation.lat !== prevUserLocation.lat || userLocation.lng !== prevUserLocation.lng) {
    setPrevUserLocation(userLocation);
    const initialViewport = { center: { lat: userLocation.lat, lng: userLocation.lng }, zoom: 14 };
    setViewport(initialViewport);
    setDebouncedViewport(initialViewport);
  }

  // High-performance 500ms debounce with micro-movement jitter threshold check
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedViewport((prev) => {
        if (!prev) return viewport;
        const isSameZoom = prev.zoom === viewport.zoom;
        const latDiff = Math.abs(prev.center.lat - viewport.center.lat);
        const lngDiff = Math.abs(prev.center.lng - viewport.center.lng);

        if (isSameZoom && latDiff < 0.005 && lngDiff < 0.005) {
          return prev;
        }
        return viewport;
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [viewport]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Compute 25% padded bounds for query
  const bufferedBounds = useMemo(() => {
    if (!debouncedViewport.bounds) return null;
    return addBoundingBoxBuffer(debouncedViewport.bounds.sw, debouncedViewport.bounds.ne, 0.25);
  }, [debouncedViewport.bounds]);

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Nearby Providers with bounds
  const { data: providersData, isLoading: isLoadingProviders } = useGetNearbyProvidersQuery({
    lat: debouncedViewport.center.lat,
    lng: debouncedViewport.center.lng,
    ...(bufferedBounds
      ? {
          sw_lat: bufferedBounds.sw.lat,
          sw_lng: bufferedBounds.sw.lng,
          ne_lat: bufferedBounds.ne.lat,
          ne_lng: bufferedBounds.ne.lng,
        }
      : {}),
    zoom: debouncedViewport.zoom,
    radius: 25,
    limit: 150,
    category: selectedCategorySlug || undefined,
    min_rating: minRatingStore ? Number(minRatingStore) : undefined,
    min_price: minPriceStore ? Number(minPriceStore) : undefined,
    max_price: maxPriceStore ? Number(maxPriceStore) : undefined,
    service_location: serviceLocationStore || undefined,
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
    setFilters({
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
    resetFiltersStore();
    setIsFilterModalOpen(false);
  };

  const handleSwitchToList = () => {
    const route = isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices;
    router.replace(route);
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
            accessibilityRole="button"
            accessibilityLabel={t('services.filterTitle')}
            className={`h-12 w-12 rounded-xl border items-center justify-center relative active:opacity-85 ${
              activeFiltersCount > 0 ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Feather
              name="sliders"
              size={18}
              color={activeFiltersCount > 0 ? '#ffffff' : '#485aff'}
              accessible={false}
            />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full h-5 w-5 items-center justify-center border border-white">
                <Text className="text-[10px] font-sans-bold text-white">{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={handleSwitchToList}
            accessibilityRole="button"
            accessibilityLabel={t('services.listView')}
            className="h-12 w-12 rounded-xl border border-gray-200 bg-white items-center justify-center active:opacity-85"
          >
            <Feather name="list" size={18} color="#485aff" accessible={false} />
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
          <View className="flex-1" importantForAccessibility="no">
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
                  setViewport((prev) => ({ ...prev, center: { lat, lng } }));
                }}
                onMapViewportChange={(newViewport) => {
                  setViewport(newViewport);
                }}
              />
            )}
          </View>

          {/* Floating Details Preview Card */}
          {selectedProvider && (
            <Pressable
              onPress={() => handleProviderPress(selectedProvider.slug || selectedProvider.id)}
              accessibilityRole="button"
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
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
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
                <Feather name="x" size={10} color="#94a3b8" accessible={false} />
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
