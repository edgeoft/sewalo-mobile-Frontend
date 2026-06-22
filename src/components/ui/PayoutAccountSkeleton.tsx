import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

const cardShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.03,
  shadowRadius: 8,
  elevation: 1,
};

export const PayoutAccountSkeleton = () => (
  <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
    <View className="flex-row items-center">
      <Skeleton className="h-11 w-11 rounded-lg mr-3" />
      <View className="flex-1 gap-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </View>
    </View>
  </View>
);
export default PayoutAccountSkeleton;
