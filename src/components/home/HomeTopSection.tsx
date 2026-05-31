import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';
import HomeTopSectionBackground from './HomeTopSectionBackground';
import HomeTopSectionSearchBar from './HomeTopSectionSearchBar';
import HomeTopSectionServiceChip from './HomeTopSectionServiceChip';

type HomeTopSectionVariant = 'guest' | 'customer';

interface HomeTopSectionProps {
  variant: HomeTopSectionVariant;
}

const serviceChips = ['Plumbing', 'Cleaning', 'Design'];

const heroCopyByVariant = {
  guest: {
    backgroundHeight: 286,
    title: (
      <>
        Find <Text className="text-primary">trusted</Text>
        {'\n'}professionals near you
      </>
    ),
    subtitle: 'Book verified service providers in minutes.',
    searchPlaceholder: 'What services are you looking for today?',
  },
  customer: {
    backgroundHeight: 188,
    title: 'Your next booking starts here',
    subtitle: 'Find trusted professionals, compare options, and book the right fit for your home needs.',
    searchPlaceholder: 'Search services or providers for your next task',
  },
};

export default function HomeTopSection({ variant }: HomeTopSectionProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSearchPress = () => {
    router.push(variant === 'customer' ? ROUTES.customer.findServices : ROUTES.guest.findServices);
  };

  const heroCopy = heroCopyByVariant[variant];

  return (
    <ContentLayout className="overflow-hidden bg-[#f7f9ff]">
      <HomeTopSectionBackground height={heroCopy.backgroundHeight} />

      <View className="gap-y-4 pb-4">
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

        <HomeTopSectionSearchBar placeholder={heroCopy.searchPlaceholder} onPress={handleSearchPress} />

        <View className="flex-row flex-wrap gap-2 pt-1">
          {serviceChips.map((chip) => (
            <HomeTopSectionServiceChip key={chip} label={chip} />
          ))}
        </View>
      </View>
    </ContentLayout>
  );
}
