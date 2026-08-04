import { useCallback } from 'react';
import { View } from 'react-native';

import { ProviderCard, SectionHeader } from '@/components/common';
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
  const renderItem = useCallback(
    ({ item: service, cardWidth }: { item: Service; cardWidth: number }) => (
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
    ),
    [isGuest, onProviderPress],
  );

  return (
    <View className="pt-5">
      <SectionHeader title={title} actionLabel={actionLabel} onActionPress={onActionPress} className="mb-5" />

      <Carousel
        data={services}
        keyExtractor={(service) => service.id}
        gap={16}
        autoplay={true}
        autoplayInterval={10000}
        renderItem={renderItem}
      />
    </View>
  );
}
