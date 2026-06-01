import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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
  listClassName?: string;
}

export default function LoadMoreList<T>({
  data,
  keyExtractor,
  renderItem,
  initialVisibleCount = 4,
  pageSize = 4,
  onLoadMore,
  loadMoreLabel = 'Load More',
  endReachedLabel = "You're all caught up",
  emptyTitle = 'No items found',
  emptyDescription = 'Try changing your filters and search query.',
  emptyContent,
  listClassName = 'gap-4',
}: LoadMoreListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const visibleItems = useMemo(() => data.slice(0, visibleCount), [data, visibleCount]);
  const hasMore = visibleCount < data.length;

  const handleLoadMore = () => {
    const nextVisibleCount = Math.min(visibleCount + pageSize, data.length);
    setVisibleCount(nextVisibleCount);
    onLoadMore?.(nextVisibleCount);
  };

  if (data.length === 0) {
    if (emptyContent) {
      return <>{emptyContent}</>;
    }

    return (
      <View className="rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center">
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{emptyTitle}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5">{emptyDescription}</Text>
      </View>
    );
  }

  return (
    <View>
      <View className={listClassName}>
        {visibleItems.map((item, index) => (
          <View key={keyExtractor(item, index)}>{renderItem(item, index)}</View>
        ))}
      </View>

      <View className="items-center pt-4">
        {hasMore ? (
          <Pressable
            onPress={handleLoadMore}
            accessibilityRole="button"
            accessibilityLabel={loadMoreLabel}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 active:opacity-80"
          >
            <Text className="text-xs font-sans-semibold text-gray-700">{loadMoreLabel}</Text>
          </Pressable>
        ) : (
          <Text className="text-[11px] font-sans-medium text-gray-400">{endReachedLabel}</Text>
        )}
      </View>
    </View>
  );
}
