import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { HomeArticleSection, HomeTopSection, RecentOrdersSection, PerformanceMetricsSection } from '@/components/home';
import { PROVIDER_BOOKINGS_MOCK } from '@/features/provider/constants/providerBookings';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';

export default function ProviderHomeScreen() {
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  return (
    <View className="flex-1 bg-secondary">
      {/* Sticky Header absolutely positioned */}
      <View className="absolute top-0 left-0 right-0 z-50 px-6">
        <DashboardTopBar
          isScrolled={isScrolled}
          scrollYAnimated={scrollYAnimated}
          showNotifications={true}
          showNotificationBadge
          onNotificationsPress={() => router.push(ROUTES.notifications)}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <HomeTopSection variant="provider" />

        <ContentLayout>
          <RecentOrdersSection
            title="Recent Orders"
            actionLabel="View All"
            orders={PROVIDER_BOOKINGS_MOCK}
            onActionPress={() => router.push(ROUTES.provider.bookings)}
            onOrderPress={() => router.push(ROUTES.provider.bookings)}
          />

          <PerformanceMetricsSection
            title="Performance Insights"
            actionLabel="View Analytics"
            onActionPress={() => router.push(ROUTES.provider.earnings)}
          />

          <HomeArticleSection
            title="Insights & Tips"
            category="Growth"
            readTime="4 min read"
            articleTitle="How to Get More Bookings on Sewalo: Tips for New Service Providers"
            articleDescription="If you're new to Sewalo, your first goal should be to stand out. Here are practical ways to optimize your profile and attract customers."
            onPress={() => router.push(ROUTES.provider.account)}
          />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
