import { ROUTES } from '@/constants/routes';
import { THEME_COLORS } from '@/constants/colors';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES, USER_STATUSES } from '@/types';
import { Redirect, Stack, usePathname } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const pathname = usePathname();

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  if (isLoggedIn && user) {
    if (user.status === USER_STATUSES.Pending) {
      if (pathname !== ROUTES.auth.gettingStarted) {
        return <Redirect href={{ pathname: ROUTES.auth.gettingStarted, params: { role, phone: user.phone } }} />;
      }
    } else {
      const homeRoute = role === USER_ROLES.Provider ? ROUTES.provider.home : ROUTES.customer.home;
      return <Redirect href={homeRoute} />;
    }
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
