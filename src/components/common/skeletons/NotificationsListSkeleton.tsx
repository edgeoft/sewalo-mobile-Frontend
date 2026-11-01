import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface NotificationsListSkeletonProps {
  count?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton that mirrors NotificationCard list:
 * - 40x40 icon circle placeholder
 * - Title, description, and timestamp lines
 */
export default function NotificationsListSkeleton({
  count = 5,
  className = '',
  style,
}: NotificationsListSkeletonProps) {
  return (
    <View
      style={style}
      className={`gap-2.5 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="rounded-xl border border-border bg-background p-3.5 flex-row items-center gap-3">
          <Skeleton.Avatar size={40} />
          <View className="flex-1 gap-1.5 min-w-0">
            <View className="flex-row items-center justify-between">
              <Skeleton className="h-4 w-36 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </View>
            <Skeleton className="h-3 w-5/6 rounded-full" />
          </View>
        </View>
      ))}
    </View>
  );
}
