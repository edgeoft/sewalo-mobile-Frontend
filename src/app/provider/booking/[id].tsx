import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import ProviderBookingDetailsScreen from '@/features/provider/screens/ProviderBookingDetailsScreen';
import { PROVIDER_BOOKINGS_MOCK } from '@/features/provider/constants/providerBookings';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';

export default function ProviderBookingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const booking = PROVIDER_BOOKINGS_MOCK.find((b) => b.id === id) || PROVIDER_BOOKINGS_MOCK[0];

  if (!booking) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="menu" showBackButton={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Feather name="alert-triangle" size={30} color="#ef4444" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">Booking Not Found</Text>
          <Button title="Go Back" variant="primary" onPress={() => router.back()} className="w-full max-w-[200px]" />
        </View>
      </View>
    );
  }

  return <ProviderBookingDetailsScreen booking={booking} />;
}
