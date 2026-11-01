import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface BookingDetailsSkeletonProps {
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors BookingDetailsScreen:
 * - Status banner
 * - Booking metadata card
 * - Provider/Customer info card
 * - Service & invoice cards
 */
export default function BookingDetailsSkeleton({ className = '', style }: BookingDetailsSkeletonProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="p-4 gap-4 pb-12"
      style={style}
      className={`flex-1 bg-secondary ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {/* Status banner */}
      <View className="rounded-xl border border-border bg-background p-4 flex-row items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <View className="flex-1 gap-1.5">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-48 rounded-full" />
        </View>
      </View>

      {/* Booking party card (Provider / Customer) */}
      <View className="rounded-xl border border-border bg-background p-4 gap-3">
        <View className="flex-row items-center gap-3">
          <Skeleton.Avatar size={52} />
          <View className="flex-1 gap-1.5">
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </View>
        </View>
        <View className="flex-row gap-2 pt-2 border-t border-border/40">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </View>
      </View>

      {/* Service Details Card */}
      <View className="rounded-xl border border-border bg-background p-4 gap-3">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-4/5 rounded-full" />
        <View className="flex-row gap-2 pt-2">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </View>
      </View>

      {/* Price breakdown card */}
      <View className="rounded-xl border border-border bg-background p-4 gap-2.5">
        <Skeleton className="h-4 w-32 rounded-full mb-1" />
        <View className="flex-row justify-between">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="h-3.5 w-16 rounded-full" />
        </View>
        <View className="flex-row justify-between">
          <Skeleton className="h-3.5 w-20 rounded-full" />
          <Skeleton className="h-3.5 w-14 rounded-full" />
        </View>
        <View className="flex-row justify-between pt-2 border-t border-border/60">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </View>
      </View>
    </ScrollView>
  );
}
