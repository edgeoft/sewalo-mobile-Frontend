import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface ProviderCardSkeletonProps {
  width?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors ProviderCard.tsx exactly:
 * - 204px fixed height
 * - 56px circular avatar
 * - Category badge and rating pill placeholders
 * - Location and price bottom rows
 * Zero layout shift when data loads.
 */
export default function ProviderCardSkeleton({ width, className = '', style }: ProviderCardSkeletonProps) {
  return (
    <View
      style={[
        width ? { width } : undefined,
        {
          borderCurve: 'continuous',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        },
        style,
      ]}
      className={`shrink-0 rounded-2xl border border-border bg-background p-3.5 justify-between h-[204px] min-h-[204px] ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {/* Top Row: Avatar + Name / Category / Rating */}
      <View className="flex-row items-center gap-3 pr-7">
        <Skeleton.Avatar size={56} />

        <View className="flex-1 justify-center gap-1.5 min-w-0">
          <Skeleton className="h-4 w-36 rounded-full" />
          <View className="flex-row items-center gap-1.5">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </View>
        </View>
      </View>

      {/* Middle Row: Location */}
      <View className="flex-row items-center gap-2">
        <Skeleton className="h-3.5 w-44 rounded-full" />
      </View>

      {/* Bottom Row: Orders completed & Price */}
      <View className="flex-row items-center justify-between pt-1 border-t border-border/60">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </View>
    </View>
  );
}
