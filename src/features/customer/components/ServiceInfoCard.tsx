import React from 'react';
import { View, Text } from 'react-native';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { useTranslation } from 'react-i18next';

interface ServiceInfoCardProps {
  booking: CustomerBookingItem;
}

export default function ServiceInfoCard({ booking }: ServiceInfoCardProps) {
  const { t } = useTranslation();
  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 0,
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
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{t('customer.serviceDetails')}</Text>
      <View className="gap-1">
        {renderInfoRow(t('home.service'), booking.serviceName ?? booking.serviceLabel)}
        {renderInfoRow(t('customer.category'), booking.categoryName ?? booking.serviceLabel)}
        {renderInfoRow(t('customer.description'), booking.descriptionText ?? t('customer.serviceWork'))}
      </View>
    </View>
  );
}
