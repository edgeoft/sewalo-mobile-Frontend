import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

interface CompletedBookingSummaryCardProps {
  totalPayableValue: number;
  onDownloadInvoice: () => void;
  onRateProvider?: () => void;
}

export default function CompletedBookingSummaryCard({
  totalPayableValue,
  onDownloadInvoice,
  onRateProvider,
}: CompletedBookingSummaryCardProps) {
  const { t } = useTranslation();
  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  };

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4" style={cardShadow}>
      <View className="flex-row items-center justify-between py-1">
        <Text className="text-base font-sans-bold text-gray-900">{t('customer.totalPaid')}</Text>
        <Text className="text-lg font-sans-bold text-gray-900">Rs. {totalPayableValue.toLocaleString()}</Text>
      </View>

      {/* Buttons */}
      <View className="mt-4 gap-3">
        <Button
          title={t('customer.downloadInvoice')}
          onPress={onDownloadInvoice}
          className="border-gray-200 bg-white active:bg-gray-50 h-12"
          textClassName="text-gray-900 font-sans-semibold"
          leftIcon={<Feather name="download" size={16} color="#0f172a" />}
        />
        {onRateProvider && (
          <Button
            title={t('customer.rateProvider')}
            variant="primary"
            onPress={onRateProvider}
            className="h-12"
            leftIcon={<Feather name="star" size={16} color="#ffffff" />}
          />
        )}
      </View>
    </View>
  );
}
