import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { type ProviderBookingItem } from '../constants/providerBookings';
import { useTranslation } from 'react-i18next';

interface ProviderInvoiceEditorCardProps {
  booking: ProviderBookingItem;
  initialBasePrice: number;
  platformFee: number;
  onTotalCalculated: (total: number) => void;
}

export default function ProviderInvoiceEditorCard({
  booking,
  initialBasePrice,
  platformFee,
  onTotalCalculated,
}: ProviderInvoiceEditorCardProps) {
  const { t } = useTranslation();
  const [basePrice, setBasePrice] = useState(initialBasePrice.toString());

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  const parsedBasePrice = parseFloat(basePrice) || 0;
  const vatValue = (parsedBasePrice + platformFee) * 0.13;
  const total = parsedBasePrice + platformFee + vatValue;

  // Sync total whenever it changes
  React.useEffect(() => {
    onTotalCalculated(total);
  }, [total, onTotalCalculated]);

  const renderInfoRow = (label: string, value: string) => (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs font-sans-medium text-gray-500">{label}</Text>
      <Text className="text-xs font-sans-semibold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4" style={cardShadow}>
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{t('provider.editInvoiceDetails')}</Text>

      <View className="gap-1">
        {/* Editable Base Price */}
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-xs font-sans-medium text-gray-500">{t('services.serviceCost')}</Text>
          <View className="flex-row items-center border border-gray-200 rounded-lg px-2 py-0.5 bg-gray-50">
            <Text className="text-xs font-sans-semibold text-gray-900 mr-1">Rs.</Text>
            <TextInput
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              className="text-xs font-sans-semibold text-gray-900 min-w-[60px] text-right p-0"
            />
          </View>
        </View>

        {renderInfoRow(t('services.platformFee'), `Rs. ${platformFee.toLocaleString()}`)}
        {renderInfoRow(t('services.vat'), `Rs. ${vatValue.toFixed(2)}`)}

        <View className="border-t border-gray-100 my-2" />

        <View className="flex-row items-center justify-between py-1">
          <Text className="text-base font-sans-bold text-gray-900">{t('services.totalPayable')}</Text>
          <Text className="text-lg font-sans-bold text-primary">Rs. {total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}
