import React from 'react';
import { View, Text } from 'react-native';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { useTranslation } from 'react-i18next';

interface BookingInfoCardProps {
  booking: CustomerBookingItem;
}

export default function BookingInfoCard({ booking }: BookingInfoCardProps) {
  const { t } = useTranslation();
  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  const renderInfoRow = (label: string, value: string) => (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs font-sans-medium text-gray-500">{label}</Text>
      <Text className="text-xs font-sans-semibold text-gray-900 text-right flex-1 ml-4" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4" style={cardShadow}>
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{t('customer.bookingDetails')}</Text>
      <View className="gap-1">
        {renderInfoRow(t('customer.dateAndTime'), booking.dateTime ?? '19 Mar 2026 • 11:20AM')}
        {renderInfoRow(t('customer.location'), booking.location)}
      </View>
      <View className="border-t border-gray-100 my-2" />
      <View className="pt-1">
        <Text className="text-xs font-sans-medium text-gray-500 mb-1">{t('customer.specialInstructions')}</Text>
        <Text className="text-xs font-sans-semibold text-gray-900 leading-relaxed">
          {booking.specialInstructions ?? 'N/A'}
        </Text>
      </View>
    </View>
  );
}
