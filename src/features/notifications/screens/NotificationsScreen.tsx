import { useMemo, useState } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { LoadMoreList } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { SegmentedControl } from '@/components/ui';
import type { SegmentedControlOption } from '@/components/ui/SegmentedControl';
import { NOTIFICATION_FILTERS, type NotificationFilter } from '@/types';
import {
  useGetNotificationsQuery,
  useUnreadCountQuery,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/api/notifications';
import type { Notification } from '@/api/notifications';
import NotificationCard from '../components/NotificationCard';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
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

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteNotif.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllRead.mutate();
  };

  const handlePress = (item: Notification) => {};

  const filterOptions = useMemo<SegmentedControlOption<NotificationFilter>[]>(
    () => [
      { value: NOTIFICATION_FILTERS.All, label: 'All' },
      { value: NOTIFICATION_FILTERS.Unread, label: 'Unread' },
    ],
    [],
  );

  const emptyContent = useMemo(
    () => (
      <View className="flex-1 items-center justify-center pb-20">
        <View className="h-16 w-16 rounded-lg bg-gray-100 items-center justify-center mb-4">
          <Feather name="bell-off" size={28} color="#9ca3af" />
        </View>
        <Text className="text-base font-sans-semibold text-gray-900 mb-1">
          {activeFilter === NOTIFICATION_FILTERS.Unread ? 'No unread notifications' : 'No notifications yet'}
        </Text>
        <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 px-6">
          {activeFilter === NOTIFICATION_FILTERS.Unread
            ? "You've read all your notifications."
            : "You'll see updates here when something new arrives."}
        </Text>
      </View>
    ),
    [activeFilter],
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
            <Text className="text-2xl font-sans-extrabold text-gray-950 tracking-tight">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-xs font-sans-medium text-gray-500 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
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
              <Feather name="check-square" size={14} color="#485aff" />
              <Text className="text-xs font-sans-bold text-primary ml-1.5">Mark All Read</Text>
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
            key={`${activeFilter}-${notifications.length}`}
            data={notifications}
            keyExtractor={(item) => item.id}
            initialVisibleCount={6}
            pageSize={4}
            loadMoreLabel="Load More Notifications"
            endReachedLabel="No more notifications"
            emptyContent={emptyContent}
            listClassName="gap-1"
            renderItem={(item) => (
              <NotificationCard item={item} onMarkRead={handleMarkRead} onDelete={handleDelete} onPress={handlePress} />
            )}
          />
        )}
      </ContentLayout>
    </View>
  );
}
