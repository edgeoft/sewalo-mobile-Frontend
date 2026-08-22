import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetCategoriesQuery, useGetNearbyProvidersQuery } from '@/api';
import NearbyServicesMap from '@/components/map/NearbyServicesMap';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';
import { useServiceFilters } from '@/hooks/useServiceFilters';
import { MapViewport } from '@/types';
import { addBoundingBoxBuffer } from '@/utils/geohash';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import ServiceFilterModal from '../components/ServiceFilterModal';

export default function MapServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const currentUser = useAuthStore((state) => state.user);

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
  const selectedCategorySlug = useServiceFiltersStore((s) => s.selectedCategorySlug);
  const setSelectedCategorySlugStore = useServiceFiltersStore((s) => s.setSelectedCategorySlug);
  const {
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    radiusStore,
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

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);

  const [viewport, setViewport] = useState<MapViewport>({
    center: { lat: userLocation.lat, lng: userLocation.lng },
    zoom: 14,
  });

  const [debouncedViewport, setDebouncedViewport] = useState<MapViewport>({
    center: { lat: userLocation.lat, lng: userLocation.lng },
    zoom: 14,
  });

  const [prevUserLocation, setPrevUserLocation] = useState(userLocation);

  if (userLocation.lat !== prevUserLocation.lat || userLocation.lng !== prevUserLocation.lng) {
    setPrevUserLocation(userLocation);
    const initialViewport = { center: { lat: userLocation.lat, lng: userLocation.lng }, zoom: 14 };
    setViewport(initialViewport);
    setDebouncedViewport(initialViewport);
  }

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

  const bufferedBounds = useMemo(() => {
    if (!debouncedViewport.bounds) return null;
    return addBoundingBoxBuffer(debouncedViewport.bounds.sw, debouncedViewport.bounds.ne, 0.25);
  }, [debouncedViewport.bounds]);

  const { data: categoriesData } = useGetCategoriesQuery();

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
    radius: radiusStore ? Number(radiusStore) : 25,
    limit: 150,
    category: selectedCategorySlug || undefined,
    min_rating: minRatingStore ? Number(minRatingStore) : undefined,
    min_price: minPriceStore ? Number(minPriceStore) : undefined,
    max_price: maxPriceStore ? Number(maxPriceStore) : undefined,
    service_location: serviceLocationStore || undefined,
    search: debouncedSearch || undefined,
  });

  const providers = useMemo(() => {
    const list = providersData?.data || [];
    if (!currentUser?.id) return list;
    return list.filter(
      (p) => p.id !== currentUser.id && (p as { provider_id?: string }).provider_id !== currentUser.id,
    );
  }, [providersData, currentUser]);

  const selectedProvider = useMemo(() => {
    if (!selectedProviderId) return null;
    return providers.find((p) => p.id === selectedProviderId) || null;
  }, [selectedProviderId, providers]);

  const [hasAutoselected, setHasAutoselected] = useState(false);

  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId && !hasAutoselected) {
      const firstId = providers[0].id;
      const timeout = setTimeout(() => {
        setSelectedProviderId(firstId);
        setHasAutoselected(true);
      }, 0);
      return () => clearTimeout(timeout);
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

  const handleSwitchToList = () => {
    const route = isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices;
    router.replace(route);
  };

  const currentCategoryName = useMemo(() => {
    if (!selectedCategorySlug) return t('common.all');
    const matched = categoriesData?.data?.find((c) => c.slug === selectedCategorySlug);
    return matched?.name || t('common.all');
  }, [selectedCategorySlug, categoriesData?.data, t]);

  return (
    <View className="flex-1 bg-secondary relative">
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

      {/* Floating Top Controls Overlay (Separated Left & Right Buttons) */}
      <View
        style={{
          position: 'absolute',
          top: Math.max(insets.top, 12),
          left: 14,
          right: 14,
          zIndex: 20,
        }}
        className="flex-row items-center justify-between"
      >
        {/* Left Controls: Category Button & Filter Button */}
        <View className="flex-row items-center gap-2">
          {/* Category Button */}
          <Pressable
            onPress={() => setIsCategoryModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('services.selectCategory')}
            className={`h-10 px-3.5 rounded-lg border flex-row items-center gap-1.5 active:opacity-85 ${
              selectedCategorySlug ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Feather name="grid" size={14} color={selectedCategorySlug ? '#ffffff' : '#485aff'} accessible={false} />
            <Text
              className={`text-xs font-sans-bold ${selectedCategorySlug ? 'text-white' : 'text-gray-800'}`}
              numberOfLines={1}
            >
              {currentCategoryName}
            </Text>
            <Feather
              name="chevron-down"
              size={12}
              color={selectedCategorySlug ? '#ffffff' : '#64748b'}
              accessible={false}
            />
          </Pressable>

          {/* Filter Button */}
          <Pressable
            onPress={() => setIsFilterModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('services.filterTitle')}
            className={`h-10 w-10 rounded-lg border items-center justify-center relative active:opacity-85 ${
              activeFiltersCount > 0 ? 'bg-primary border-primary' : 'bg-white border-gray-200'
            }`}
          >
            <Feather
              name="sliders"
              size={14}
              color={activeFiltersCount > 0 ? '#ffffff' : '#485aff'}
              accessible={false}
            />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full h-4 w-4 items-center justify-center border border-white">
                <Text className="text-[9px] font-sans-bold text-white">{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Right Control: List View Toggle Button */}
        <Pressable
          onPress={handleSwitchToList}
          accessibilityRole="button"
          accessibilityLabel={t('services.listView')}
          className="h-10 w-10 rounded-lg border border-gray-200 bg-white items-center justify-center active:opacity-85"
        >
          <Feather name="list" size={15} color="#485aff" accessible={false} />
        </Pressable>
      </View>

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
            borderRadius: 12,
            paddingVertical: 12,
            paddingLeft: 12,
            paddingRight: 14,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#e2e8f0',
            zIndex: 30,
          }}
          className="active:opacity-95"
        >
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
              borderWidth: 1,
              borderColor: '#cbd5e1',
            }}
            className="active:opacity-60"
          >
            <Feather name="x" size={10} color="#64748b" accessible={false} />
          </Pressable>

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

          <View className="flex-1" style={{ minWidth: 0 }}>
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
                  {selectedProvider.city}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-1.5" style={{ gap: 8 }}>
              <View className="flex-row items-center" style={{ gap: 2 }}>
                <Feather name="star" size={10} color="#f59e0b" />
                <Text className="text-[11px] font-sans-extrabold text-gray-800">
                  {selectedProvider.avg_rating.toFixed(1)}
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

      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCategoryModalOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setIsCategoryModalOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-t-2xl p-4 gap-y-3"
            style={{ paddingBottom: Math.max(insets.bottom, 16), maxHeight: '65%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
              <Text className="text-base font-sans-extrabold text-gray-900">{t('services.filterByCategory')}</Text>
              <Pressable
                onPress={() => setIsCategoryModalOpen(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
              >
                <Feather name="x" size={18} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView className="max-h-[320px]">
              {/* 'All' Option */}
              <Pressable
                onPress={() => {
                  setSelectedCategorySlugStore(undefined);
                  setIsCategoryModalOpen(false);
                }}
                accessibilityRole="button"
                className={`flex-row items-center justify-between p-3 rounded-xl mb-1.5 border active:opacity-85 ${
                  !selectedCategorySlug ? 'bg-primary/5 border-primary' : 'bg-white border-gray-100'
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="grid" size={16} color={!selectedCategorySlug ? '#485aff' : '#64748b'} />
                  <Text
                    className={`text-sm font-sans-bold ${!selectedCategorySlug ? 'text-primary' : 'text-gray-800'}`}
                  >
                    {t('common.all')}
                  </Text>
                </View>
                {!selectedCategorySlug && <Feather name="check" size={16} color="#485aff" />}
              </Pressable>

              {/* Dynamic Categories */}
              {categoriesData?.data?.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => {
                      setSelectedCategorySlugStore(isSelected ? undefined : cat.slug);
                      setIsCategoryModalOpen(false);
                    }}
                    accessibilityRole="button"
                    className={`flex-row items-center justify-between p-3 rounded-xl mb-1.5 border active:opacity-85 ${
                      isSelected ? 'bg-primary/5 border-primary' : 'bg-white border-gray-100'
                    }`}
                  >
                    <Text className={`text-sm font-sans-bold ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                      {cat.name}
                    </Text>
                    {isSelected && <Feather name="check" size={16} color="#485aff" />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

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
