import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME_COLORS } from '@/constants/colors';

export interface PaginationListProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number, pageIndex: number) => React.ReactNode;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyContent?: React.ReactNode;
  listClassName?: string;
}

export default function PaginationList<T>({
  data,
  keyExtractor,
  renderItem,
  pageSize = 5,
  emptyTitle,
  emptyDescription,
  emptyContent,
  listClassName = 'gap-3',
}: PaginationListProps<T>) {
  const { t } = useTranslation();
  const resolvedEmptyTitle = emptyTitle ?? t('errors.recordsNotFound');
  const resolvedEmptyDescription = emptyDescription ?? t('errors.recordsNotFoundDesc');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / pageSize));
  }, [data.length, pageSize]);

  const activePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (activePage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, activePage, pageSize]);

  const handlePrevPage = () => {
    if (activePage > 1) {
      setCurrentPage(activePage - 1);
    }
  };

  const handleNextPage = () => {
    if (activePage < totalPages) {
      setCurrentPage(activePage + 1);
    }
  };

  if (data.length === 0) {
    if (emptyContent) {
      return <>{emptyContent}</>;
    }

    return (
      <View className="rounded-xl border border-gray-200 bg-white px-5 py-8 items-center">
        <Text className="text-sm font-sans-semibold text-gray-900 mb-1">{resolvedEmptyTitle}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5">{resolvedEmptyDescription}</Text>
      </View>
    );
  }

  const isFirstPage = activePage === 1;
  const isLastPage = activePage === totalPages;

  return (
    <View className="flex-1">
      <View className={listClassName}>
        {pageItems.map((item, index) => {
          const globalIndex = (activePage - 1) * pageSize + index;
          return <View key={keyExtractor(item, globalIndex)}>{renderItem(item, globalIndex, index)}</View>;
        })}
      </View>

      {/* Pagination Controls */}
      <View className="flex-row items-center justify-between pt-5 pb-2 px-1">
        <Pressable
          onPress={handlePrevPage}
          disabled={isFirstPage}
          accessibilityRole="button"
          accessibilityLabel={t('components.previousPage')}
          accessibilityState={{ disabled: isFirstPage }}
          hitSlop={8}
          className={`h-9 w-9 rounded-xl border items-center justify-center bg-white ${
            isFirstPage ? 'border-gray-100 opacity-40' : 'border-gray-200 active:bg-gray-50'
          }`}
        >
          <Feather name="chevron-left" size={18} color={THEME_COLORS.slate500} accessible={false} />
        </Pressable>

        <Text className="text-xs font-sans-semibold text-gray-500">
          {t('components.pageOf', { active: activePage, total: totalPages })}
        </Text>

        <Pressable
          onPress={handleNextPage}
          disabled={isLastPage}
          accessibilityRole="button"
          accessibilityLabel={t('components.nextPage')}
          accessibilityState={{ disabled: isLastPage }}
          hitSlop={8}
          className={`h-9 w-9 rounded-xl border items-center justify-center bg-white ${
            isLastPage ? 'border-gray-100 opacity-40' : 'border-gray-200 active:bg-gray-50'
          }`}
        >
          <Feather name="chevron-right" size={18} color={THEME_COLORS.slate500} accessible={false} />
        </Pressable>
      </View>
    </View>
  );
}
