import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import {
  useCategoriesQuery,
  useGetBookingsQuery,
  useGetFeaturedBlogQuery,
  prefetchCategories,
  prefetchSubCategories,
} from '@/api';
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
import { formatDate, parseTime12h, formatTime } from '@/utils/time';

export default function CustomerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: categoriesData, isLoading: isCategoriesLoading } = useCategoriesQuery('homepage');
  const { data: bookingsData, isLoading: isBookingsLoading } = useGetBookingsQuery({ page: 1, limit: 5 });
  const { data: featuredBlogData, isLoading: isBlogLoading } = useGetFeaturedBlogQuery();

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
      const formattedDate = formatDate(b.service_date);
      const formattedTime = parseTime12h(b.start_time) || formatTime(b.start_time);
      const dateTime = [formattedDate, formattedTime].filter(Boolean).join(', ');

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
        dateTime: dateTime || undefined,
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
          {(showCategories || isCategoriesLoading) && (
            <HomeServiceCategoriesSection
              title={t('home.serviceCategories')}
              actionLabel={t('common.viewAll')}
              categories={categories || []}
              isLoading={isCategoriesLoading}
              onActionPress={() => {
                prefetchCategories(queryClient);
                router.push(ROUTES.customer.findServices);
              }}
              onCategoryPress={(cat) => {
                if (cat.slug) {
                  prefetchSubCategories(queryClient, cat.slug);
                }
                router.push(`${ROUTES.customer.findServices}?category=${cat.slug}`);
              }}
            />
          )}

          <RecentBookingsSection
            title={t('home.recentBookings')}
            actionLabel={t('common.viewAll')}
            bookings={bookings}
            isLoading={isBookingsLoading}
            onActionPress={() => router.push(ROUTES.customer.bookings)}
            onBookingPress={(booking) => router.push(ROUTES.customer.bookingDetail(booking.id))}
            onExplorePress={() => router.push(ROUTES.customer.findServices)}
          />

          {(featuredBlog || isBlogLoading) && (
            <HomeArticleSection
              title={t('home.insightsAndTips')}
              category={featuredBlog?.category?.name || t('home.growth')}
              readTime={getReadTime(featuredBlog?.description)}
              articleTitle={featuredBlog?.title}
              articleDescription={cleanDescriptionText(featuredBlog?.subtitle || featuredBlog?.description)}
              isLoading={isBlogLoading}
              onPress={() => featuredBlog?.slug && router.push(ROUTES.blog.detail(featuredBlog.slug))}
              onViewAllPress={() => router.push(ROUTES.blog.list)}
            />
          )}
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
