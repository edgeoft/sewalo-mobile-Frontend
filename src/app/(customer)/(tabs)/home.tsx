import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { HomeServiceCategoriesSection, RecentBookingsSection } from '@/components/home';
import { CUSTOMER_BOOKINGS_MOCK } from '@/features/customer/constants/customerBookings';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import DashboardTopBar from '@/components/navigation/DashboardTopBar';
import { ROUTES } from '@/constants/routes';
import { useScroll } from '@/hooks/useScroll';
import { useCategoriesQuery } from '@/api/categories';
import { useMemo } from 'react';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { isScrolled, scrollYAnimated, handleScroll } = useScroll({ threshold: 10 });

  const { data: categoriesData } = useCategoriesQuery('homepage');

  const categories = useMemo(() => {
    if (!categoriesData?.data) return null;
    return categoriesData.data.map((cat) => ({
      imageUrl: cat.img,
      label: cat.name,
      slug: cat.slug,
    }));
  }, [categoriesData]);

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
              title="Service Categories"
              actionLabel="View All"
              categories={categories!}
              onActionPress={() => router.push(ROUTES.customer.findServices)}
              onCategoryPress={(cat) => router.push(`${ROUTES.customer.findServices}?category=${cat.slug}`)}
            />
          )}

          <RecentBookingsSection
            title="Recent Bookings"
            actionLabel="View All"
            bookings={CUSTOMER_BOOKINGS_MOCK}
            onActionPress={() => router.push(ROUTES.customer.bookings)}
            onBookingPress={() => router.push(ROUTES.customer.bookings)}
          />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
