import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ProviderCard } from '@/components/common';
import { Carousel } from '@/components/ui';

export interface PopularProvider {
  avatarUri: string;
  name: string;
  serviceLabel: string;
  location: string;
  ordersCompleted: string;
  rating: string;
  startingFromPrice: string;
}

export const DEFAULT_POPULAR_PROVIDERS: PopularProvider[] = [
  {
    avatarUri: 'https://i.pravatar.cc/300?img=47',
    name: 'Pepper Potts',
    serviceLabel: 'Design',
    location: 'Sukedhara, Kathmandu',
    ordersCompleted: '2 Orders Completed',
    rating: '4.2',
    startingFromPrice: 'Rs. 2300',
  },
  {
    avatarUri: 'https://i.pravatar.cc/300?img=32',
    name: 'Amina Shrestha',
    serviceLabel: 'Cleaning',
    location: 'Boudha, Kathmandu',
    ordersCompleted: '18 Orders Completed',
    rating: '4.8',
    startingFromPrice: 'Rs. 1800',
  },
  {
    avatarUri: 'https://i.pravatar.cc/300?img=12',
    name: 'Raj Khatri',
    serviceLabel: 'Plumbing',
    location: 'Baneshwor, Kathmandu',
    ordersCompleted: '31 Orders Completed',
    rating: '4.7',
    startingFromPrice: 'Rs. 1500',
  },
  {
    avatarUri: 'https://i.pravatar.cc/300?img=20',
    name: 'Sita Rana',
    serviceLabel: 'Beauty',
    location: 'Lalitpur, Nepal',
    ordersCompleted: '24 Orders Completed',
    rating: '4.6',
    startingFromPrice: 'Rs. 1200',
  },
  {
    avatarUri: 'https://i.pravatar.cc/300?img=8',
    name: 'Nabin Gurung',
    serviceLabel: 'Electrical',
    location: 'Chabahil, Kathmandu',
    ordersCompleted: '14 Orders Completed',
    rating: '4.9',
    startingFromPrice: 'Rs. 2100',
  },
];

export interface PopularProvidersSectionProps {
  title: string;
  actionLabel: string;
  providers: PopularProvider[];
  onActionPress?: () => void;
  onProviderPress?: (provider: PopularProvider) => void;
}

export default function PopularProvidersSection({
  title,
  actionLabel,
  providers,
  onActionPress,
  onProviderPress,
}: PopularProvidersSectionProps) {
  return (
    <View className="pt-8">
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-sans-bold tracking-tight text-gray-900">{title}</Text>

        <Pressable onPress={onActionPress} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <View className="flex-row items-center gap-0.5">
            <Text className="text-[11px] font-sans-medium text-gray-400">{actionLabel}</Text>
            <Feather name="chevron-right" size={13} color="#9ca3af" />
          </View>
        </Pressable>
      </View>

      <Carousel
        data={providers}
        keyExtractor={(provider) => provider.name}
        gap={16}
        autoplay={true}
        autoplayInterval={10000}
        renderItem={({ item: provider, cardWidth }) => (
          <ProviderCard
            avatarUri={provider.avatarUri}
            name={provider.name}
            serviceLabel={provider.serviceLabel}
            location={provider.location}
            ordersCompleted={provider.ordersCompleted}
            rating={provider.rating}
            startingFromPrice={provider.startingFromPrice}
            width={cardWidth}
            onPress={() => onProviderPress?.(provider)}
          />
        )}
      />
    </View>
  );
}
