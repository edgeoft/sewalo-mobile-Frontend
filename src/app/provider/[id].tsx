import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import ProviderDetailsScreen from '@/features/services/screens/ProviderDetailsScreen';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { useGetProviderDetailsQuery, useGetProviderRatingsQuery } from '@/api';
import { mapApiToProviderDetail, mapRatingToReviewItem } from '@/features/services/utils/providerDetailMapper';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/constants/roles';
import { useAccountActions } from '@/hooks/useAccountActions';

export default function DynamicProviderDetailRoute() {
  const { t } = useTranslation();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentUser = useAuthStore((state) => state.user);
  const { handleSwitchRole, isSwitching } = useAccountActions();
  const providerSlug = slug || '';

  const isOwnSlug = Boolean(
    currentUser &&
    currentUser.role === USER_ROLES.Customer &&
    ((currentUser.slug && (currentUser.slug === providerSlug || currentUser.slug === slug)) ||
      (currentUser.id && (currentUser.id === providerSlug || currentUser.id === slug))),
  );

  const { data: apiData, isLoading: isLoadingProvider } = useGetProviderDetailsQuery(providerSlug, {
    enabled: isLoggedIn && Boolean(providerSlug) && !isOwnSlug,
  });

  const providerId = apiData?.provider?.id || '';
  const { data: ratingsData } = useGetProviderRatingsQuery(providerId, {
    enabled: isLoggedIn && Boolean(providerId),
  });

  const reviews = useMemo(() => ratingsData?.data?.map(mapRatingToReviewItem) || [], [ratingsData]);

  const realProvider = useMemo(
    () => (apiData ? mapApiToProviderDetail(apiData, reviews, t, providerSlug) : null),
    [apiData, reviews, t, providerSlug],
  );

  if (!isLoggedIn) {
    return <Redirect href={ROUTES.auth.signin} />;
  }

  if (isLoadingProvider) {
    return (
      <View className="flex-1 bg-secondary">
        <LoadingState />
      </View>
    );
  }

  const isOwnProfile =
    isOwnSlug ||
    Boolean(
      currentUser &&
      currentUser.role === USER_ROLES.Customer &&
      ((apiData?.provider?.id && apiData.provider.id === currentUser.id) ||
        (apiData?.services?.[0]?.provider_id && apiData.services[0].provider_id === currentUser.id)),
    );

  if (isOwnProfile) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="language" showBackButton={true} includeBottomBorder={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-blue-50 rounded-full items-center justify-center mb-4">
            <Feather name="user" size={30} color="#485aff" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">Your Provider Profile</Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center mb-6 leading-5">
            You are currently in Customer mode. You cannot browse or book your own services. Switch to Provider mode to
            view and manage your profile.
          </Text>
          <View className="w-full max-w-[240px] gap-3">
            <Button
              title="Switch to Provider"
              variant="primary"
              loading={isSwitching}
              onPress={() => handleSwitchRole(USER_ROLES.Provider)}
            />
            <Button title={t('common.goBack')} variant="outline" onPress={() => router.back()} />
          </View>
        </View>
      </View>
    );
  }

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
