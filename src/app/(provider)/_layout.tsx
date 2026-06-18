import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES } from '@/types';
import { ActivityIndicator, View } from 'react-native';

export default function ProviderLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/auth/signin" />;
  }

  if (user?.status === 'pending') {
    return <Redirect href={{ pathname: '/auth/getting-started', params: { role, phone: user.phone } } as any} />;
  }

  if (role !== USER_ROLES.Provider) {
    return <Redirect href={role === USER_ROLES.Customer ? '/(customer)/(tabs)/home' : '/auth/signin'} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
