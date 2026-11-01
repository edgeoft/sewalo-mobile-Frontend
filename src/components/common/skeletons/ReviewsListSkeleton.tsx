import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface ReviewsListSkeletonProps {
  count?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors ReviewCard list:
 * - Avatar 44x44
 * - Customer name, date
 * - Star rating pills
 * - Review content lines
 */
export default function ReviewsListSkeleton({ count = 4, className = '', style }: ReviewsListSkeletonProps) {
  return (
    <View
      style={style}
      className={`gap-4 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="rounded-xl border border-border bg-background p-4 gap-3">
          <View className="flex-row items-center gap-3">
            <Skeleton.Avatar size={44} />
            <View className="flex-1 gap-1.5">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </View>
            <Skeleton className="h-4 w-16 rounded-md" />
          </View>
          <View className="gap-1.5 pt-1">
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-4/5 rounded-full" />
          </View>
        </View>
      ))}
    </View>
  );
}
