import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export const FavoriteSkeleton = () => (
  <View className="shrink-0 rounded-xl border border-gray-200 bg-white p-3 mb-4">
    <View className="flex-row gap-3">
      <Skeleton className="h-24 w-24 rounded-xl" />
      <View className="flex-1 justify-between py-0.5 gap-y-2">
        <View className="flex-row items-center justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-7 w-7 rounded-xl" />
        </View>
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-xl" />
          <Skeleton className="h-5 w-12 rounded-xl" />
        </View>
        <View className="gap-y-1.5 mt-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </View>
      </View>
    </View>
    <View className="my-2.5 border-t border-gray-100" />
    <View className="flex-row items-center justify-between">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-24 rounded-md" />
    </View>
  </View>
);
export default FavoriteSkeleton;
