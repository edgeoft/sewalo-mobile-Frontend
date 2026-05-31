import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { DEFAULT_HOME_SERVICE_CATEGORIES, HomeServiceCategoriesSection } from '@/components/home';
import HomeTopSection from '@/components/home/HomeTopSection';
import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';

export default function CustomerHomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-secondary">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <HomeTopSection variant="customer" />

        <ContentLayout>
          <HomeServiceCategoriesSection
            title="Service Categories"
            actionLabel="View All"
            categories={DEFAULT_HOME_SERVICE_CATEGORIES}
            onActionPress={() => router.push(ROUTES.customer.findServices)}
            onCategoryPress={() => router.push(ROUTES.customer.findServices)}
          />
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
