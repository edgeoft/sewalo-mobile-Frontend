import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';
import { useSnackbar } from '@/components/ui/Snackbar';

interface StatusReasonCardProps {
  booking: {
    status: BookingStatus;
    cancelReason?: string;
    rejectReason?: string;
    dateTime?: string;
    bookingDate?: string;
  };
}

export default function StatusReasonCard({ booking }: StatusReasonCardProps) {
  const { showSnackbar } = useSnackbar();
  const { status, cancelReason, rejectReason, dateTime, bookingDate } = booking;
  const isCancelled = status === BOOKING_STATUSES.Cancelled;
  const isRejected = status === BOOKING_STATUSES.Rejected;

  if (!isCancelled && !isRejected) return null;

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  const title = isCancelled ? 'Cancellation Details' : 'Rejection Details';
  const dateValue = dateTime || bookingDate || '30 May 2026 • 4:15 PM';
  const displayReason =
    cancelReason ||
    rejectReason ||
    (isCancelled ? 'No cancellation reason provided.' : 'No rejection reason provided.');

  const handleContactSupport = () => {
    showSnackbar({ message: 'Connecting to Sewalo support agent...', type: 'info' });
  };

  const renderInfoRow = (label: string, value: string) => (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs font-sans-medium text-gray-500">{label}</Text>
      <Text className="text-xs font-sans-semibold text-gray-900 text-right flex-1 ml-4" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4" style={cardShadow}>
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{title}</Text>

      <View className="gap-1">{renderInfoRow('Date & Time', dateValue)}</View>

      <View className="border-t border-gray-100 my-2" />

      <View className="pt-1">
        <Text className="text-xs font-sans-medium text-gray-500 mb-1">Reason</Text>
        <Text className="text-xs font-sans-semibold text-gray-900 leading-relaxed">{displayReason}</Text>
      </View>

      <View className="border-t border-gray-100 mt-3 pt-3 flex-row justify-between items-center">
        <Text className="text-[11px] font-sans-medium text-gray-400">Need assistance?</Text>
        <Pressable onPress={handleContactSupport} className="active:opacity-75">
          <Text className="text-[11px] font-sans-semibold text-blue-600">Contact Support</Text>
        </Pressable>
      </View>
    </View>
  );
}
