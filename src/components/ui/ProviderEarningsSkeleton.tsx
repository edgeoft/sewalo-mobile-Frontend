import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';

export const EarningSkeleton = () => (
  <View className="rounded-xl border border-gray-200 bg-white p-4 mb-4 gap-y-3.5">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3.5 flex-1">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <View className="flex-1 gap-y-1.5">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-5 w-1/3" />
        </View>
      </View>
      <Skeleton className="h-5 w-16 rounded-full" />
    </View>
    <View className="flex-row gap-3">
      <View className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 gap-y-2">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </View>
      <View className="flex-1 rounded-xl border border-gray-200 bg-white p-3.5 gap-y-2">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </View>
    </View>
  </View>
);

export const TransactionItemSkeleton = () => (
  <View className="rounded-xl border border-gray-200 bg-white p-3.5 flex-row justify-between items-center mb-3">
    <View className="flex-1 gap-y-1.5 mr-3">
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3.5 w-1/2" />
    </View>
    <View className="items-end gap-y-1.5">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-12 rounded-full" />
    </View>
  </View>
);
