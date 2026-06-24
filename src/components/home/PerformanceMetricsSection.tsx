import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SectionHeader } from '@/components/common';

export interface PerformanceMetricsSectionProps {
  title?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  metrics?: {
    totalEarnings: string;
    profileViews: string;
    acceptanceRate: string;
    acceptanceRating: string;
  };
}

export default function PerformanceMetricsSection({
  title = 'Performance Insights',
  actionLabel = 'View Analytics',
  onActionPress,
  metrics,
}: PerformanceMetricsSectionProps) {
  const displayMetrics = metrics || {
    totalEarnings: 'Rs. 45,200',
    profileViews: '1,280',
    acceptanceRate: '98.5%',
    acceptanceRating: 'Excellent',
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  return (
    <View className="pt-5">
      <SectionHeader title={title} actionLabel={actionLabel} onActionPress={onActionPress} className="mb-5" />

      <View className="gap-y-4">
        {/* Earnings Card */}
        <View
          style={cardShadow}
          className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3.5">
            <View className="h-11 w-11 rounded-xl bg-emerald-50 items-center justify-center">
              <Feather name="dollar-sign" size={20} color="#059669" />
            </View>
            <View>
              <Text className="text-[10px] font-sans-medium text-gray-400 uppercase tracking-wider">
                Total Earnings
              </Text>
              <Text className="text-xl font-sans-extrabold text-gray-900 mt-0.5">{displayMetrics.totalEarnings}</Text>
            </View>
          </View>
        </View>

        {/* Info row (Profile Views & Acceptance Rate in 2 columns) */}
        <View className="flex-row gap-3">
          {/* Profile Views */}
          <View style={cardShadow} className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 justify-between">
            <View className="flex-row items-center justify-between mb-3">
              <View className="h-9 w-9 rounded-xl bg-blue-50 items-center justify-center">
                <Feather name="eye" size={16} color="#2563eb" />
              </View>
            </View>
            <View>
              <Text className="text-[10px] font-sans-medium text-gray-400 uppercase tracking-wider">Profile Views</Text>
              <Text className="text-lg font-sans-bold text-gray-900 mt-0.5">{displayMetrics.profileViews}</Text>
            </View>
          </View>

          {/* Acceptance Rate */}
          <View style={cardShadow} className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 justify-between">
            <View className="flex-row items-center justify-between mb-3">
              <View className="h-9 w-9 rounded-xl bg-amber-50 items-center justify-center">
                <Feather name="check-square" size={16} color="#d97706" />
              </View>
              <View className="rounded-full bg-amber-50 px-2 py-0.5">
                <Text className="text-[10px] font-sans-bold text-amber-700">{displayMetrics.acceptanceRating}</Text>
              </View>
            </View>
            <View>
              <Text className="text-[10px] font-sans-medium text-gray-400 uppercase tracking-wider">
                Acceptance Rate
              </Text>
              <Text className="text-lg font-sans-bold text-gray-900 mt-0.5">{displayMetrics.acceptanceRate}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
