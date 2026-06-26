import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';

import ProviderBookingDetailsScreen from '@/features/provider/screens/ProviderBookingDetailsScreen';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { useGetBookingByIdQuery } from '@/api';

export default function ProviderBookingDetailRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: booking, isLoading } = useGetBookingByIdQuery(id || '');

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="menu" showBackButton={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Feather name="alert-triangle" size={30} color="#ef4444" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">{t('errors.screenNotFound')}</Text>
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

  return <ProviderBookingDetailsScreen booking={booking} />;
}
