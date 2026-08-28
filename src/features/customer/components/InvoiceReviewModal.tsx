import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';
import type { Booking } from '@/types';
import Button from '@/components/ui/Button';

interface InvoiceReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onProceedToPay: () => void;
  booking: Booking;
  couponDiscountValue?: number;
  loyaltyDiscountValue?: number;
  platformFeeValue?: number;
  totalPayableValue: number;
  onDownloadInvoice: () => void;
  isDownloadingInvoice?: boolean;
}

export default function InvoiceReviewModal({
  visible,
  onClose,
  onProceedToPay,
  booking,
  couponDiscountValue = 0,
  loyaltyDiscountValue = 0,
  platformFeeValue = 0,
  totalPayableValue,
  onDownloadInvoice,
  isDownloadingInvoice = false,
}: InvoiceReviewModalProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const invoice = booking.invoice;
  const invoiceId = invoice?.invoice_id || (invoice?.id ? `#${invoice.id.slice(0, 8).toUpperCase()}` : '#INV-001');
  const basePrice = invoice?.sub_total ? Number(invoice.sub_total) : 0;
  const items = invoice?.invoice_items || [];
  const providerName = booking.provider?.name || 'Service Provider';
  const serviceName = booking.service?.name || 'Service';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/50 justify-end">
        <View style={{ maxHeight: height * 0.88 }} className="bg-white rounded-t-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <View className="px-5 pt-5 pb-4 border-b border-gray-100 flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-lg font-sans-extrabold text-gray-950">{t('customer.invoiceDetails')}</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">{invoiceId}</Text>
            </View>

            <View className="flex-row items-center gap-x-2">
              <Pressable
                onPress={onDownloadInvoice}
                disabled={isDownloadingInvoice}
                accessibilityRole="button"
                accessibilityLabel={t('customer.downloadInvoice')}
                hitSlop={8}
                className="h-8 px-2.5 rounded-lg border border-primary/20 bg-primary/5 active:bg-primary/10 flex-row items-center gap-x-1.5"
              >
                {isDownloadingInvoice ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.primary} />
                ) : (
                  <>
                    <Feather name="download" size={13} color={THEME_COLORS.primary} />
                    <Text className="text-[11px] font-sans-bold text-primary">PDF</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="h-8 w-8 bg-gray-100 rounded-full items-center justify-center active:bg-gray-200"
              >
                <Feather name="x" size={16} color={THEME_COLORS.slate500} />
              </Pressable>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          >
            {/* Provider & Service Info Card */}
            <View className="bg-surface-indigo-subtle border border-indigo-100/60 rounded-xl p-3.5 mb-4">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-[11px] font-sans-bold text-primary uppercase tracking-wider">
                  {t('customer.serviceDetails')}
                </Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">{booking.service_date}</Text>
              </View>
              <Text className="text-sm font-sans-bold text-gray-900 leading-tight">{serviceName}</Text>
              <Text className="text-xs font-sans-medium text-gray-600 mt-0.5">{providerName}</Text>
            </View>

            {/* Itemized Charges Section */}
            <View className="mb-4">
              <Text className="text-xs font-sans-bold text-gray-900 uppercase tracking-wide mb-2">
                {t('customer.itemizedCharges')}
              </Text>

              <View className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                {/* Table Header */}
                <View className="flex-row bg-gray-50/80 px-3 py-2 border-b border-gray-200">
                  <Text className="flex-1 text-[11px] font-sans-bold text-gray-500">{t('customer.itemName')}</Text>
                  <Text className="w-12 text-center text-[11px] font-sans-bold text-gray-500">{t('customer.qty')}</Text>
                  <Text className="w-20 text-right text-[11px] font-sans-bold text-gray-500">
                    {t('customer.amount')}
                  </Text>
                </View>

                {/* Table Rows */}
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className={`flex-row items-center px-3 py-2.5 ${
                        idx < items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-sans-semibold text-gray-900 leading-snug">{item.name}</Text>
                        <Text className="text-[10px] font-sans-medium text-gray-400">
                          @ Rs. {Number(item.unit_price).toLocaleString()}
                        </Text>
                      </View>
                      <Text className="w-12 text-center text-xs font-sans-medium text-gray-600">{item.quantity}</Text>
                      <Text className="w-20 text-right text-xs font-sans-semibold text-gray-900">
                        Rs. {Number(item.total_amount).toLocaleString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="flex-row items-center px-3 py-2.5">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-sans-semibold text-gray-900">{serviceName}</Text>
                      <Text className="text-[10px] font-sans-medium text-gray-400">{t('customer.basePrice')}</Text>
                    </View>
                    <Text className="w-12 text-center text-xs font-sans-medium text-gray-600">1</Text>
                    <Text className="w-20 text-right text-xs font-sans-semibold text-gray-900">
                      Rs. {basePrice.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Price Summary Breakdown */}
            <View className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 mb-4 gap-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs font-sans-medium text-gray-500">{t('customer.subtotal')}</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
              </View>

              {platformFeeValue > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.platformFee')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">
                    Rs. {platformFeeValue.toLocaleString()}
                  </Text>
                </View>
              )}

              {couponDiscountValue > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-sans-medium text-emerald-600">{t('customer.couponDiscount')}</Text>
                  <Text className="text-xs font-sans-semibold text-emerald-600">
                    - Rs. {couponDiscountValue.toLocaleString()}
                  </Text>
                </View>
              )}

              {loyaltyDiscountValue > 0 && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-sans-medium text-emerald-600">{t('customer.loyaltyDiscount')}</Text>
                  <Text className="text-xs font-sans-semibold text-emerald-600">
                    - Rs. {loyaltyDiscountValue.toLocaleString()}
                  </Text>
                </View>
              )}

              <View className="border-t border-gray-200 pt-2.5 flex-row justify-between items-center">
                <Text className="text-sm font-sans-bold text-gray-900">{t('customer.totalPayable')}</Text>
                <Text className="text-base font-sans-extrabold text-primary">
                  Rs. {totalPayableValue.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Additional Notes (if any) */}
            {invoice?.additional_note ? (
              <View className="bg-white border border-gray-100 rounded-xl p-3 mb-2">
                <Text className="text-[11px] font-sans-bold text-gray-500 uppercase tracking-wider mb-1">
                  {t('customer.specialInstructions')}
                </Text>
                <Text className="text-xs font-sans-medium text-gray-700 leading-snug">{invoice.additional_note}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-5 pt-3 pb-6 border-t border-gray-100 bg-white">
            <Button
              title={`${t('customer.proceedToPay')} • Rs. ${totalPayableValue.toLocaleString()}`}
              variant="primary"
              size="lg"
              onPress={() => {
                onClose();
                onProceedToPay();
              }}
              leftIcon={<Feather name="credit-card" size={16} color="#ffffff" />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
