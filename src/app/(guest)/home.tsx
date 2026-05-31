import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { DEFAULT_HOME_SERVICE_CATEGORIES, HomeServiceCategoriesSection } from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';

export default function GuestHomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-secondary">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <HomeTopSection variant="guest" />

        <ContentLayout>
          <HomeServiceCategoriesSection
            title="Service Categories"
            actionLabel="View All"
            categories={DEFAULT_HOME_SERVICE_CATEGORIES}
            onActionPress={() => router.push(ROUTES.guest.findServices)}
            onCategoryPress={() => router.push(ROUTES.guest.findServices)}
          />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
