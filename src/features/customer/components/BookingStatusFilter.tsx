import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOOKING_STATUS_FILTER_OPTIONS, BOOKING_STATUS_PRESENTATION } from '@/constants/bookings';
import { THEME_COLORS } from '@/constants/colors';
import type { BookingStatus } from '@/types';

interface BookingStatusFilterProps {
  selectedStatus: BookingStatus;
  countsByStatus: Record<BookingStatus, number>;
  onStatusChange: (status: BookingStatus) => void;
}

export default function BookingStatusFilter({
  selectedStatus,
  countsByStatus,
  onStatusChange,
}: BookingStatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const selectedPresentation = useMemo(() => BOOKING_STATUS_PRESENTATION[selectedStatus], [selectedStatus]);

  return (
    <>
      <View className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <Pressable
          onPress={() => setIsOpen((prev) => !prev)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          className="px-3 py-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-sm font-sans-medium text-gray-500 mr-3">Bookings</Text>
            <View className="h-4 w-px bg-gray-200 mr-3" />

            <View className="flex-row items-center">
              <View
                className="h-1.5 w-1.5 rounded-full mr-2"
                style={{ backgroundColor: selectedPresentation.dotColor }}
              />
              <Text className="text-sm font-sans-medium text-gray-900">{selectedPresentation.label}</Text>
            </View>
          </View>

          <Feather
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={THEME_COLORS.slate400}
            accessible={false}
          />
        </Pressable>

        <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
          <View className="flex-1">
            <Pressable
              className="flex-1 bg-black/20"
              onPress={() => setIsOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close status filter"
            />

            <View
              className="absolute left-6 right-6 rounded-xl border border-gray-200 bg-white overflow-hidden"
              style={{ top: insets.top + 136 }}
            >
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 360 }}>
                {BOOKING_STATUS_FILTER_OPTIONS.map((status) => {
                  const presentation = BOOKING_STATUS_PRESENTATION[status];
                  const isSelected = selectedStatus === status;

                  return (
                    <Pressable
                      key={status}
                      onPress={() => {
                        onStatusChange(status);
                        setIsOpen(false);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      className={`px-3 py-3 flex-row items-center justify-between ${
                        isSelected ? 'bg-surface-indigo-subtle' : 'bg-white'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className="h-1.5 w-1.5 rounded-full mr-2"
                          style={{ backgroundColor: presentation.dotColor }}
                        />
                        <Text className="text-sm font-sans-medium text-gray-900">{presentation.label}</Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <View className="rounded-full bg-gray-100 px-2 py-0.5 min-w-7 items-center">
                          <Text className="text-[11px] font-sans-semibold text-gray-500">{countsByStatus[status]}</Text>
                        </View>
                        {isSelected ? (
                          <Feather name="check" size={14} color={THEME_COLORS.slate700} accessible={false} />
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
