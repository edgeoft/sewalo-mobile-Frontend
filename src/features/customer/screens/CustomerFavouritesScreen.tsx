import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadMoreList, ProviderCard, SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { CUSTOMER_FAVOURITES_MOCK } from '../constants/customerFavourites';
import { ROUTES } from '@/constants/routes';

export default function CustomerFavouritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push('/notifications')} />

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
              onPress={() => {
                const providerId = item.name.toLowerCase().replace(' ', '-');
                router.push(ROUTES.providerDetail(providerId));
              }}
            />
          )}
        />

        <View className="h-3" />
      </ContentLayout>
    </View>
  );
}
