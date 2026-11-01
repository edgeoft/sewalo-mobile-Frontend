import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface BlogCardSkeletonProps {
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors HomeArticleSection and Blog list items:
 * - Category badge and read time pills
 * - Article title and subtitle lines
 * Zero layout shift when data loads.
 */
export default function BlogCardSkeleton({ className = '', style }: BlogCardSkeletonProps) {
  return (
    <View
      style={style}
      className={`border border-border bg-background p-5 rounded-xl gap-3 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {/* Category badge + read time */}
      <View className="flex-row items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-xl" />
        <Skeleton className="h-3.5 w-16 rounded-full" />
      </View>

      {/* Title */}
      <View className="gap-2">
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-5 w-3/5 rounded-full" />
      </View>

      {/* Description */}
      <View className="gap-1.5 pt-1">
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-2 border-t border-border/40">
        <Skeleton className="h-3.5 w-24 rounded-full" />
        <Skeleton className="h-3.5 w-16 rounded-full" />
      </View>
    </View>
  );
}
