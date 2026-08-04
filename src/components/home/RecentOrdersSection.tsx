import React from 'react';
import { useTranslation } from 'react-i18next';
import { Share, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { EmptyStateCard, SectionHeader } from '@/components/common';
import ProviderOrderCard from './ProviderOrderCard';
import type { ProviderBookingItem } from '@/features/provider/constants/providerBookings';
import { THEME_COLORS } from '@/constants/colors';

export interface RecentOrdersSectionProps {
  title: string;
  actionLabel?: string;
  orders: ProviderBookingItem[];
  onActionPress?: () => void;
  onOrderPress?: (order: ProviderBookingItem) => void;
  onAcceptOrder?: (id: string) => void;
  onDeclineOrder?: (id: string) => void;
  hasService?: boolean;
  providerName?: string;
  onCreateServicePress?: () => void;
}

export default function RecentOrdersSection({
  title,
  actionLabel,
  orders,
  onActionPress,
  onOrderPress,
  onAcceptOrder,
  onDeclineOrder,
  hasService = false,
  providerName = '',
  onCreateServicePress,
}: RecentOrdersSectionProps) {
  const { t } = useTranslation();

  const handleShareProfile = async () => {
    try {
      const shareName = providerName || t('home.serviceProvider');
      await Share.share({
        message: `${shareName} ${t('home.shareProfileDesc')} https://sewalo.com`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View className="pt-5">
      <SectionHeader
        title={title}
        actionLabel={orders.length > 0 ? actionLabel : undefined}
        onActionPress={onActionPress}
        className="mb-5"
      />

      {orders.length > 0 ? (
        <View className="gap-4">
          {orders.slice(0, 2).map((order) => (
            <ProviderOrderCard
              key={order.id}
              order={order}
              onPress={() => onOrderPress?.(order)}
              onAccept={onAcceptOrder}
              onDecline={onDeclineOrder}
            />
          ))}
        </View>
      ) : !hasService ? (
        <EmptyStateCard
          title={t('home.createFirstService')}
          description={t('home.createFirstServiceDesc')}
          buttonTitle={t('home.createService')}
          onButtonPress={onCreateServicePress}
          icon={
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Rect x="20" y="15" width="80" height="60" rx="12" fill={THEME_COLORS.surfaceIndigoSubtle} />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              <Rect x="35" y="32" width="50" height="8" rx="4" fill={THEME_COLORS.primary} opacity={0.15} />
              <Rect x="35" y="44" width="35" height="8" rx="4" fill={THEME_COLORS.primary} opacity={0.15} />
              <Circle cx="80" cy="54" r="14" fill={THEME_COLORS.primary} />
              <Path
                d="M80 48v12M74 54h12"
                stroke={THEME_COLORS.primaryForeground}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </Svg>
          }
        />
      ) : (
        <EmptyStateCard
          title={t('home.boostYourBookings')}
          description={t('home.shareProfileDesc')}
          buttonTitle={t('home.shareProfile')}
          onButtonPress={handleShareProfile}
          icon={
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Rect x="20" y="15" width="80" height="60" rx="12" fill="#f0fdf4" />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              <Circle cx="45" cy="46" r="12" fill="#d1fae5" />
              <Rect x="63" y="40" width="22" height="4" rx="2" fill="#d1fae5" />
              <Rect x="63" y="48" width="16" height="4" rx="2" fill="#d1fae5" />
              <Circle cx="85" cy="30" r="12" fill={THEME_COLORS.emeraldSuccess} />
              <Path
                d="M81 30h8 M85 26v8"
                stroke={THEME_COLORS.primaryForeground}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          }
        />
      )}
    </View>
  );
}
