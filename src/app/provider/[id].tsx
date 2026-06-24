import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import ProviderDetailsScreen from '@/features/services/screens/ProviderDetailsScreen';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { useGetProviderDetailsQuery } from '@/api';
import { ProviderDetail, ProviderDetailsResponse } from '@/types';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';

export default function DynamicProviderDetailRoute() {
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const providerSlug = slug || '';

  // Fetch real provider details from API using slug
  const { data: apiData, isLoading } = useGetProviderDetailsQuery(providerSlug, {
    enabled: isLoggedIn,
  });

  if (!isLoggedIn) {
    return <Redirect href={ROUTES.auth.signin} />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  const mapApiToProviderDetail = (data: ProviderDetailsResponse): ProviderDetail | null => {
    if (!data || !data.provider) return null;
    const { provider, services } = data;
    const firstService = services?.[0];

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

    const formatLocation = (prov: any) => {
      if (!prov) return 'Nepal';
      const city = prov.city;
      const address = prov.address;
      if (city && address) return `${address}, ${city}`;
      return city || address || 'Nepal';
    };

    const pkg = firstService?.service_packages?.[0];
    const specialPackage = pkg
      ? {
          title: pkg.name,
          description: pkg.description || '',
          inclusions: pkg.services_offered || [],
          price: `Rs. ${pkg.price}`,
          durationLabel: `${pkg.duration} ${pkg.duration_unit || 'Days'}`,
        }
      : null;

    const individualServices =
      firstService?.service_offerings?.map((o: any) => ({
        id: o.id,
        title: o.sub_category?.name || 'Service Offering',
        category: firstService?.category?.name || 'Services',
        price: `Rs. ${o.price}`,
        durationLabel: `${o.duration} ${o.duration_unit || 'hrs'}`,
      })) || [];

    const portfolio =
      firstService?.portfolio?.map((uri: string, idx: number) => ({
        id: `port-${idx}`,
        uri: getAvatarUri(uri),
        title: `Project ${idx + 1}`,
      })) || [];

    return {
      id: provider.id,
      serviceId: firstService?.id,
      isFavourite: firstService?.is_favourite || false,
      name: provider.name,
      avatarUri: getAvatarUri(provider.avatar),
      isVerified: provider.status === 'verified',
      serviceLabel: firstService?.category?.name || 'Services',
      location: formatLocation(provider),
      fullLocation: provider.address ? `${provider.address}, ${provider.city || ''}` : provider.city || 'Nepal',
      rating: Number(firstService?.average_rating || provider.avg_rating || 0).toFixed(1),
      reviewCount: firstService?.total_ratings || provider.profile_views || 0,
      startingPrice: getStartingPrice(firstService?.service_offerings),
      ordersCompleted: `${firstService?.total_ratings || 0} orders`,
      specialPackagesCount: firstService?.service_packages?.length || 0,
      availability: provider.availability || 'Always',
      availabilityLabel: provider.availability || 'Always',
      workingHours:
        provider.start_time && provider.end_time
          ? `${provider.start_time} - ${provider.end_time}`
          : '09:00 AM - 05:00 PM',
      phone: provider.phone || '',
      email: provider.email || '',
      bio: provider.description || firstService?.description || 'No bio or description provided by the provider.',
      languages: Array.isArray(provider.language)
        ? provider.language
        : typeof provider.language === 'string'
          ? (provider.language as string)
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
      skills: firstService?.tags
        ? Array.isArray(firstService.tags)
          ? firstService.tags
          : typeof firstService.tags === 'string'
            ? (firstService.tags as string)
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : []
        : [],
      experience: (() => {
        if (provider.experience && Array.isArray(provider.experience) && provider.experience.length > 0) {
          const firstExp = provider.experience[0];
          const title = firstExp.title || '';
          const company = firstExp.company_name || '';
          if (title && company) return `${title} at ${company}`;
          return title || company || '';
        }
        if (typeof provider.experience === 'string' && provider.experience) {
          return provider.experience;
        }
        return 'Experienced Professional';
      })(),
      education: provider.education || [],
      experienceList: provider.experience || [],
      certificates: provider.certificates || [],
      specialPackage,
      individualServices,
      portfolio,
      reviews: [],
    };
  };

  const realProvider = apiData ? mapApiToProviderDetail(apiData) : null;

  if (!realProvider) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="language" showBackButton={true} includeBottomBorder={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Feather name="alert-triangle" size={30} color="#ef4444" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">Provider Not Found</Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center mb-6">
            The provider you are looking for does not exist or has been deactivated.
          </Text>
          <Button title="Go Back" variant="primary" onPress={() => router.back()} className="w-full max-w-[200px]" />
        </View>
      </View>
    );
  }

  return <ProviderDetailsScreen provider={realProvider} />;
}
