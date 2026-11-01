import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface ProviderOrderCardSkeletonProps {
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors ProviderOrderCard.tsx exactly:
 * - 64x64 rounded image placeholder
 * - Customer name, status badge, service label, schedule, and price lines
 * Zero layout shift when data loads.
 */
export default function ProviderOrderCardSkeleton({ className = '', style }: ProviderOrderCardSkeletonProps) {
  return (
    <View
      style={style}
      className={`rounded-lg border border-border bg-background p-3 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      <View className="flex-row gap-3">
        {/* Avatar block */}
        <Skeleton style={{ width: 64, height: 64, borderRadius: 8 }} className="shrink-0" />

        {/* Details */}
        <View className="flex-1 min-w-0 justify-center gap-1.5">
          <View className="flex-row items-center justify-between gap-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </View>
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-3 w-36 rounded-full" />
          <View className="flex-row items-center justify-between pt-1">
            <Skeleton className="h-4 w-20 rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
}
