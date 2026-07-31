import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES, USER_STATUSES } from '@/types';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function CustomerLayout() {
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
    return <Redirect href={ROUTES.auth.signin} />;
  }

  if (user?.status === USER_STATUSES.Pending) {
    return <Redirect href={{ pathname: ROUTES.auth.gettingStarted, params: { role, phone: user.phone } }} />;
  }

  if (role !== USER_ROLES.Customer) {
    return <Redirect href={role === USER_ROLES.Provider ? ROUTES.provider.home : ROUTES.auth.signin} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
