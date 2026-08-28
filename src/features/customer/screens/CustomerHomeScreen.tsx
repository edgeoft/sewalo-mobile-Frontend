import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useCategoriesQuery, useGetBookingsQuery, useGetFeaturedBlogQuery } from '@/api';
import { HomeArticleSection, HomeServiceCategoriesSection, RecentBookingsSection } from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';
import { getAvatarUrl } from '@/utils/image';
import { formatProviderLocation } from '@/utils/location';
import { getProviderRating } from '@/utils/rating';
import { getReadTime, cleanDescriptionText } from '@/utils/text';

export default function CustomerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: categoriesData } = useCategoriesQuery('homepage');
  const { data: bookingsData } = useGetBookingsQuery({ page: 1, limit: 5 });
  const { data: featuredBlogData } = useGetFeaturedBlogQuery();

  const categories = useMemo(() => {
    if (!categoriesData?.data) return null;
    return categoriesData.data.map((cat) => ({
      imageUrl: cat.img,
      label: cat.name,
      slug: cat.slug,
    }));
  }, [categoriesData]);

  const bookings = useMemo(() => {
    if (!bookingsData?.data) return [];
    return bookingsData.data.map((b) => {
      const provider = b.provider;
      const service = b.service;

      const bookedPrice = b.invoice?.total ? `Rs. ${Number(b.invoice.total).toFixed(0)}` : t('home.na');

      return {
        id: b.id,
        avatarUri: getAvatarUrl(provider?.avatar),
        name: provider?.name || t('home.provider'),
        serviceLabel: service?.category?.name || t('home.service'),
        location: formatProviderLocation(provider, t('home.nepal')),
        ordersCompleted: service ? `${service.total_ratings || 0} ${t('home.ordersCompleted')}` : '',
        rating: getProviderRating([provider]).toString(),
        bookedPrice,
        status: b.status,
      };
    });
  }, [bookingsData, t]);

  const featuredBlog = featuredBlogData?.data;
  const showCategories = categories && categories.length > 0;

  return (
    <View className="flex-1 bg-secondary">
      <View className="absolute top-0 left-0 right-0 z-50">
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
        <HomeTopSection variant="customer" categories={categoriesData?.data} />

        <ContentLayout>
          {showCategories && (
            <HomeServiceCategoriesSection
              title={t('home.serviceCategories')}
              actionLabel={t('common.viewAll')}
              categories={categories!}
              onActionPress={() => router.push(ROUTES.customer.findServices)}
              onCategoryPress={(cat) => router.push(`${ROUTES.customer.findServices}?category=${cat.slug}`)}
            />
          )}

          <RecentBookingsSection
            title={t('home.recentBookings')}
            actionLabel={t('common.viewAll')}
            bookings={bookings}
            onActionPress={() => router.push(ROUTES.customer.bookings)}
            onBookingPress={() => router.push(ROUTES.customer.bookings)}
            onExplorePress={() => router.push(ROUTES.customer.findServices)}
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
