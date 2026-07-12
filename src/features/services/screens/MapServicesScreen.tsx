import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetCategoriesQuery, useGetServicesQuery } from '@/api';
import NearbyServicesMap from '@/components/map/NearbyServicesMap';
import Header from '@/components/navigation/Header';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import Input from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import ServiceFilterModal from '../components/ServiceFilterModal';
import CategoryScrollSelector from '../components/CategoryScrollSelector';

import { Service } from '@/types/services';

const MOCK_PROVIDERS_DATA = [
  {
    id: 'mock-provider-1',
    name: 'John Smith',
    categoryName: 'Beauty & Wellness',
    categorySlug: 'beauty-wellness',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    rating: '4.8',
    totalRatings: 24,
    startingPrice: '1500',
    offset: { lat: 0.005, lng: -0.004 },
  },
  {
    id: 'mock-provider-2',
    name: 'Sarah Connor',
    categoryName: 'Cleaning',
    categorySlug: 'cleaning',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
    rating: '4.9',
    totalRatings: 42,
    startingPrice: '800',
    offset: { lat: -0.003, lng: 0.006 },
  },
  {
    id: 'mock-provider-3',
    name: 'David Miller',
    categoryName: 'Plumbing',
    categorySlug: 'plumbing',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    rating: '4.7',
    totalRatings: 18,
    startingPrice: '1200',
    offset: { lat: 0.002, lng: 0.003 },
  },
];

const generateMockServices = (centerLat: number, centerLng: number, categories: any[]): Service[] => {
  return MOCK_PROVIDERS_DATA.map((p, idx) => {
    const category = categories?.find((c) => c.slug === p.categorySlug) || {
      id: `cat-${idx}`,
      name: p.categoryName,
      slug: p.categorySlug,
      icon: null,
    };

    return {
      id: p.id,
      name: `${category.name} Service by ${p.name}`,
      description: `Professional ${category.name.toLowerCase()} service details and portfolio.`,
      category_id: category.id,
      provider_id: `prov-${p.id}`,
      category: category,
      provider: {
        id: `prov-${p.id}`,
        name: p.name,
        email: `${p.name.toLowerCase().replace(' ', '')}@example.com`,
        phone: '9800000000',
        slug: p.name.toLowerCase().replace(' ', '-'),
        role: 'provider',
        status: 'verified',
        avatar: p.avatar,
        city: 'Kathmandu',
        state: 'Bagmati',
        country: 'Nepal',
        address: 'Baneshwor',
        dob: '1990-01-01',
        loyalty_points: 100,
        phone_verified_at: new Date().toISOString(),
        email_verified_at: new Date().toISOString(),
        description: 'Experienced service professional.',
        education: null,
        experience: null,
        document: null,
        coordinates: {
          lat: centerLat + p.offset.lat,
          lng: centerLng + p.offset.lng,
        },
        availability: 'always',
        availability_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        start_time: '09:00',
        end_time: '18:00',
        profile_views: 120,
        avg_rating: Number(p.rating),
        average_rating: p.rating,
        total_ratings: p.totalRatings,
        profile_verified_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        certificates: null,
        language: ['English', 'Nepali'],
      },
      currency: 'NPR',
      average_rating: p.rating,
      total_ratings: p.totalRatings,
      portfolio: [],
      portfolio_url: '',
      service_location: ['fixed_location', 'customer_location'],
      tags: [category.slug],
      has_service_packages: false,
      service_offerings: [
        {
          id: `offering-${p.id}`,
          service_id: p.id,
          sub_category_id: 'subcat-1',
          price: p.startingPrice,
          duration: 60,
          duration_unit: 'minutes',
          sub_category: {
            id: 'subcat-1',
            category_id: category.id,
            name: category.name,
            slug: category.slug,
          },
        },
      ],
      service_packages: [],
    };
  });
};

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

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // Fetch Services
  const { isLoading: isLoadingServices } = useGetServicesQuery({
    search: debouncedSearch || undefined,
    category: selectedCategorySlug || undefined,
    min_price: appliedFilters.minPrice ? Number(appliedFilters.minPrice) : undefined,
    max_price: appliedFilters.maxPrice ? Number(appliedFilters.maxPrice) : undefined,
    min_rating: appliedFilters.minRating ? Number(appliedFilters.minRating) : undefined,
    service_location: appliedFilters.serviceLocation || undefined,
    limit: 50,
  });

  // Filter & Mock Coordinates if they are null, and inject mock data
  const servicesWithCoordinates = useMemo(() => {
    const mockServices = generateMockServices(userLocation.lat, userLocation.lng, categoriesData?.data || []);

    const allServices = mockServices;

    let filteredServices = allServices;

    if (selectedCategorySlug) {
      filteredServices = filteredServices.filter((s) => s.category?.slug === selectedCategorySlug);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      filteredServices = filteredServices.filter(
        (s) =>
          s.provider?.name?.toLowerCase().includes(q) ||
          s.category?.name?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q),
      );
    }

    if (appliedFilters.minPrice) {
      const min = Number(appliedFilters.minPrice);
      filteredServices = filteredServices.filter((s) => {
        const prices = s.service_offerings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
        return prices.length > 0 && Math.min(...prices) >= min;
      });
    }

    if (appliedFilters.maxPrice) {
      const max = Number(appliedFilters.maxPrice);
      filteredServices = filteredServices.filter((s) => {
        const prices = s.service_offerings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
        return prices.length > 0 && Math.min(...prices) <= max;
      });
    }

    if (appliedFilters.minRating) {
      const rating = Number(appliedFilters.minRating);
      filteredServices = filteredServices.filter((s) => Number(s.average_rating || 0) >= rating);
    }

    return filteredServices;
  }, [userLocation, categoriesData, selectedCategorySlug, debouncedSearch, appliedFilters]);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return servicesWithCoordinates.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId, servicesWithCoordinates]);

  const [hasAutoselected, setHasAutoselected] = useState(false);

  useEffect(() => {
    if (servicesWithCoordinates.length > 0 && !selectedServiceId && !hasAutoselected) {
      const firstId = servicesWithCoordinates[0].id;
      setTimeout(() => {
        setSelectedServiceId(firstId);
        setHasAutoselected(true);
      }, 0);
    }
  }, [servicesWithCoordinates, selectedServiceId, hasAutoselected]);

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
    const minP = Math.min(...prices);
    return formatPriceInNepali(minP);
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
          {isLoadingServices ? (
            <View className="flex-1 items-center justify-center bg-gray-150">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : (
            <NearbyServicesMap
              userLat={userLocation.lat}
              userLng={userLocation.lng}
              services={servicesWithCoordinates}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
            />
          )}

          {/* Floating Details Preview Card */}
          {selectedService && (
            <Pressable
              onPress={() => handleProviderPress(selectedService.provider?.slug || selectedService.provider?.id || '')}
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
                  setSelectedServiceId(null);
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
                  source={{ uri: getImageUrl(selectedService.provider?.avatar) || FALLBACKS.avatar }}
                  style={{ width: '100%', height: '100%', borderRadius: 20 }}
                  className="bg-gray-100"
                  resizeMode="cover"
                />
              </View>

              {/* Info section */}
              <View className="flex-1" style={{ minWidth: 0 }}>
                {/* Name + category inline */}
                <View className="flex-row items-center" style={{ gap: 5 }}>
                  <Feather name="user" size={11} color="#485aff" />
                  <Text
                    className="text-[13px] font-sans-extrabold text-gray-900"
                    numberOfLines={1}
                    style={{ flexShrink: 1 }}
                  >
                    {selectedService.provider?.name || 'Provider'}
                  </Text>
                  <View className="bg-primary/10 px-1.5 py-px rounded">
                    <Text className="text-[9px] font-sans-bold text-primary uppercase tracking-wide">
                      {selectedService.category?.name || 'Service'}
                    </Text>
                  </View>
                </View>

                {/* Rating + Price row */}
                <View className="flex-row items-center mt-1.5" style={{ gap: 8 }}>
                  <View className="flex-row items-center" style={{ gap: 2 }}>
                    <Feather name="star" size={10} color="#f59e0b" />
                    <Text className="text-[11px] font-sans-extrabold text-gray-800">
                      {isNaN(Number(selectedService.average_rating))
                        ? '0.0'
                        : Number(selectedService.average_rating).toFixed(1)}
                    </Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400">
                      ({selectedService.total_ratings || 0})
                    </Text>
                  </View>
                  <Text className="text-[11px] font-sans-bold text-gray-300">|</Text>
                  <Text className="text-[11px] font-sans-bold text-gray-700">
                    Starting: {getStartingPrice(selectedService.service_offerings)}
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
