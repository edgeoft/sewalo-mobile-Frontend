import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface ProviderDetailsSkeletonProps {
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors ProviderDetailsScreen:
 * - Profile header card with 80px avatar, name, badges, rating
 * - 4-item tab bar
 * - Quick stats row (4 metric blocks)
 * - Details content card
 */
export default function ProviderDetailsSkeleton({ className = '', style }: ProviderDetailsSkeletonProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="p-4 gap-4 pb-12"
      style={style}
      className={`flex-1 bg-secondary ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {/* Profile Header Card */}
      <View className="rounded-2xl border border-border bg-background p-4 items-center gap-3">
        <Skeleton.Avatar size={80} />
        <Skeleton className="h-5 w-44 rounded-full" />
        <View className="flex-row items-center gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </View>
        <Skeleton className="h-3.5 w-36 rounded-full" />
        <View className="flex-row gap-2 w-full pt-3 border-t border-border/40">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </View>
      </View>

      {/* Tabs Row */}
      <View className="flex-row justify-around rounded-xl border border-border bg-background p-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </View>

      {/* Quick stats grid */}
      <View className="flex-row gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} className="flex-1 rounded-xl border border-border bg-background p-3 items-center gap-1.5">
            <Skeleton className="h-5 w-10 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </View>
        ))}
      </View>

      {/* Main Details Card */}
      <View className="rounded-2xl border border-border bg-background p-4 gap-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
      </View>
    </ScrollView>
  );
}
