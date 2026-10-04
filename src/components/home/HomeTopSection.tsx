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

const DEFAULT_STATS: DashboardStats = {
  pendingOrders: 3,
  completedOrders: 142,
  avgRating: 4.9,
  completionRate: '98%',
};

const CARD_SHADOW = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 0,
};

const STAT_CONFIG = [
  {
    key: 'pendingOrders' as const,
    icon: 'clock' as const,
    iconBg: 'bg-amber-50',
    iconColor: '#d97706',
    labelKey: 'home.pending',
  },
  {
    key: 'avgRating' as const,
    icon: 'star' as const,
    iconBg: 'bg-yellow-50',
    iconColor: '#b45309',
    labelKey: 'home.avgRating',
  },
  {
    key: 'completedOrders' as const,
    icon: 'check-circle' as const,
    iconBg: 'bg-emerald-50',
    iconColor: '#059669',
    labelKey: 'home.completed',
  },
  {
    key: 'completionRate' as const,
    icon: 'trending-up' as const,
    iconBg: 'bg-blue-50',
    iconColor: '#2563eb',
    labelKey: 'home.completion',
  },
];

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
        <Text className="text-foreground font-sans-bold">{t('home.welcomeBack')}</Text>
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
        <Text className="text-foreground font-sans-bold">{t('home.welcomeBack')}</Text>
      ),
      subtitle: t('home.providerHeroSubtitle'),
      searchPlaceholder: '',
    },
  };

  const handleSearchPress = () => {
    router.push(variant === USER_ROLES.Customer ? ROUTES.customer.findServices : ROUTES.guest.findServices);
  };

  const heroCopy = heroCopyByVariant[variant];
  const displayStats = stats || DEFAULT_STATS;

  return (
    <ContentLayout className="overflow-hidden bg-surface-brand-subtle">
      <HomeTopSectionBackground height={heroCopy.backgroundHeight} />

      <View className="gap-y-3 pb-2">
        {/* Spacer to reserve room for absolute/sticky DashboardTopBar */}
        <View style={{ height: 56 + Math.max(insets.top, 6) }} />

        {/* Hero Header */}
        <View className="pt-0.5 pb-0.5">
          <Text numberOfLines={1} className="text-xl font-sans-bold text-foreground tracking-tight">
            {heroCopy.title}
          </Text>
          <Text numberOfLines={1} className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
            {heroCopy.subtitle}
          </Text>
        </View>

        {variant === USER_ROLES.Provider ? (
          <View className="flex-row flex-wrap justify-between gap-3 mt-2">
            {STAT_CONFIG.map((item) => (
              <View
                key={item.key}
                className="flex-1 min-w-[140px] bg-card rounded-xl border border-border p-3.5 flex-row items-center gap-3"
                style={CARD_SHADOW}
              >
                <View className={`h-10 w-10 rounded-xl ${item.iconBg} items-center justify-center`}>
                  <Feather name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View>
                  <Text className="text-lg font-sans-bold text-foreground">{displayStats[item.key]}</Text>
                  <Text className="text-[11px] font-sans-medium text-muted-foreground">{t(item.labelKey)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <HomeTopSectionSearchBar placeholder={heroCopy.searchPlaceholder} onPress={handleSearchPress} />
        )}
      </View>
    </ContentLayout>
  );
}
