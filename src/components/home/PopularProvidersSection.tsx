import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { ProviderCard } from '@/components/common';
import { Carousel } from '@/components/ui';
import { FALLBACKS, getImageUrl } from '@/utils/image';
import type { Service, ServiceOffering, UserProfile } from '@/types';

const getAvatarUri = (avatar: string | null | undefined) => {
  return getImageUrl(avatar) || FALLBACKS.avatar;
};

const formatPriceInNepali = (price: number) => {
  return `Rs. ${Number(price).toLocaleString('en-NP', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const getStartingPrice = (serviceOfferings: ServiceOffering[]) => {
  if (!serviceOfferings || serviceOfferings.length === 0) return 'N/A';
  const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
  if (prices.length === 0) return 'N/A';
  const minPrice = Math.min(...prices);
  return formatPriceInNepali(minPrice);
};

const formatLocation = (provider: UserProfile | null | undefined) => {
  if (!provider) return 'Nepal';
  const city = provider.city;
  const address = provider.address;
  if (city && address) return `${address}, ${city}`;
  return city || address || 'Nepal';
};

export interface PopularProvidersSectionProps {
  title: string;
  actionLabel: string;
  services: Service[];
  isGuest?: boolean;
  onActionPress?: () => void;
  onProviderPress?: (service: Service) => void;
}

export default function PopularProvidersSection({
  title,
  actionLabel,
  services,
  isGuest = false,
  onActionPress,
  onProviderPress,
}: PopularProvidersSectionProps) {
  return (
    <View className="pt-5">
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
        data={services}
        keyExtractor={(service) => service.id}
        gap={16}
        autoplay={true}
        autoplayInterval={10000}
        renderItem={({ item: service, cardWidth }) => (
          <ProviderCard
            avatarUri={getAvatarUri(service.provider?.avatar)}
            name={service.provider?.name || 'Service Provider'}
            serviceLabel={service.category?.name || 'Service'}
            location={formatLocation(service.provider)}
            rating={Number(service.average_rating || 0).toFixed(1)}
            ordersCompleted={`${service.total_ratings || 0} orders`}
            startingFromPrice={getStartingPrice(service.service_offerings)}
            width={cardWidth}
            isGuest={isGuest}
            onPress={() => onProviderPress?.(service)}
          />
        )}
      />
    </View>
  );
}
