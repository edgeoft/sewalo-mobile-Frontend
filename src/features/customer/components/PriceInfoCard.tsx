import React from 'react';
import { View, Text } from 'react-native';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { useTranslation } from 'react-i18next';

interface PriceInfoCardProps {
  booking: CustomerBookingItem;
}

export default function PriceInfoCard({ booking }: PriceInfoCardProps) {
  const { t } = useTranslation();

  const renderInfoRow = (label: string, value: string) => (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs font-sans-medium text-gray-500">{label}</Text>
      <Text className="text-xs font-sans-semibold text-gray-900 text-right flex-1 ml-4" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{t('customer.priceDetails')}</Text>
      <View className="gap-1">
        {renderInfoRow(booking.serviceName ?? booking.serviceLabel, booking.basePrice ?? booking.bookedPrice)}
        <View className="border-t border-gray-100 my-2" />
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-base font-sans-bold text-gray-950">{t('customer.total')}</Text>
          <Text className="text-lg font-sans-bold text-gray-950">{booking.totalPrice ?? booking.bookedPrice}</Text>
        </View>
      </View>
    </View>
  );
}
