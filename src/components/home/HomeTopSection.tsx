import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation, Trans } from 'react-i18next';

import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { USER_ROLES, type Category, type DashboardStats } from '@/types';
import HomeTopSectionBackground from './HomeTopSectionBackground';
import HomeTopSectionSearchBar from './HomeTopSectionSearchBar';

type HomeTopSectionVariant = 'guest' | 'customer' | 'provider';

interface HomeTopSectionProps {
  variant: HomeTopSectionVariant;
  stats?: DashboardStats;
  categories?: Category[];
}

export default function HomeTopSection({ variant, stats }: HomeTopSectionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name ? user.name.trim().split(' ')[0] || '' : '';

  const heroCopyByVariant = {
    guest: {
      backgroundHeight: 155,
      title: (
        <Trans i18nKey="home.welcomeGuest">
          Welcome to <Text className="text-primary font-sans-bold">Sewalo</Text>
        </Trans>
      ),
      subtitle: t('home.guestHeroSubtitle'),
      searchPlaceholder: t('home.guestSearchPlaceholder'),
    },
    customer: {
      backgroundHeight: 155,
      title: firstName ? (
        <Trans i18nKey="home.welcomeBackUser" values={{ name: firstName }}>
          Welcome back, <Text className="text-primary font-sans-bold">{firstName}</Text>
        </Trans>
      ) : (
        <Text className="text-gray-900 font-sans-bold">{t('home.welcomeBack')}</Text>
      ),
      subtitle: t('home.customerHeroSubtitle'),
      searchPlaceholder: t('home.customerSearchPlaceholder'),
    },
    provider: {
      backgroundHeight: 200,
      title: firstName ? (
        <Trans i18nKey="home.welcomeBackUser" values={{ name: firstName }}>
          Welcome back, <Text className="text-primary font-sans-bold">{firstName}</Text>
        </Trans>
      ) : (
        <Text className="text-gray-900 font-sans-bold">{t('home.welcomeBack')}</Text>
      ),
      subtitle: t('home.providerHeroSubtitle'),
      searchPlaceholder: '',
    },
  };

  const handleSearchPress = () => {
    router.push(variant === USER_ROLES.Customer ? ROUTES.customer.findServices : ROUTES.guest.findServices);
  };

  const heroCopy = heroCopyByVariant[variant];
  const displayStats = stats || {
    pendingOrders: 3,
    completedOrders: 142,
    avgRating: 4.9,
    completionRate: '98%',
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  return (
    <ContentLayout className="overflow-hidden bg-surface-brand-subtle">
      <HomeTopSectionBackground height={heroCopy.backgroundHeight} />

      <View className="gap-y-3 pb-2">
        {/* Spacer to reserve room for absolute/sticky DashboardTopBar */}
        <View style={{ height: 56 + Math.max(insets.top, 6) }} />

        {/* Hero Header */}
        <View className="pt-0.5 pb-0.5">
          <Text numberOfLines={1} className="text-xl font-sans-bold text-gray-900 tracking-tight">
            {heroCopy.title}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-xs font-sans-medium text-gray-500">
            {heroCopy.subtitle}
          </Text>
        </View>

        {variant === USER_ROLES.Provider ? (
          <View className="flex-row flex-wrap justify-between gap-3 mt-2">
            {/* Pending Orders */}
            <View
              className="w-[47%] bg-white rounded-xl border border-gray-100 p-3.5 flex-row items-center gap-3"
              style={cardShadow}
            >
              <View className="h-10 w-10 rounded-xl bg-amber-50 items-center justify-center">
                <Feather name="clock" size={18} color="#d97706" />
              </View>
              <View>
                <Text className="text-lg font-sans-bold text-gray-900">{displayStats.pendingOrders}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">{t('home.pending')}</Text>
              </View>
            </View>

            {/* Avg Rating */}
            <View
              className="w-[47%] bg-white rounded-xl border border-gray-100 p-3.5 flex-row items-center gap-3"
              style={cardShadow}
            >
              <View className="h-10 w-10 rounded-xl bg-yellow-50 items-center justify-center">
                <Feather name="star" size={18} color="#b45309" />
              </View>
              <View>
                <Text className="text-lg font-sans-bold text-gray-900">{displayStats.avgRating}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">{t('home.avgRating')}</Text>
              </View>
            </View>

            {/* Completed Orders */}
            <View
              className="w-[47%] bg-white rounded-xl border border-gray-100 p-3.5 flex-row items-center gap-3"
              style={cardShadow}
            >
              <View className="h-10 w-10 rounded-xl bg-emerald-50 items-center justify-center">
                <Feather name="check-circle" size={18} color="#059669" />
              </View>
              <View>
                <Text className="text-lg font-sans-bold text-gray-900">{displayStats.completedOrders}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">{t('home.completed')}</Text>
              </View>
            </View>

            {/* Completion Rate */}
            <View
              className="w-[47%] bg-white rounded-xl border border-gray-100 p-3.5 flex-row items-center gap-3"
              style={cardShadow}
            >
              <View className="h-10 w-10 rounded-xl bg-blue-50 items-center justify-center">
                <Feather name="trending-up" size={18} color="#2563eb" />
              </View>
              <View>
                <Text className="text-lg font-sans-bold text-gray-900">{displayStats.completionRate}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">{t('home.completion')}</Text>
              </View>
            </View>
          </View>
        ) : (
          <HomeTopSectionSearchBar placeholder={heroCopy.searchPlaceholder} onPress={handleSearchPress} />
        )}
      </View>
    </ContentLayout>
  );
}
