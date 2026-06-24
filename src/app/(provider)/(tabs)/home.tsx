import { useRouter } from 'expo-router';
import { ScrollView, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { HomeArticleSection, HomeTopSection, RecentOrdersSection, PerformanceMetricsSection } from '@/components/home';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';
import { useProviderDashboardQuery, useUpdateBooking } from '@/api';

export default function ProviderHomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: dashboardData, isLoading, refetch, isRefetching } = useProviderDashboardQuery();
  const updateBooking = useUpdateBooking();

  const handleAcceptOrder = (id: string) => {
    updateBooking.mutate(
      { id, data: { status: 'confirmed' } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['provider-dashboard-stats'] });
        },
      },
    );
  };

  const handleDeclineOrder = (id: string) => {
    updateBooking.mutate(
      {
        id,
        data: { status: 'rejected', cancellation_reason: 'Provider declined the booking request.' },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['provider-dashboard-stats'] });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#485aff" />}
      >
        <HomeTopSection variant="provider" stats={dashboardData?.stats} />

        <ContentLayout>
          <RecentOrdersSection
            title="Recent Orders"
            actionLabel="View All"
            orders={dashboardData?.recentBookings || []}
            onActionPress={() => router.push(ROUTES.provider.bookings)}
            onOrderPress={(order) => router.push(ROUTES.provider.bookingDetail(order.id))}
            onAcceptOrder={handleAcceptOrder}
            onDeclineOrder={handleDeclineOrder}
          />

          <PerformanceMetricsSection
            title="Performance Insights"
            actionLabel="View Analytics"
            metrics={dashboardData?.metrics}
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
