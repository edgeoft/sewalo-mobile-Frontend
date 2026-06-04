import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

import BookingDetailsScreen from '@/features/customer/screens/BookingDetailsScreen';
import { CUSTOMER_BOOKINGS_MOCK } from '@/features/customer/constants/customerBookings';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';

export default function DynamicBookingDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const booking = CUSTOMER_BOOKINGS_MOCK.find((b) => b.id === id);

  if (!booking) {
    return (
      <View className="flex-1 bg-secondary">
        <Header variant="language" showBackButton={true} includeBottomBorder={true} />
        <View className="flex-1 items-center justify-center p-6">
          <View className="h-16 w-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <Feather name="alert-triangle" size={30} color="#ef4444" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-950 text-center mb-2">Booking Not Found</Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center mb-6">
            The booking you are looking for does not exist or has been removed.
          </Text>
          <Button title="Go Back" variant="primary" onPress={() => router.back()} className="w-full max-w-[200px]" />
        </View>
      </View>
    );
  }

  return <BookingDetailsScreen booking={booking} />;
}
