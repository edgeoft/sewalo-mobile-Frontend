import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';

export default function ProviderHomeScreen() {
  const router = useRouter();

  return (
    <ContentLayout className="flex-1 bg-secondary">
      <DashboardTopBar showNotifications onNotificationsPress={() => router.push('/notifications')} />

      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-sans-bold text-gray-900">Provider Home Screen</Text>
      </View>
    </ContentLayout>
  );
}
