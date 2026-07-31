import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation, Trans } from 'react-i18next';

import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES, type Category } from '@/types';
import HomeTopSectionBackground from './HomeTopSectionBackground';
import HomeTopSectionSearchBar from './HomeTopSectionSearchBar';
import HomeTopSectionServiceChip from './HomeTopSectionServiceChip';

type HomeTopSectionVariant = 'guest' | 'customer' | 'provider';

interface HomeTopSectionProps {
  variant: HomeTopSectionVariant;
  stats?: {
    pendingOrders: number;
    completedOrders: number;
    avgRating: number;
    completionRate: string;
  };
  categories?: Category[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function HomeTopSection({ variant, stats, categories }: HomeTopSectionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const heroCopyByVariant = {
    guest: {
      backgroundHeight: 286,
      title: (
        <Trans i18nKey="home.guestHeroTitle">
          Find <Text className="text-primary">trusted</Text>
          {'\n'}professionals near you
        </Trans>
      ),
      subtitle: t('home.guestHeroSubtitle'),
      searchPlaceholder: t('home.guestSearchPlaceholder'),
    },
    customer: {
      backgroundHeight: 188,
      title: t('home.customerHeroTitle'),
      subtitle: t('home.customerHeroSubtitle'),
      searchPlaceholder: t('home.customerSearchPlaceholder'),
    },
    provider: {
      backgroundHeight: 220,
      title: t('home.providerHeroTitle'),
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
    <ContentLayout className="overflow-hidden bg-[#f7f9ff]">
      <HomeTopSectionBackground height={heroCopy.backgroundHeight} />

      <View className="gap-y-4 pb-2">
        {/* Spacer to reserve room for absolute/sticky DashboardTopBar */}
        <View style={{ height: 56 + Math.max(insets.top, 6) }} />

        <View>
          <Text className="max-w-62 text-[33px] font-sans-extrabold leading-9.5 tracking-tight text-gray-900">
            {heroCopy.title}
          </Text>
          <Text className="mt-3 max-w-71.5 text-[15px] font-sans-medium leading-5.5 text-gray-500">
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
          <>
            <HomeTopSectionSearchBar placeholder={heroCopy.searchPlaceholder} onPress={handleSearchPress} />

            {categories && categories.length >= 2 && (
              <View className="flex-row flex-wrap gap-2 pt-1">
                {pickRandom(categories, 2).map((cat) => (
                  <HomeTopSectionServiceChip
                    key={cat.slug}
                    label={cat.name}
                    onPress={() =>
                      router.push(
                        `${variant === USER_ROLES.Customer ? ROUTES.customer.findServices : ROUTES.guest.findServices}?category=${cat.slug}`,
                      )
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ContentLayout>
  );
}
