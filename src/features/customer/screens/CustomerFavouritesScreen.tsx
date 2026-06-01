import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { createRoleDrawerConfig } from '@/components/navigation/RoleDrawerConfig';
import SideDrawer from '@/components/navigation/SideDrawer';
import { CUSTOMER_FAVOURITES_MOCK } from '../constants/customerFavourites';

export default function CustomerFavouritesScreen() {
  const { i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const drawerConfig = createRoleDrawerConfig({
    currentLanguage: i18n.language || 'en',
    onLanguageChange: (code) => i18n.changeLanguage(code),
    onLogout: () => setDrawerVisible(false),
  });

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" onMenuPress={() => setDrawerVisible(true)} showNotifications />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="My Favourites"
          description="View your saved providers and services."
          className="mb-5"
          titleClassName="text-2xl"
        />

        <LoadMoreList
          data={CUSTOMER_FAVOURITES_MOCK}
          keyExtractor={(item) => item.id}
          initialVisibleCount={4}
          pageSize={4}
          loadMoreLabel="Load More Favourites"
          endReachedLabel="No more favourites"
          renderItem={(item) => (
            <ProviderCard
              avatarUri={item.avatarUri}
              name={item.name}
              serviceLabel={item.serviceLabel}
              location={item.location}
              ordersCompleted={item.ordersCompleted}
              rating={item.rating}
              startingFromPrice={item.startingFromPrice}
              actionLabel="View Details"
              variant="details"
            />
          )}
        />

        <View className="h-3" />
      </ContentLayout>

      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Menu"
        sections={drawerConfig.sections}
        footerAction={drawerConfig.footerAction}
      />
    </View>
  );
}
