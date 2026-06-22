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

export const ProviderServicesSkeleton = () => (
  <View className="gap-y-5 px-4 pt-4">
    {/* 1. Status Phase Card Skeleton */}
    <View
      style={cardShadow}
      className="rounded-xl border border-indigo-50 bg-white p-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center gap-2.5 flex-1">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4.5 w-1/3 rounded" />
      </View>
      <Skeleton className="h-5 w-20 rounded-full" />
    </View>

    {/* 2. Header Card Skeleton (Title, category badge, and large image placeholder) */}
    <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
      <View className="gap-y-2 mb-4">
        <Skeleton className="h-6 w-5/6 rounded" />
        <Skeleton className="h-4.5 w-24 rounded-full" />
      </View>
      <Skeleton className="h-52 w-full rounded-lg" />
    </View>

    {/* 3. About / Description Card Skeleton */}
    <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 gap-y-2.5">
      <Skeleton className="h-3.5 w-28 rounded" />
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-11/12 rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
    </View>

    {/* 4. Services Offered Card Skeleton (List of subcategory rates) */}
    <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 gap-y-3.5">
      <Skeleton className="h-3.5 w-32 rounded" />

      <View className="flex-row items-center justify-between border-b border-gray-50 pb-3">
        <View className="flex-row items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <View className="gap-y-1">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </View>
        </View>
        <Skeleton className="h-4.5 w-16 rounded" />
      </View>

      <View className="flex-row items-center justify-between border-b border-gray-50 pb-3">
        <View className="flex-row items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <View className="gap-y-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </View>
        </View>
        <Skeleton className="h-4.5 w-16 rounded" />
      </View>
    </View>

    {/* 5. Packages Card Skeleton */}
    <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 gap-y-3.5">
      <Skeleton className="h-3.5 w-36 rounded" />
      <View className="flex-row gap-x-3">
        <View className="flex-1 rounded-lg border border-indigo-50/50 bg-indigo-50/10 p-3 gap-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </View>
        <View className="flex-1 rounded-lg border border-indigo-50/50 bg-indigo-50/10 p-3 gap-y-2">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </View>
      </View>
    </View>
  </View>
);

export default ProviderServicesSkeleton;
