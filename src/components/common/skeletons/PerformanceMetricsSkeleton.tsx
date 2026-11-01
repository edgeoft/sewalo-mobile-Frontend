import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface PerformanceMetricsSkeletonProps {
  count?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors PerformanceMetricsSection and ProviderEarnings cards:
 * - Rounded cards with 44x44 icon placeholder
 * - Metric title and value lines
 */
export default function PerformanceMetricsSkeleton({
  count = 3,
  className = '',
  style,
}: PerformanceMetricsSkeletonProps) {
  return (
    <View
      style={style}
      className={`gap-y-3.5 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className="rounded-xl border border-border bg-background p-3.5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3.5">
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            <View className="gap-1.5">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </View>
          </View>
          <Skeleton className="h-4 w-12 rounded-full" />
        </View>
      ))}
    </View>
  );
}
