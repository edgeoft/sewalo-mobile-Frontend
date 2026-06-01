import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { NotificationItem } from '@/types';

const TYPE_ICONS: Record<NotificationItem['type'], keyof typeof Feather.glyphMap> = {
  booking: 'calendar',
  payment: 'credit-card',
  review: 'star',
  promo: 'tag',
  system: 'bell',
};

const TYPE_COLORS: Record<NotificationItem['type'], string> = {
  booking: '#485aff',
  payment: '#10b981',
  review: '#f59e0b',
  promo: '#8b5cf6',
  system: '#6b7280',
};

const TYPE_BG_COLORS: Record<NotificationItem['type'], string> = {
  booking: '#eef0ff',
  payment: '#d1fae5',
  review: '#fef3c7',
  promo: '#f3e8ff',
  system: '#f3f4f6',
};

interface NotificationCardProps {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: (item: NotificationItem) => void;
}

export default function NotificationCard({ item, onMarkRead, onDelete, onPress }: NotificationCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <View
      className={`border rounded-lg p-4 mb-3 ${
        item.read ? 'bg-white border-gray-200/80' : 'bg-primary/5 border-primary/10'
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
          if (!item.read) onMarkRead(item.id);
          onPress?.(item);
        }}
        className="flex-row items-start"
      >
        {/* Left icon badge */}
        <View
          className="h-10 w-10 rounded-lg items-center justify-center mr-3"
          style={{ backgroundColor: TYPE_BG_COLORS[item.type] }}
        >
          <Feather name={TYPE_ICONS[item.type]} size={18} color={TYPE_COLORS[item.type]} />
        </View>

        {/* Text Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text
              className={`text-sm flex-1 mr-2 ${
                item.read ? 'font-sans-semibold text-gray-900' : 'font-sans-bold text-gray-950'
              }`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && <View className="h-1.5 w-1.5 rounded-full bg-primary" />}
          </View>

          <Text
            className={`text-xs leading-relaxed mb-2 ${
              item.read ? 'font-sans-medium text-gray-500' : 'font-sans-semibold text-gray-700'
            }`}
            numberOfLines={2}
          >
            {item.message}
          </Text>

          <View className="flex-row items-center justify-between">
            <Text className="text-[10px] font-sans-medium text-gray-400">{item.timestamp}</Text>

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

      {/* Inline actions revealed below (no separator line, all buttons are rounded-lg) */}
      {showActions && (
        <View className="flex-row mt-3 gap-2 justify-end">
          {!item.read && (
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
