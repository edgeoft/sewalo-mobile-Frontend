import { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ProviderCard, SectionHeader } from '@/components/common';
import { Carousel } from '@/components/ui';
import { getAvatarUrl } from '@/utils/image';
import { getStartingPrice } from '@/utils/currency';
import { formatProviderLocation } from '@/utils/location';
import { formatProviderSchedule, getProviderAvailabilityBadge } from '@/features/services/utils/providerAvailability';
import { USER_STATUSES } from '@/constants/roles';
import type { Service } from '@/types';

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
  const { t } = useTranslation();

  const renderItem = useCallback(
    ({ item: service, cardWidth }: { item: Service; cardWidth: number }) => (
      <ProviderCard
        avatarUri={getAvatarUrl(service.provider?.avatar)}
        name={service.provider?.name || 'Service Provider'}
        isVerified={
          service.provider?.status === USER_STATUSES.Verified || Boolean(service.provider?.profile_verified_at)
        }
        serviceLabel={service.category?.name || 'Service'}
        location={formatProviderLocation(service.provider)}
        rating={Number(service.average_rating || 0).toFixed(1)}
        reviewsCount={service.total_ratings}
        ordersCompleted={t('services.ordersCompletedCount', { count: service.total_ratings || 0 })}
        startingFromPrice={getStartingPrice(service.service_offerings)}
        schedule={formatProviderSchedule(service.provider, t)}
        availabilityStatus={getProviderAvailabilityBadge(service.provider, t)}
        width={cardWidth}
        isGuest={isGuest}
        onPress={() => onProviderPress?.(service)}
      />
    ),
    [isGuest, onProviderPress, t],
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
