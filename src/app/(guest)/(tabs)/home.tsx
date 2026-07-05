import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useCategoriesQuery, useGetFeaturedBlogQuery, useGetServicesQuery } from '@/api';
import {
  HomeArticleSection,
  HomePromotionBanner,
  HomeServiceCategoriesSection,
  PopularProvidersSection,
} from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';

export default function GuestHomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: categoriesData } = useCategoriesQuery('homepage');
  const { data: servicesData } = useGetServicesQuery({ limit: 5 });
  const { data: featuredBlogData } = useGetFeaturedBlogQuery();

  const categories = useMemo(() => {
    if (!categoriesData?.data) return null;
    return categoriesData.data.map((cat) => ({
      imageUrl: cat.img,
      label: cat.name,
      slug: cat.slug,
    }));
  }, [categoriesData]);

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
        <DashboardTopBar isScrolled={isScrolled} scrollYAnimated={scrollYAnimated} showNotifications={false} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <HomeTopSection variant="guest" categories={categoriesData?.data} />

        <ContentLayout>
          {showCategories && (
            <HomeServiceCategoriesSection
              title={t('home.serviceCategories')}
              actionLabel={t('common.viewAll')}
              categories={categories!}
              onActionPress={() => router.push(ROUTES.guest.findServices)}
              onCategoryPress={(cat) => router.push(`${ROUTES.guest.findServices}?category=${cat.slug}`)}
            />
          )}

          {servicesData?.data && servicesData.data.length > 0 && (
            <PopularProvidersSection
              title={t('home.availableServices')}
              actionLabel={t('common.viewAll')}
              services={servicesData.data}
              isGuest={true}
              onActionPress={() => router.push(ROUTES.guest.findServices)}
              onProviderPress={(service) =>
                router.push(ROUTES.providerDetail(service.provider?.slug || service.provider?.id || service.id))
              }
            />
          )}

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

          <HomePromotionBanner onPress={() => router.push(ROUTES.guest.findServices)} />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
