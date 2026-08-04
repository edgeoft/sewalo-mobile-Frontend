import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { type CustomerBookingItem } from '../constants/customerBookings';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

interface FinalInvoiceCardProps {
  booking: CustomerBookingItem;
  basePriceValue: number;
  platformFeeValue: number;
  vatValue: number;
  couponDiscountValue: number;
  loyaltyDiscountValue: number;
  totalPayableValue: number;
  onPayNow: () => void;
  onDownloadInvoice: () => void;
}

export default function FinalInvoiceCard({
  booking,
  basePriceValue,
  platformFeeValue,
  vatValue,
  couponDiscountValue,
  loyaltyDiscountValue,
  totalPayableValue,
  onPayNow,
  onDownloadInvoice,
}: FinalInvoiceCardProps) {
  const { t } = useTranslation();

  const renderInvoiceRow = (label: string, value: string, isDiscount = false) => (
    <View className="flex-row items-center justify-between py-1">
      <Text className="text-xs font-sans-medium text-gray-500">{label}</Text>
      <Text className={`text-xs font-sans-semibold ${isDiscount ? 'text-emerald-600' : 'text-gray-900'}`}>
        {isDiscount ? `- Rs. ${value}` : `Rs. ${value}`}
      </Text>
    </View>
  );

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4">
      <Text className="text-base font-sans-bold text-gray-900 mb-3">{t('customer.finalInvoice')}</Text>

      <View className="gap-0.5">
        {renderInvoiceRow(booking.serviceName ?? booking.serviceLabel, basePriceValue.toLocaleString())}
        {renderInvoiceRow(t('customer.platformFee'), platformFeeValue.toLocaleString())}
        {renderInvoiceRow(t('customer.vat'), vatValue.toLocaleString())}

        {couponDiscountValue > 0 &&
          renderInvoiceRow(t('customer.couponDiscount'), couponDiscountValue.toLocaleString(), true)}
        {loyaltyDiscountValue > 0 &&
          renderInvoiceRow(t('customer.loyaltyDiscount'), loyaltyDiscountValue.toLocaleString(), true)}

        <View className="border-t border-gray-100 my-2" />

        <View className="flex-row items-center justify-between py-1">
          <Text className="text-base font-sans-bold text-gray-900">{t('customer.total')}</Text>
          <Text className="text-lg font-sans-bold text-gray-900">Rs. {totalPayableValue.toLocaleString()}</Text>
        </View>
      </View>

      <View className="mt-4 gap-3">
        <Button
          title={t('customer.downloadInvoice')}
          onPress={onDownloadInvoice}
          className="border-gray-200 bg-white active:bg-gray-50 h-12"
          textClassName="text-gray-900 font-sans-semibold"
          leftIcon={<Feather name="download" size={16} color={THEME_COLORS.slate900} />}
        />
        <Button title="Pay Now" variant="primary" onPress={onPayNow} className="h-12" />
      </View>
    </View>
  );
}
