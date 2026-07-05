import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';

import {
  useGetFeaturedBlogQuery,
  useGetMyServicesQuery,
  useGetProfileQuery,
  useProviderDashboardQuery,
  useUpdateBooking,
} from '@/api';
import { HomeArticleSection, HomeTopSection, PerformanceMetricsSection, RecentOrdersSection } from '@/components/home';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { useSnackbar } from '@/components/ui/Snackbar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import { useMemo } from 'react';

export default function ProviderHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: dashboardData, isLoading, refetch, isRefetching } = useProviderDashboardQuery();
  const { data: featuredBlogData } = useGetFeaturedBlogQuery();
  const { data: myServicesData } = useGetMyServicesQuery();
  const { data: profileData } = useGetProfileQuery();
  const updateBooking = useUpdateBooking();
  const { showSnackbar } = useSnackbar();

  const hasService = !!myServicesData?.data?.id;
  const providerName = profileData?.user?.name || '';

  const handleAcceptOrder = (id: string) => {
    updateBooking.mutate(
      { id, data: { status: 'confirmed' } },
      {
        onSuccess: () => {
          showSnackbar({ message: t('home.bookingAccepted'), type: 'success' });
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
          showSnackbar({ message: t('home.bookingDeclined'), type: 'success' });
          queryClient.invalidateQueries({ queryKey: ['provider-dashboard-stats'] });
        },
      },
    );
  };

  const recentOrders = useMemo(() => {
    return (
      dashboardData?.recentBookings?.map((order) => ({
        ...order,
        customerAvatar: getImageUrl(order.customerAvatar) || FALLBACKS.avatar,
      })) ?? []
    );
  }, [dashboardData?.recentBookings]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  const featuredBlog = featuredBlogData?.data;

  const getReadTime = (description: string) => {
    const words = description.split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 200));
    return `${time} min read`;
  };

  const cleanDescriptionText = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
  };

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
            title={t('home.recentOrders')}
            actionLabel={t('common.viewAll')}
            orders={recentOrders}
            onActionPress={() => router.push(ROUTES.provider.bookings)}
            onOrderPress={(order) => router.push(ROUTES.provider.bookingDetail(order.id))}
            onAcceptOrder={handleAcceptOrder}
            onDeclineOrder={handleDeclineOrder}
            hasService={hasService}
            providerName={providerName}
            onCreateServicePress={() => router.push({ pathname: ROUTES.provider.serviceEdit, params: { mode: 'add' } })}
          />

          <PerformanceMetricsSection
            title={t('home.performanceInsights')}
            actionLabel={t('home.viewAnalytics')}
            metrics={dashboardData?.metrics}
            onActionPress={() => router.push(ROUTES.provider.earnings)}
          />

          {featuredBlog && (
            <HomeArticleSection
              title={t('home.insightsAndTips')}
              category={featuredBlog.category?.name || t('home.growth')}
              readTime={getReadTime(featuredBlog.description)}
              articleTitle={featuredBlog.title}
              articleDescription={cleanDescriptionText(featuredBlog.subtitle || featuredBlog.description)}
              onPress={() => router.push(ROUTES.blog.detail(featuredBlog.slug))}
              onViewAllPress={() => router.push(ROUTES.blog.list)}
            />
          )}
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
