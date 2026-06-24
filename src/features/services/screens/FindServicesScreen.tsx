import { Feather } from '@expo/vector-icons';
import { useRouter, useSegments, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useEffect } from 'react';
import { Pressable, Text, View, ScrollView, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useGetCategoriesQuery, useGetServicesQuery, useAddRemoveFavorite } from '@/api';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { useSnackbar } from '@/components/ui/Snackbar';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import ProviderCard from '@/components/common/ProviderCard';

export default function FindServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const isGuest = segments.includes('(guest)');
  const { showError } = useErrorDialog();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const selectedCategorySlug = categoryParam || undefined;

  // Filters Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');

  // Active filters applied to query
  const [appliedFilters, setAppliedFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    serviceLocation: '',
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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
        title: 'Authentication Required',
        message: 'Please sign in or create an account to view service provider details and book their services.',
        actions: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
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
        title: 'Authentication Required',
        message: 'Please sign in or create an account to save services to your favourites.',
        actions: [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
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
            Find Services
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
            Find and book professional service providers near you.
          </Text>
        </View>

        {/* Search Bar & Filters Button */}
        <View className="flex-row items-center gap-2 mb-6">
          <View className="flex-1">
            <Input
              placeholder="What services are you looking for?"
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
        </View>

        {/* Categories Horizontal Scroll */}
        <View className="mb-6">
          <Text className="text-lg font-sans-bold text-gray-950 mb-3 tracking-tight">Browse by category</Text>

          {isLoadingCategories ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
            >
              <Pressable
                onPress={() => router.replace(isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices)}
                className={`px-4 py-2.5 rounded-full flex-row items-center border ${
                  selectedCategorySlug === undefined ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    selectedCategorySlug === undefined ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  All Services
                </Text>
              </Pressable>

              {categoriesData?.data.map((category) => {
                const isSelected = selectedCategorySlug === category.slug;
                const iconUri = getImageUrl(category.icon);

                return (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      router.replace(
                        `${isGuest ? ROUTES.guest.findServices : ROUTES.customer.findServices}?category=${isSelected ? '' : category.slug}`,
                      )
                    }
                    className={`px-4 py-2.5 rounded-full flex-row items-center border ${
                      isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    {iconUri ? (
                      <Image source={{ uri: iconUri }} className="h-4 w-4 mr-2" resizeMode="contain" />
                    ) : (
                      <Feather
                        name="tag"
                        size={12}
                        color={isSelected ? '#ffffff' : '#485aff'}
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text className={`text-xs font-sans-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Service Providers Listing */}
        <View className="flex-1">
          <Text className="text-lg font-sans-bold text-gray-950 mb-4 tracking-tight">Service Providers</Text>

          {isLoadingServices ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : verifiedServices.length === 0 ? (
            <View className="py-12 items-center justify-center">
              <Feather name="search" size={40} color="#94a3b8" />
              <Text className="text-sm font-sans-semibold text-gray-900 mt-4">No service providers found</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-1 text-center px-6">
                Try adjusting your search terms or filtering by a different category.
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

      {/* Filters slide-up Modal */}
      <Modal visible={isFilterModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 gap-6 max-h-[85%]">
            <View className="flex-row justify-between items-center pb-2 border-b border-gray-100">
              <Text className="text-lg font-sans-bold text-gray-900">Filters</Text>
              <Pressable onPress={() => setIsFilterModalOpen(false)} className="p-1">
                <Feather name="x" size={20} color="#475569" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>
              {/* Price Range */}
              <View className="gap-2">
                <Text className="text-sm font-sans-bold text-gray-800">Price Range</Text>
                <View className="flex-row items-center gap-3">
                  <TextInput
                    placeholder="Min Price"
                    keyboardType="numeric"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50/50"
                  />
                  <Text className="text-gray-400 font-sans-medium">to</Text>
                  <TextInput
                    placeholder="Max Price"
                    keyboardType="numeric"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-gray-50/50"
                  />
                </View>
              </View>

              {/* Minimum Rating */}
              <View className="gap-2">
                <Text className="text-sm font-sans-bold text-gray-800">Minimum Rating</Text>
                <View className="flex-row gap-2">
                  {['1', '2', '3', '4', '5'].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setMinRating(minRating === star ? '' : star)}
                      className={`flex-1 py-2.5 rounded-xl border items-center justify-center flex-row gap-1 ${
                        minRating === star ? 'bg-amber-50 border-amber-400' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-sans-semibold ${
                          minRating === star ? 'text-amber-700' : 'text-gray-600'
                        }`}
                      >
                        {star}
                      </Text>
                      <Feather name="star" size={11} color={minRating === star ? '#eab308' : '#94a3b8'} />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Service Location */}
              <View className="gap-2">
                <Text className="text-sm font-sans-bold text-gray-800">Service Location</Text>
                <View className="gap-2">
                  {[
                    { label: 'Fixed Studio', value: 'fixed_location' },
                    { label: 'At Customer Location', value: 'customer_location' },
                    { label: 'Remote / Online Call', value: 'remote_location' },
                  ].map((loc) => (
                    <Pressable
                      key={loc.value}
                      onPress={() => setServiceLocation(serviceLocation === loc.value ? '' : loc.value)}
                      className={`p-3 rounded-xl border flex-row justify-between items-center ${
                        serviceLocation === loc.value ? 'bg-blue-50/50 border-primary' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-sm font-sans-medium ${
                          serviceLocation === loc.value ? 'text-primary' : 'text-gray-700'
                        }`}
                      >
                        {loc.label}
                      </Text>
                      {serviceLocation === loc.value ? <Feather name="check" size={16} color="#485aff" /> : null}
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="flex-row items-center gap-3 pt-3 border-t border-gray-100">
              <Button title="Reset" variant="outline" onPress={handleResetFilters} className="flex-1" />
              <Button title="Apply Filters" variant="primary" onPress={handleApplyFilters} className="flex-1" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
