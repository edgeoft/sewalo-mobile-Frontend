import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, Share } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import ProviderOrderCard from './ProviderOrderCard';
import type { ProviderBookingItem } from '@/features/provider/constants/providerBookings';

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
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center">
          <View className="mb-4">
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Rect x="20" y="15" width="80" height="60" rx="12" fill="#e0f2fe" />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              <Rect x="35" y="32" width="50" height="8" rx="4" fill="#0ea5e9" opacity={0.15} />
              <Rect x="35" y="44" width="35" height="8" rx="4" fill="#0ea5e9" opacity={0.15} />
              <Circle cx="80" cy="54" r="14" fill="#0ea5e9" />
              <Path d="M80 48v12M74 54h12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{t('home.createFirstService')}</Text>
          <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-5 px-4">
            {t('home.createFirstServiceDesc')}
          </Text>
          <Button
            title={t('home.createService')}
            variant="primary"
            size="sm"
            onPress={onCreateServicePress}
            className="w-full max-w-[200px]"
          />
        </View>
      ) : (
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center">
          <View className="mb-4">
            <Svg width={120} height={90} viewBox="0 0 120 90">
              <Rect x="20" y="15" width="80" height="60" rx="12" fill="#f0fdf4" />
              <Rect x="25" y="22" width="70" height="48" rx="8" fill="#ffffff" />
              <Circle cx="45" cy="46" r="12" fill="#d1fae5" />
              <Rect x="63" y="40" width="22" height="4" rx="2" fill="#d1fae5" />
              <Rect x="63" y="48" width="16" height="4" rx="2" fill="#d1fae5" />
              <Circle cx="85" cy="30" r="12" fill="#10b981" />
              <Path d="M81 30h8 M85 26v8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </View>
          <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{t('home.boostYourBookings')}</Text>
          <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-5 px-4">
            {t('home.shareProfileDesc')}
          </Text>
          <Button
            title={t('home.shareProfile')}
            variant="primary"
            size="sm"
            onPress={handleShareProfile}
            className="w-full max-w-[200px]"
          />
        </View>
      )}
    </View>
  );
}
