import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View, ListRenderItemInfo } from 'react-native';

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
  renderItem: renderItemProp,
  initialVisibleCount = 4,
  pageSize = 4,
  onLoadMore,
  loadMoreLabel,
  endReachedLabel,
  emptyTitle,
  emptyDescription,
  emptyContent,
  itemHeight,
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

  const renderItemCallback = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <View className={`mb-4 ${listClassName}`}>{renderItemProp(item, index)}</View>
    ),
    [renderItemProp, listClassName],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => {
      if (!itemHeight) return { length: 0, offset: 0, index };
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [itemHeight],
  );

  if (data.length === 0) {
    if (emptyContent) {
      return <>{emptyContent}</>;
    }

    return (
      <View className="rounded-2xl border border-gray-200 bg-white px-5 py-8 items-center">
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{resolvedEmptyTitle}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5">{resolvedEmptyDescription}</Text>
      </View>
    );
  }

  const renderFooter = () => (
    <View className="items-center pt-2 pb-4">
      {hasMore ? (
        <Pressable
          onPress={handleLoadMore}
          accessibilityRole="button"
          accessibilityLabel={resolvedLoadMoreLabel}
          className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 active:opacity-80"
        >
          <Text className="text-xs font-sans-semibold text-gray-700">{resolvedLoadMoreLabel}</Text>
        </Pressable>
      ) : (
        <Text className="text-[11px] font-sans-medium text-gray-400">{resolvedEndReachedLabel}</Text>
      )}
    </View>
  );

  return (
    <FlatList
      data={visibleItems}
      keyExtractor={keyExtractor}
      renderItem={renderItemCallback}
      getItemLayout={itemHeight ? getItemLayout : undefined}
      ListFooterComponent={renderFooter}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      scrollEnabled={false}
    />
  );
}
