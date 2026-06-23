import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Notification } from '@/api/notifications';

function getTypeIcon(type: string): keyof typeof Feather.glyphMap {
  if (type.includes('booking')) return 'calendar';
  if (type.includes('payment') || type.includes('payout')) return 'credit-card';
  if (type.includes('rating') || type.includes('review')) return 'star';
  if (type.includes('coupon') || type.includes('promo')) return 'tag';
  if (type.includes('welcome') || type.includes('account')) return 'user-check';
  return 'bell';
}

function getTypeColor(type: string): string {
  if (type.includes('booking')) return '#485aff';
  if (type.includes('payment') || type.includes('payout')) return '#10b981';
  if (type.includes('rating') || type.includes('review')) return '#f59e0b';
  if (type.includes('coupon') || type.includes('promo')) return '#8b5cf6';
  if (type.includes('welcome') || type.includes('account')) return '#06b6d4';
  return '#6b7280';
}

function getTypeBgColor(type: string): string {
  if (type.includes('booking')) return '#eef0ff';
  if (type.includes('payment') || type.includes('payout')) return '#d1fae5';
  if (type.includes('rating') || type.includes('review')) return '#fef3c7';
  if (type.includes('coupon') || type.includes('promo')) return '#f3e8ff';
  if (type.includes('welcome') || type.includes('account')) return '#cffafe';
  return '#f3f4f6';
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface NotificationCardProps {
  item: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (item: Notification) => void;
}

export default function NotificationCard({ item, onMarkRead, onDelete, onPress }: NotificationCardProps) {
  const [showActions, setShowActions] = useState(false);
  const isUnread = !item.read_at;

  return (
    <View
      className={`border rounded-lg p-4 mb-3 ${
        isUnread ? 'bg-primary/5 border-primary/10' : 'bg-white border-gray-200/80'
      }`}
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <Pressable
        onPress={() => {
          if (isUnread) onMarkRead(item.id);
          onPress?.(item);
        }}
        className="flex-row items-start"
      >
        <View
          className="h-10 w-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: getTypeBgColor(item.notification_type) }}
        >
          <Feather name={getTypeIcon(item.notification_type)} size={18} color={getTypeColor(item.notification_type)} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text
              className={`text-sm flex-1 mr-2 ${
                isUnread ? 'font-sans-bold text-gray-950' : 'font-sans-semibold text-gray-900'
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {isUnread && <View className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </View>

          <Text
            className={`text-xs leading-relaxed mb-2 ${
              isUnread ? 'font-sans-semibold text-gray-700' : 'font-sans-medium text-gray-500'
            }`}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-sans-medium text-gray-400">{formatRelativeTime(item.created_at)}</Text>
            <Pressable
              onPress={() => setShowActions(!showActions)}
              accessibilityRole="button"
              accessibilityLabel="Show actions"
              className="h-7 w-7 rounded-lg items-center justify-center active:opacity-60 bg-gray-50 border border-gray-100"
            >
              <Feather name={showActions ? 'chevron-up' : 'more-horizontal'} size={14} color="#6b7280" />
            </Pressable>
          </View>
        </View>
      </Pressable>

      {showActions && (
        <View className="flex-row mt-3 gap-2 justify-end">
          {isUnread && (
            <Pressable
              onPress={() => {
                onMarkRead(item.id);
                setShowActions(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="Mark as read"
              className="flex-row items-center rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 active:opacity-80"
            >
              <Feather name="check" size={13} color="#485aff" />
              <Text className="text-[11px] font-sans-semibold text-primary ml-1.5">Mark Read</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              onDelete(item.id);
              setShowActions(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Delete notification"
            className="flex-row items-center rounded-lg bg-red-50 border border-red-100 px-3 py-1.5 active:opacity-80"
          >
            <Feather name="trash-2" size={13} color="#ef4444" />
            <Text className="text-[11px] font-sans-semibold text-red-500 ml-1.5">Delete</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
