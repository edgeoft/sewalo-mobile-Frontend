import { useTranslation } from 'react-i18next';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import ProviderDetailsScreen from '@/features/services/screens/ProviderDetailsScreen';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { useGetProviderDetailsQuery, useGetProviderRatingsQuery } from '@/api';
import {
  type ProviderDetail,
  type ProviderDetailsResponse,
  type ReviewItem,
  type Rating,
  type ServiceOffering,
  type UserProfile,
  USER_STATUSES,
} from '@/types';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';

function mapRatingToReviewItem(rating: Rating): ReviewItem {
  return {
    id: rating.id,
    customerName: rating.user?.name || 'Customer',
    customerAvatar: getImageUrl(rating.user?.avatar) || FALLBACKS.avatar,
    rating: rating.rate,
    date: rating.created_at,
    comment: rating.review,
  };
}

export default function DynamicProviderDetailRoute() {
  const { t } = useTranslation();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const providerSlug = slug || '';

  const { data: apiData, isLoading: isLoadingProvider } = useGetProviderDetailsQuery(providerSlug, {
    enabled: isLoggedIn && Boolean(providerSlug),
  });

  const providerId = apiData?.provider?.id || '';
  const { data: ratingsData } = useGetProviderRatingsQuery(providerId, {
    enabled: isLoggedIn && Boolean(providerId),
  });

  if (!isLoggedIn) {
    return <Redirect href={ROUTES.auth.signin} />;
  }

  if (isLoadingProvider) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  const mapApiToProviderDetail = (data: ProviderDetailsResponse, reviews: ReviewItem[]): ProviderDetail | null => {
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

    const getStartingPrice = (serviceOfferings: ServiceOffering[] | undefined) => {
      if (!serviceOfferings || serviceOfferings.length === 0) return t('home.na');
      const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
      if (prices.length === 0) return t('home.na');
      const minPrice = Math.min(...prices);
      return formatPriceInNepali(minPrice);
    };

    const formatLocation = (prov: UserProfile | null | undefined) => {
      if (!prov) return t('home.nepal');
      const city = prov.city;
      const address = prov.address;
      if (city && address) return `${address}, ${city}`;
      return city || address || t('home.nepal');
    };

    const offeringsMap = new Map<string, string>();
    firstService?.service_offerings?.forEach((o: ServiceOffering) => {
      if (o.sub_category?.name) {
        if (o.id) offeringsMap.set(o.id, o.sub_category.name);
        if (o.sub_category_id) offeringsMap.set(o.sub_category_id, o.sub_category.name);
        if (o.sub_category?.id) offeringsMap.set(o.sub_category.id, o.sub_category.name);
      }
    });

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const resolveInclusion = (item: string): string => {
      if (!item) return '';
      if (offeringsMap.has(item)) {
        return offeringsMap.get(item)!;
      }
      if (isUuid(item)) {
        return firstService?.category?.name || t('services.service');
      }
      return item;
    };

    const pkg = firstService?.service_packages?.[0];
    const specialPackage = pkg
      ? {
          title: pkg.name,
          description: pkg.description || '',
          inclusions: pkg.services_offered?.map(resolveInclusion).filter(Boolean) || [],
          price: `Rs. ${pkg.price}`,
          durationLabel: `${pkg.duration} ${pkg.duration_unit || t('services.days')}`,
        }
      : null;

    const individualServices =
      firstService?.service_offerings?.map((o: ServiceOffering) => ({
        id: o.id,
        title: o.sub_category?.name || t('services.serviceOffering'),
        category: firstService?.category?.name || t('services.services'),
        price: `Rs. ${o.price}`,
        durationLabel: `${o.duration} ${o.duration_unit || t('services.hrs')}`,
      })) || [];

    const portfolio =
      firstService?.portfolio?.map((uri: string, idx: number) => ({
        id: `port-${idx}`,
        uri: getImageUrl(uri) || FALLBACKS.image,
        title: t('services.project', { number: idx + 1 }),
      })) || [];

    const providerRating =
      provider.average_rating || provider.avg_rating?.toString() || firstService?.average_rating || '0';
    const providerReviewCount = provider.total_ratings || firstService?.total_ratings || reviews.length || 0;

    return {
      id: provider.id,
      serviceId: firstService?.id,
      isFavourite: firstService?.is_favourite || false,
      name: provider.name,
      avatarUri: getAvatarUri(provider.avatar),
      isVerified: provider.status === USER_STATUSES.Verified,
      serviceLabel: firstService?.category?.name || t('services.services'),
      location: formatLocation(provider),
      fullLocation: provider.address ? `${provider.address}, ${provider.city || ''}` : provider.city || t('home.nepal'),
      rating: Number(providerRating).toFixed(1),
      reviewCount: providerReviewCount,
      startingPrice: getStartingPrice(firstService?.service_offerings),
      ordersCompleted: `${providerReviewCount} ${t('home.orders')}`,
      specialPackagesCount: firstService?.service_packages?.length || 0,
      availability: provider.availability || t('services.always'),
      availabilityLabel: provider.availability || t('services.always'),
      workingHours:
        provider.start_time && provider.end_time
          ? `${provider.start_time} - ${provider.end_time}`
          : t('services.defaultWorkingHours'),
      phone: provider.phone || '',
      email: provider.email || '',
      bio: provider.description || firstService?.description || t('services.noBio'),
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
        return t('services.experiencedProfessional');
      })(),
      education: provider.education || [],
      experienceList: provider.experience || [],
      certificates: provider.certificates || [],
      specialPackage,
      individualServices,
      portfolio,
      reviews,
    };
  };

  const reviews: ReviewItem[] = ratingsData?.data?.map(mapRatingToReviewItem) || [];
  const realProvider = apiData ? mapApiToProviderDetail(apiData, reviews) : null;

  if (!realProvider) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="language" showBackButton={true} includeBottomBorder={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Feather name="alert-triangle" size={30} color="#ef4444" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">
            {t('services.providerNotFound')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center mb-6">
            {t('services.providerNotFoundDesc')}
          </Text>
          <Button
            title={t('common.goBack')}
            variant="primary"
            onPress={() => router.back()}
            className="w-full max-w-[200px]"
          />
        </View>
      </View>
    );
  }

  return <ProviderDetailsScreen provider={realProvider} />;
}
