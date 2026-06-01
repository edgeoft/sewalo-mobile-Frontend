import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import {
  DEFAULT_HOME_SERVICE_CATEGORIES,
  DEFAULT_POPULAR_PROVIDERS,
  HomeServiceCategoriesSection,
  PopularProvidersSection,
  HomeArticleSection,
  HomePromotionBanner,
} from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';

export default function GuestHomeScreen() {
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  return (
    <View className="flex-1 bg-secondary">
      {/* Sticky Header absolutely positioned */}
      <View className="absolute top-0 left-0 right-0 z-50 px-6">
        <DashboardTopBar isScrolled={isScrolled} scrollYAnimated={scrollYAnimated} showNotifications={false} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <HomeTopSection variant="guest" />

        <ContentLayout>
          <HomeServiceCategoriesSection
            title="Service Categories"
            actionLabel="View All"
            categories={DEFAULT_HOME_SERVICE_CATEGORIES}
            onActionPress={() => router.push(ROUTES.guest.findServices)}
            onCategoryPress={() => router.push(ROUTES.guest.findServices)}
          />

          <PopularProvidersSection
            title="Popular providers"
            actionLabel="View All"
            providers={DEFAULT_POPULAR_PROVIDERS}
            onActionPress={() => router.push(ROUTES.guest.findServices)}
            onProviderPress={(provider) => router.push(ROUTES.providerDetail(provider.id))}
          />

          <HomeArticleSection onPress={() => router.push(ROUTES.guest.beProvider)} />

          <HomePromotionBanner onPress={() => router.push(ROUTES.guest.findServices)} />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
