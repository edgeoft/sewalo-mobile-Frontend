import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { HomeServiceCategoriesSection, RecentBookingsSection, HomeArticleSection } from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';
import { useCategoriesQuery, useGetMyBookingsQuery, useGetFeaturedBlogQuery } from '@/api';
import { useMemo } from 'react';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import type { UserProfile } from '@/types';

export default function CustomerHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: categoriesData } = useCategoriesQuery('homepage');
  const { data: bookingsData } = useGetMyBookingsQuery({ limit: 5 });
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

      const getAvatarUri = (avatar: string | null | undefined) => {
        return getImageUrl(avatar) || FALLBACKS.avatar;
      };

      const formatLocation = (prov: UserProfile | null | undefined) => {
        if (!prov) return t('home.nepal');
        const city = prov.city;
        const address = prov.address;
        if (city && address) return `${address}, ${city}`;
        return city || address || t('home.nepal');
      };

      const bookedPrice = b.invoice?.total ? `Rs. ${parseFloat(b.invoice.total).toFixed(0)}` : t('home.na');

      return {
        id: b.id,
        avatarUri: getAvatarUri(provider?.avatar),
        name: provider?.name || t('home.provider'),
        serviceLabel: service?.category?.name || t('home.service'),
        location: formatLocation(provider),
        ordersCompleted: service ? `${service.total_ratings || 0} ${t('home.ordersCompleted')}` : '',
        rating: provider?.avg_rating?.toString() || '0',
        bookedPrice,
        status: b.status,
      };
    });
  }, [bookingsData]);

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

  const showCategories = categories && categories.length > 0;

  return (
    <View className="flex-1 bg-secondary">
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

          {bookings.length > 0 && (
            <RecentBookingsSection
              title={t('home.recentBookings')}
              actionLabel={t('common.viewAll')}
              bookings={bookings}
              onActionPress={() => router.push(ROUTES.customer.bookings)}
              onBookingPress={() => router.push(ROUTES.customer.bookings)}
            />
          )}

          {featuredBlog && (
            <HomeArticleSection
              title={t('home.insightsAndTips')}
              category={featuredBlog.category?.name || t('home.growth')}
              readTime={getReadTime(featuredBlog.description)}
              articleTitle={featuredBlog.title}
              articleDescription={cleanDescriptionText(featuredBlog.subtitle || featuredBlog.description)}
              onPress={() => router.push(ROUTES.blog.detail(featuredBlog.slug) as any)}
              onViewAllPress={() => router.push(ROUTES.blog.list)}
            />
          )}
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
