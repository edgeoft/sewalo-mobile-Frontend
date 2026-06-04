import React from 'react';
import { View, Text } from 'react-native';
import { type CustomerBookingItem } from '../constants/customerBookings';

interface InvoiceSummaryCardProps {
  booking: CustomerBookingItem;
}

export default function InvoiceSummaryCard({ booking }: InvoiceSummaryCardProps) {
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
      <Text className="text-xs font-sans-semibold text-gray-900 text-right flex-1 ml-4">{value}</Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4" style={cardShadow}>
      <Text className="text-base font-sans-bold text-gray-900 mb-3">Invoice Summary</Text>
      <View className="gap-1">
        {renderInfoRow(booking.serviceName ?? booking.serviceLabel, booking.basePrice ?? booking.bookedPrice)}
        {renderInfoRow('Hours Worked', '2 Hours @ Rs. 2,500/hr')}
        {renderInfoRow('Platform Fee', 'Rs. 150')}
        {renderInfoRow('VAT (13%)', booking.vatAmount ?? 'Rs. 650')}
      </View>
    </View>
  );
}
