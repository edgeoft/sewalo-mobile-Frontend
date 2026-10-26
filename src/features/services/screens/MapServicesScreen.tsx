import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';
import { useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetCategoriesQuery, useGetNearbyProvidersQuery } from '@/api';
import NearbyServicesMap from '@/components/map/NearbyServicesMap';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { ROUTES } from '@/constants/routes';
import { useAuthUser } from '@/providers/AuthProvider';
import { useServiceFiltersStore } from '@/store/useServiceFiltersStore';
import { useServiceFilters } from '@/hooks/useServiceFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useShallow } from 'zustand/react/shallow';
import ErrorState from '@/components/ui/ErrorState';
import LoadingState from '@/components/ui/LoadingState';
import type { MapViewport } from '@/types';
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
  const currentUser = useAuthUser();

  const userLocation = useMemo(() => {
    if (currentUser?.coordinates) {
      return {
        lat: currentUser.coordinates.lat,
        lng: currentUser.coordinates.lng,
      };
    }
    return { lat: 27.700769, lng: 85.30014 };
  }, [currentUser]);

  const { searchQuery, selectedCategorySlug, setSelectedCategorySlugStore } = useServiceFiltersStore(
    useShallow((s) => ({
      searchQuery: s.searchQuery,
      selectedCategorySlug: s.selectedCategorySlug,
      setSelectedCategorySlugStore: s.setSelectedCategorySlug,
    })),
  );
  const {
    minPriceStore,
    maxPriceStore,
    minRatingStore,
    serviceLocationStore,
    radiusStore,
    sortByStore,
    isFilterModalOpen,
    setIsFilterModalOpen,
    minPrice,
    maxPrice,
    minRating,
    serviceLocation,
    radius,
    sortBy,
    setRadius,
    setMinPrice,
    setMaxPrice,
    setMinRating,
    setServiceLocation,
    setSortBy,
    handleApplyFilters,
    handleResetFilters,
    activeFiltersCount,
  } = useServiceFilters();

  const debouncedSearch = useDebouncedValue(searchQuery, 300);
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

  const bufferedBounds = useMemo(() => {
    if (!debouncedViewport.bounds) return null;
    return addBoundingBoxBuffer(debouncedViewport.bounds.sw, debouncedViewport.bounds.ne, 0.25);
  }, [debouncedViewport.bounds]);

  const { data: categoriesData } = useGetCategoriesQuery();

  const {
    data: providersData,
    isLoading: isLoadingProviders,
    isError: isProvidersError,
    refetch: refetchProviders,
  } = useGetNearbyProvidersQuery({
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
    sort_by: sortByStore,
  });

  const providers = useMemo(() => {
    const list = providersData?.data || [];
    if (!currentUser?.id) return list;
    return list.filter(
      (p) => p.id !== currentUser.id && (p as { provider_id?: string }).provider_id !== currentUser.id,
    );
  }, [providersData, currentUser]);

  const activeProviderId = selectedProviderId ?? providers[0]?.id ?? null;

  const selectedProvider = useMemo(() => {
    if (!activeProviderId) return null;
    return providers.find((p) => p.id === activeProviderId) || null;
  }, [activeProviderId, providers]);

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
          <LoadingState className="flex-1 items-center justify-center bg-gray-150" />
        ) : isProvidersError ? (
          <ErrorState onRetry={() => refetchProviders()} className="m-4" />
        ) : (
          <NearbyServicesMap
            userLat={userLocation.lat}
            userLng={userLocation.lng}
            providers={providers}
            selectedProviderId={activeProviderId}
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
            <Feather
              name="grid"
              size={14}
              color={selectedCategorySlug ? THEME_COLORS.primaryForeground : THEME_COLORS.primary}
              accessible={false}
            />
            <Text
              className={`text-xs font-sans-bold ${selectedCategorySlug ? 'text-white' : 'text-gray-800'}`}
              numberOfLines={1}
            >
              {currentCategoryName}
            </Text>
            <Feather
              name="chevron-down"
              size={12}
              color={selectedCategorySlug ? THEME_COLORS.primaryForeground : THEME_COLORS.slate500}
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
              color={activeFiltersCount > 0 ? THEME_COLORS.primaryForeground : THEME_COLORS.primary}
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
          <Feather name="list" size={15} color={THEME_COLORS.primary} accessible={false} />
        </Pressable>
      </View>

      {selectedProvider && (
        <Pressable
          onPress={() => handleProviderPress(selectedProvider.slug || selectedProvider.id)}
          accessibilityRole="button"
          style={{ bottom: Math.max(insets.bottom, 12) }}
          className="absolute left-3.5 right-3.5 bg-card rounded-xl py-3 pl-3 pr-3.5 flex-row items-center border border-border z-30 active:opacity-95"
        >
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setSelectedProviderId(null);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            hitSlop={8}
            className="absolute -top-2 -right-1 z-10 bg-card w-[22px] h-[22px] rounded-full items-center justify-center border border-border active:opacity-60"
          >
            <Feather name="x" size={10} color={THEME_COLORS.slate500} accessible={false} />
          </Pressable>

          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 2,
              borderColor: THEME_COLORS.primary,
              padding: 1.5,
              marginRight: 12,
            }}
          >
            <Image
              source={{ uri: getImageUrl(selectedProvider.avatar) || FALLBACKS.avatar }}
              style={{ width: 38, height: 38, borderRadius: 19 }}
              className="bg-gray-100"
              contentFit="cover"
              transition={150}
              cachePolicy="memory-disk"
            />
          </View>

          <View className="flex-1" style={{ minWidth: 0 }}>
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <Feather name="user" size={11} color={THEME_COLORS.primary} />
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
                <Feather name="star" size={10} color={THEME_COLORS.amberStar} />
                <Text className="text-[11px] font-sans-extrabold text-gray-800">
                  {selectedProvider.avg_rating.toFixed(1)}
                </Text>
              </View>
              <Text className="text-[11px] font-sans-bold text-gray-300">|</Text>
              <Feather name="map-pin" size={10} color={THEME_COLORS.slate500} />
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
              backgroundColor: THEME_COLORS.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 6,
            }}
          >
            <Feather name="chevron-right" size={16} color={THEME_COLORS.primaryForeground} />
          </View>
        </Pressable>
      )}

      {/* Category Selection Modal */}
      <Modal
        visible={isCategoryModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCategoryModalOpen(false)}
        accessibilityViewIsModal={true}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
          onPress={() => setIsCategoryModalOpen(false)}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
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
                <Feather name="x" size={18} color={THEME_COLORS.slate500} />
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
                  <Feather
                    name="grid"
                    size={16}
                    color={!selectedCategorySlug ? THEME_COLORS.primary : THEME_COLORS.slate500}
                  />
                  <Text
                    className={`text-sm font-sans-bold ${!selectedCategorySlug ? 'text-primary' : 'text-gray-800'}`}
                  >
                    {t('common.all')}
                  </Text>
                </View>
                {!selectedCategorySlug && <Feather name="check" size={16} color={THEME_COLORS.primary} />}
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
                    {isSelected && <Feather name="check" size={16} color={THEME_COLORS.primary} />}
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
        sortBy={sortBy}
        setSortBy={setSortBy}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );
}
