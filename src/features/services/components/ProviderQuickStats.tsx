import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProviderQuickStatsProps {
  startingPrice: string;
  ordersCompleted: string;
  specialPackagesCount: number;
  availabilityLabel: string;
}

export default function ProviderQuickStats({
  startingPrice,
  ordersCompleted,
  specialPackagesCount,
  availabilityLabel,
}: ProviderQuickStatsProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-y-3">
      <View className="flex-row gap-3">
        {/* Stat 1: Starting Price */}
        <View className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-emerald-600">
            {t('services.startingPrice')}
          </Text>
          <Text className="text-sm font-sans-extrabold text-emerald-800 mt-1">{startingPrice}</Text>
        </View>
        {/* Stat 2: Orders Completed */}
        <View className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-purple-600">
            {t('services.ordersCompleted')}
          </Text>
          <Text className="text-sm font-sans-extrabold text-purple-800 mt-1">{ordersCompleted}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {/* Stat 3: Special Packages */}
        <View className="flex-1 bg-amber-50 border border-amber-200 rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-amber-600">
            {t('services.specialPackages')}
          </Text>
          <Text className="text-sm font-sans-extrabold text-amber-800 mt-1">{specialPackagesCount}</Text>
        </View>
        {/* Stat 4: Availability */}
        <View className="flex-1 bg-indigo-50 border border-indigo-200 rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-indigo-900">
            {t('services.availability')}
          </Text>
          <View className="flex-row mt-1">
            <View className="bg-primary rounded px-2.5 py-0.5">
              <Text className="text-[9px] font-sans-extrabold text-white uppercase tracking-wider">
                {availabilityLabel}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
