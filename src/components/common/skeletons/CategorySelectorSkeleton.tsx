import React from 'react';
import { ScrollView, View, type ViewStyle } from 'react-native';
import { Skeleton } from '@/components/ui';

export interface CategorySelectorSkeletonProps {
  variant?: 'chips' | 'icons';
  count?: number;
  className?: string;
  style?: ViewStyle;
}

/**
 * Skeleton for categories:
 * - 'chips': Horizontal pill chips (matching CategoryScrollSelector)
 * - 'icons': Circular icons with label underneath (matching HomeServiceCategoriesSection)
 */
export default function CategorySelectorSkeleton({
  variant = 'chips',
  count = 5,
  className = '',
  style,
}: CategorySelectorSkeletonProps) {
  if (variant === 'icons') {
    return (
      <View style={style} className={`flex-row justify-between px-1 py-2 ${className}`}>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} className="w-16 items-center gap-2">
            <Skeleton.Avatar size={56} />
            <Skeleton className="h-3 w-14 rounded-full" />
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}
      style={style}
      className={`py-1 ${className}`}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-9 rounded-full shrink-0"
          style={{ width: index === 0 ? 60 : index % 2 === 0 ? 100 : 85 }}
        />
      ))}
    </ScrollView>
  );
}
