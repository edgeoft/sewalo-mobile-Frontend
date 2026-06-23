import React from 'react';
import { View } from 'react-native';

import { SectionHeader } from '@/components/common';
import ProviderOrderCard from './ProviderOrderCard';
import type { ProviderBookingItem } from '@/features/provider/constants/providerBookings';

export interface RecentOrdersSectionProps {
  title: string;
  actionLabel: string;
  orders: ProviderBookingItem[];
  onActionPress?: () => void;
  onOrderPress?: (order: ProviderBookingItem) => void;
  onAcceptOrder?: (id: string) => void;
  onDeclineOrder?: (id: string) => void;
}

export default function RecentOrdersSection({
  title,
  actionLabel,
  orders,
  onActionPress,
  onOrderPress,
  onAcceptOrder,
  onDeclineOrder,
}: RecentOrdersSectionProps) {
  return (
    <View className="pt-5">
      <SectionHeader title={title} actionLabel={actionLabel} onActionPress={onActionPress} className="mb-5" />

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
    </View>
  );
}
