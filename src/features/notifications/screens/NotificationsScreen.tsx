import { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { LoadMoreList } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { SegmentedControl } from '@/components/ui';
import type { SegmentedControlOption } from '@/components/ui/SegmentedControl';
import { NOTIFICATION_FILTERS, type NotificationFilter, Notification } from '@/types';
import {
  useGetNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/api';
import NotificationCard from '../components/NotificationCard';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>(NOTIFICATION_FILTERS.All);

  const { data: notificationsData, isLoading } = useGetNotificationsQuery({
    limit: 50,
    unread_only: activeFilter === NOTIFICATION_FILTERS.Unread || undefined,
  });
  const { data: unreadData } = useUnreadCountQuery();

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.unread_count || 0;

  const handleMarkRead = useCallback((id: string) => markRead.mutate(id), [markRead]);

  const handleDelete = useCallback((id: string) => deleteNotif.mutate(id), [deleteNotif]);

  const handleMarkAllAsRead = useCallback(() => markAllRead.mutate(), [markAllRead]);

  const handlePress = useCallback((_item: Notification) => {}, []);

  const renderItem = useCallback(
    (item: Notification) => (
      <NotificationCard item={item} onMarkRead={handleMarkRead} onDelete={handleDelete} onPress={handlePress} />
    ),
    [handleMarkRead, handleDelete, handlePress],
  );

  const filterOptions = useMemo<SegmentedControlOption<NotificationFilter>[]>(
    () => [
      { value: NOTIFICATION_FILTERS.All, label: t('notifications.all') },
      { value: NOTIFICATION_FILTERS.Unread, label: t('notifications.unread') },
    ],
    [t],
  );

  const emptyContent = useMemo(
    () => (
      <View className="flex-1 items-center justify-center pb-20">
        <View className="h-16 w-16 rounded-lg bg-gray-100 items-center justify-center mb-4">
          <Feather name="bell-off" size={28} color="#9ca3af" />
        </View>
        <Text className="text-base font-sans-semibold text-gray-900 mb-1">
          {activeFilter === NOTIFICATION_FILTERS.Unread ? t('notifications.emptyUnread') : t('notifications.emptyAll')}
        </Text>
        <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 px-6">
          {activeFilter === NOTIFICATION_FILTERS.Unread
            ? t('notifications.emptyUnreadDesc')
            : t('notifications.emptyAllDesc')}
        </Text>
      </View>
    ),
    [activeFilter, t],
  );

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showNotifications={false} includeBottomBorder={false} showBackButton />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-sans-extrabold text-gray-950 tracking-tight">
              {t('notifications.title')}
            </Text>
            {unreadCount > 0 && (
              <Text className="text-xs font-sans-medium text-gray-500 mt-1">
                {t('notifications.unreadCount', { count: unreadCount })}
              </Text>
            )}
          </View>

          {unreadCount > 0 && (
            <Pressable
              onPress={handleMarkAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Mark all as read"
              className="flex-row items-center rounded-lg bg-primary/10 px-3.5 py-2 active:opacity-80"
            >
              <Feather name="check-square" size={14} color="#485aff" accessible={false} />
              <Text className="text-xs font-sans-bold text-primary ml-1.5">{t('notifications.markAllRead')}</Text>
            </Pressable>
          )}
        </View>

        <SegmentedControl
          options={filterOptions}
          selectedValue={activeFilter}
          onValueChange={setActiveFilter}
          containerClassName="mb-6"
        />

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        ) : (
          <LoadMoreList
            key={activeFilter}
            data={notifications}
            keyExtractor={(item) => item.id}
            initialVisibleCount={6}
            pageSize={4}
            loadMoreLabel={t('common.loadMore')}
            endReachedLabel={t('common.allCaughtUp')}
            emptyContent={emptyContent}
            listClassName="gap-1"
            renderItem={renderItem}
          />
        )}
      </ContentLayout>
    </View>
  );
}
