import React from 'react';
import { Text, View } from 'react-native';

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
  return (
    <View className="gap-y-3">
      <View className="flex-row gap-3">
        {/* Stat 1: Starting Price */}
        <View className="flex-1 bg-[#ebfbf3] border border-[#a3e9c9] rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-emerald-600">Starting Price</Text>
          <Text className="text-sm font-sans-extrabold text-emerald-800 mt-1">{startingPrice}</Text>
        </View>
        {/* Stat 2: Orders Completed */}
        <View className="flex-1 bg-[#faf0ff] border border-[#e8c4fd] rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-purple-600">Orders Completed</Text>
          <Text className="text-sm font-sans-extrabold text-purple-800 mt-1">{ordersCompleted}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {/* Stat 3: Special Packages */}
        <View className="flex-1 bg-[#fff8eb] border border-[#fde0b2] rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-amber-600">Special Packages</Text>
          <Text className="text-sm font-sans-extrabold text-amber-800 mt-1">{specialPackagesCount}</Text>
        </View>
        {/* Stat 4: Availability */}
        <View className="flex-1 bg-[#eef2ff] border border-[#c7d2fe] rounded-lg p-3.5">
          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-[#312e81]">Availability</Text>
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
