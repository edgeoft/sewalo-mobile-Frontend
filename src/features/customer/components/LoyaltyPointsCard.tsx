import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

interface LoyaltyPointsCardProps {
  points: number;
}

export default function LoyaltyPointsCard({ points }: LoyaltyPointsCardProps) {
  const { t } = useTranslation();

  return (
    <View className="rounded-xl border border-gray-200 bg-white p-4 mb-5 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1 mr-3">
        <View className="h-10 w-10 rounded-xl bg-surface-indigo-subtle items-center justify-center flex-shrink-0">
          <Feather name="award" size={18} color={THEME_COLORS.primary} accessible={false} />
        </View>

        <View className="ml-3.5 flex-1 min-w-0">
          <Text className="text-sm font-sans-bold text-gray-900 leading-tight" numberOfLines={1}>
            {t('customer.loyaltyPoints')}
          </Text>
          <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5 leading-snug">
            {t('customer.loyaltyPointsDesc')}
          </Text>
        </View>
      </View>

      <View className="bg-surface-indigo-subtle border border-indigo-100/80 rounded-lg px-2.5 py-1 items-center justify-center flex-shrink-0">
        <Text className="text-xs font-sans-extrabold text-primary">{points.toLocaleString()} pts</Text>
      </View>
    </View>
  );
}
