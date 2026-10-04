import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import EmptyStateCard from './EmptyStateCard';

export interface LoadMoreListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  initialVisibleCount?: number;
  pageSize?: number;
  onLoadMore?: (nextVisibleCount: number) => void;
  loadMoreLabel?: string;
  endReachedLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyContent?: React.ReactNode;
  itemHeight?: number;
  listClassName?: string;
}

export default function LoadMoreList<T>({
  data,
  keyExtractor,
  renderItem,
  initialVisibleCount = 4,
  pageSize = 4,
  onLoadMore,
  loadMoreLabel,
  endReachedLabel,
  emptyTitle,
  emptyDescription,
  emptyContent,
  listClassName = 'gap-4',
}: LoadMoreListProps<T>) {
  const { t } = useTranslation();
  const resolvedLoadMoreLabel = loadMoreLabel ?? t('common.loadMore');
  const resolvedEndReachedLabel = endReachedLabel ?? t('common.allCaughtUp');
  const resolvedEmptyTitle = emptyTitle ?? t('errors.itemsNotFound');
  const resolvedEmptyDescription = emptyDescription ?? t('errors.itemsNotFoundDesc');
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const visibleItems = useMemo(() => data.slice(0, visibleCount), [data, visibleCount]);
  const hasMore = visibleCount < data.length;

  const handleLoadMore = useCallback(() => {
    const nextVisibleCount = Math.min(visibleCount + pageSize, data.length);
    setVisibleCount(nextVisibleCount);
    onLoadMore?.(nextVisibleCount);
  }, [visibleCount, pageSize, data.length, onLoadMore]);

  if (data.length === 0) {
    if (emptyContent) {
      return <>{emptyContent}</>;
    }

    return <EmptyStateCard title={resolvedEmptyTitle} description={resolvedEmptyDescription} />;
  }

  return (
    <View className="w-full">
      <View className={listClassName}>
        {visibleItems.map((item, index) => (
          <View key={keyExtractor(item, index)}>{renderItem(item, index)}</View>
        ))}
      </View>

      <View className="items-center pt-4 pb-4">
        {hasMore ? (
          <Pressable
            onPress={handleLoadMore}
            accessibilityRole="button"
            accessibilityLabel={resolvedLoadMoreLabel}
            hitSlop={8}
            className="min-h-[44px] min-w-[120px] items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 active:bg-secondary"
          >
            <Text className="text-xs font-sans-semibold text-foreground">{resolvedLoadMoreLabel}</Text>
          </Pressable>
        ) : (
          <Text className="text-[11px] font-sans-medium text-muted-foreground">{resolvedEndReachedLabel}</Text>
        )}
      </View>
    </View>
  );
}
