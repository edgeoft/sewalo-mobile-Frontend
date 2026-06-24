import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useMemo } from 'react';

import {
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
import { useCategoriesQuery, useGetServicesQuery, useGetFeaturedBlogQuery } from '@/api';
import { getImageUrl } from '@/utils/image';
import type { UserProfile, ServiceOffering } from '@/types';

export default function GuestHomeScreen() {
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

  const providers = useMemo(() => {
    if (!servicesData?.data) return [];
    return servicesData.data.map((s) => {
      const provider = s.provider;

      const getAvatarUri = (avatar: string | null | undefined) => {
        return getImageUrl(avatar) || 'https://i.pravatar.cc/300?img=12';
      };

      const formatLocation = (prov: UserProfile | null | undefined) => {
        if (!prov) return 'Nepal';
        const city = prov.city;
        const address = prov.address;
        if (city && address) return `${address}, ${city}`;
        return city || address || 'Nepal';
      };

      const getStartingPrice = (offerings: ServiceOffering[]) => {
        if (!offerings || offerings.length === 0) return 'N/A';
        const prices = offerings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
        if (prices.length === 0) return 'N/A';
        const minPrice = Math.min(...prices);
        return `Rs. ${minPrice}`;
      };

      return {
        id: provider?.slug || s.id,
        avatarUri: getAvatarUri(provider?.avatar),
        name: provider?.name || 'Provider',
        serviceLabel: s.category?.name || 'Service',
        location: formatLocation(provider),
        ordersCompleted: `${s.total_ratings || 0} Orders Completed`,
        rating: s.average_rating || '0',
        startingFromPrice: getStartingPrice(s.service_offerings),
      };
    });
  }, [servicesData]);

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
              title="Service Categories"
              actionLabel="View All"
              categories={categories!}
              onActionPress={() => router.push(ROUTES.guest.findServices)}
              onCategoryPress={(cat) => router.push(`${ROUTES.guest.findServices}?category=${cat.slug}`)}
            />
          )}

          {providers.length > 0 && (
            <PopularProvidersSection
              title="Available Services"
              actionLabel="View All"
              providers={providers}
              onActionPress={() => router.push(ROUTES.guest.findServices)}
              onProviderPress={(provider) => router.push(ROUTES.providerDetail(provider.id))}
            />
          )}

          {featuredBlog && (
            <HomeArticleSection
              title="Insights & Tips"
              category={featuredBlog.category?.name || 'Growth'}
              readTime={getReadTime(featuredBlog.description)}
              articleTitle={featuredBlog.title}
              articleDescription={cleanDescriptionText(featuredBlog.subtitle || featuredBlog.description)}
              onPress={() => router.push(ROUTES.blog.detail(featuredBlog.slug) as any)}
            />
          )}

          <HomePromotionBanner onPress={() => router.push(ROUTES.guest.findServices)} />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
