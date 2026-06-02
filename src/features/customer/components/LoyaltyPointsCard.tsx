import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface LoyaltyPointsCardProps {
  points: number;
}

export default function LoyaltyPointsCard({ points }: LoyaltyPointsCardProps) {
  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View
      style={cardShadow}
      className="rounded-xl border border-gray-200 bg-white p-4 mb-5 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1 mr-3">
        <View className="h-10 w-10 rounded-xl bg-indigo-50/50 items-center justify-center">
          <Feather name="award" size={20} color="#485aff" />
        </View>

        <View className="ml-3.5 flex-1">
          <Text className="text-sm font-sans-bold text-gray-900">Loyalty Points</Text>
          <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
            Use accumulated points for service discounts
          </Text>
        </View>
      </View>

      <View className="bg-indigo-50 border border-indigo-100/50 rounded-lg px-3 py-1.5 items-center justify-center">
        <Text className="text-sm font-sans-extrabold text-primary">{points.toLocaleString()} pts</Text>
      </View>
    </View>
  );
}
