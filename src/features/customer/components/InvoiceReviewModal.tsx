import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
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
import { formatDate } from '@/utils/time';

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
  onShareInvoice?: () => void;
  isSharingInvoice?: boolean;
  onRejectInvoice?: (reason: string) => void;
  isRejectingInvoice?: boolean;
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
  onShareInvoice,
  isSharingInvoice = false,
  onRejectInvoice,
  isRejectingInvoice = false,
}: InvoiceReviewModalProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleClose = () => {
    setIsRejectMode(false);
    setRejectionReason('');
    setReasonError('');
    onClose();
  };

  const handleSubmitRejection = () => {
    if (!rejectionReason.trim()) {
      setReasonError(t('customer.rejectionReasonRequired', 'Please describe why you are requesting changes.'));
      return;
    }
    setReasonError('');
    onRejectInvoice?.(rejectionReason.trim());
  };

  const invoice = booking.invoice;
  const invoiceId = invoice?.invoice_id || (invoice?.id ? `#${invoice.id.slice(0, 8).toUpperCase()}` : '#INV-001');
  const basePrice = invoice?.sub_total ? Number(invoice.sub_total) : 0;
  const items = invoice?.invoice_items || [];
  const providerName = booking.provider?.name || 'Service Provider';
  const serviceName = booking.service?.name || 'Service';

  const primaryItems = items.filter((item) => item.is_primary_item);
  const mainItems = primaryItems.length > 0 ? primaryItems : items.length > 0 ? [items[0]] : [];
  const mainIdSet = new Set(mainItems.map((item) => item.id));
  const additionalItems = items.filter((item) => !mainIdSet.has(item.id));

  const matchingOffering = booking.service?.service_offerings?.find(
    (offering) =>
      offering?.sub_category?.name &&
      booking.service?.name?.toLowerCase().includes(offering.sub_category.name.toLowerCase()),
  );
  const primaryBillingOpt = matchingOffering?.billing_option || booking.service?.service_offerings?.[0]?.billing_option;
  const billingLabel = primaryBillingOpt?.name || primaryBillingOpt?.label || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.modalOverlay} className="flex-1 bg-black/50 justify-end">
        <View style={{ maxHeight: height * 0.88 }} className="bg-white rounded-t-xl overflow-hidden flex flex-col">
          {/* Header */}
          <View className="px-5 pt-5 pb-4 border-b border-gray-100 flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="flex-row items-center gap-x-2 flex-wrap">
                <Text className="text-lg font-sans-extrabold text-gray-950">{t('customer.invoiceDetails')}</Text>
                {invoiceId ? (
                  <View className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200">
                    <Text className="text-[11px] font-sans-bold text-gray-600 font-mono">
                      #{invoiceId.replace(/^#/, '')}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                {serviceName} • {formatDate(booking.service_date || '')}
              </Text>
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

              {onShareInvoice && (
                <Pressable
                  onPress={onShareInvoice}
                  disabled={isSharingInvoice}
                  accessibilityRole="button"
                  accessibilityLabel={t('customer.shareInvoice')}
                  hitSlop={8}
                  className="h-8 w-8 rounded-lg border border-gray-200 bg-gray-50 active:bg-gray-100 items-center justify-center"
                >
                  {isSharingInvoice ? (
                    <ActivityIndicator size="small" color={THEME_COLORS.slate700} />
                  ) : (
                    <Feather name="share-2" size={13} color={THEME_COLORS.slate700} />
                  )}
                </Pressable>
              )}

              <Pressable
                onPress={handleClose}
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
            {/* Service & Provider Details */}
            <View className="pb-3 border-b border-gray-100 mb-4">
              <Text className="text-[11px] font-sans-bold text-primary uppercase tracking-wider">
                {t('customer.serviceDetails')}
              </Text>
              <Text className="text-sm font-sans-bold text-gray-900 mt-0.5">{serviceName}</Text>
              <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{providerName}</Text>
            </View>

            {/* Section 1: Main Service Charges */}
            <View className="mb-4">
              <View className="flex-row items-center gap-x-2 mb-2 pb-1.5 border-b border-gray-200">
                <View className="w-1.5 h-3.5 rounded-full bg-primary" />
                <Text className="text-xs font-sans-bold text-gray-900 uppercase tracking-wider">
                  {t('customer.invoiceMainServiceCharges', 'Main Service Charges')}
                </Text>
              </View>

              <View className="border border-gray-200 rounded-md overflow-hidden bg-white">
                {/* Table Header */}
                <View className="flex-row bg-gray-50/80 px-3 py-2 border-b border-gray-200">
                  <Text className="flex-1 text-[11px] font-sans-bold text-gray-500">{t('customer.itemName')}</Text>
                  <Text className="w-28 text-center text-[11px] font-sans-bold text-gray-500">
                    {t('customer.invoiceDurationUnits', 'Duration / Units')}
                  </Text>
                  <Text className="w-20 text-right text-[11px] font-sans-bold text-gray-500">
                    {t('customer.amount')}
                  </Text>
                </View>

                {/* Main Service Rows */}
                {mainItems.length > 0 ? (
                  mainItems.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className={`flex-row items-center px-3 py-2.5 ${
                        idx < mainItems.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-sans-semibold text-gray-900 leading-snug">
                          {item.name || serviceName}
                        </Text>
                        {billingLabel ? (
                          <Text className="text-[11px] font-sans-regular text-gray-400 mt-0.5">{billingLabel}</Text>
                        ) : null}
                      </View>
                      <Text className="w-28 text-center text-xs font-sans-medium text-gray-600">{item.quantity}</Text>
                      <Text className="w-20 text-right text-xs font-sans-semibold text-gray-900">
                        Rs. {Number(item.total_amount).toLocaleString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="flex-row items-center px-3 py-2.5">
                    <View className="flex-1 mr-2">
                      <Text className="text-xs font-sans-semibold text-gray-900">{serviceName}</Text>
                      {billingLabel ? (
                        <Text className="text-[11px] font-sans-regular text-gray-400 mt-0.5">{billingLabel}</Text>
                      ) : null}
                    </View>
                    <Text className="w-28 text-center text-xs font-sans-medium text-gray-600">1</Text>
                    <Text className="w-20 text-right text-xs font-sans-semibold text-gray-900">
                      Rs. {basePrice.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Section 2: Additional Charges */}
            <View className="mb-4">
              <View className="flex-row items-center gap-x-2 mb-2 pb-1.5 border-b border-gray-200">
                <View className="w-1.5 h-3.5 rounded-full bg-amber-500" />
                <Text className="text-xs font-sans-bold text-gray-900 uppercase tracking-wider">
                  {t('customer.invoiceAdditionalCharges', 'Additional Charges')}
                </Text>
              </View>

              {additionalItems.length === 0 ? (
                <View className="py-3 px-4 rounded-md border border-dashed border-gray-200 bg-gray-50/50 items-center justify-center">
                  <Text className="text-xs font-sans-medium text-gray-400 text-center">
                    {t('customer.invoiceNoAdditionalCharges', 'No additional charges added.')}
                  </Text>
                </View>
              ) : (
                <View className="border border-gray-200 rounded-md overflow-hidden bg-white">
                  {/* Table Header */}
                  <View className="flex-row bg-gray-50/80 px-3 py-2 border-b border-gray-200">
                    <Text className="flex-1 text-[11px] font-sans-bold text-gray-500">{t('customer.itemName')}</Text>
                    <Text className="w-12 text-center text-[11px] font-sans-bold text-gray-500">
                      {t('customer.qty')}
                    </Text>
                    <Text className="w-20 text-right text-[11px] font-sans-bold text-gray-500">
                      {t('customer.amount')}
                    </Text>
                  </View>

                  {/* Additional Items Rows */}
                  {additionalItems.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      className={`flex-row items-center px-3 py-2.5 ${
                        idx < additionalItems.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-sans-semibold text-gray-900 leading-snug">{item.name}</Text>
                      </View>
                      <Text className="w-12 text-center text-xs font-sans-medium text-gray-600">{item.quantity}</Text>
                      <Text className="w-20 text-right text-xs font-sans-semibold text-gray-900">
                        Rs. {Number(item.total_amount).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Price Summary Breakdown */}
            <View className="bg-gray-50/70 border border-gray-200/80 rounded-md p-3.5 mb-4 gap-y-2">
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
              <View className="bg-white border border-gray-200 rounded-md p-3 mb-4">
                <Text className="text-[11px] font-sans-bold text-gray-500 uppercase tracking-wider mb-1">
                  {t('customer.specialInstructions')}
                </Text>
                <Text className="text-xs font-sans-medium text-gray-700 leading-snug">{invoice.additional_note}</Text>
              </View>
            ) : null}

            {/* Rejection / Dispute Input when in reject mode */}
            {isRejectMode && (
              <View className="bg-red-50/70 border border-red-200 rounded-md p-3.5 mb-2">
                <View className="flex-row items-center gap-x-2 mb-1.5">
                  <Feather name="alert-circle" size={15} color={THEME_COLORS.dangerRed} />
                  <Text className="text-xs font-sans-bold text-gray-900">
                    {t('customer.requestChangesTitle', 'Request Invoice Changes')}
                  </Text>
                </View>
                <Text className="text-[11px] font-sans-regular text-gray-600 mb-2.5 leading-relaxed">
                  {t(
                    'customer.requestChangesDesc',
                    'Explain what needs to be changed in this invoice. The service provider will be notified to revise it.',
                  )}
                </Text>
                <TextInput
                  value={rejectionReason}
                  onChangeText={(text) => {
                    setRejectionReason(text);
                    if (reasonError) setReasonError('');
                  }}
                  placeholder={t(
                    'customer.requestChangesPlaceholder',
                    'e.g. Charged for extra hours not worked, materials already paid, or incorrect rate...',
                  )}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 70, textAlignVertical: 'top' }}
                  className="bg-white border border-gray-200 rounded-lg p-2.5 text-xs font-sans-medium text-gray-900 mb-1"
                />
                {reasonError ? (
                  <Text className="text-[11px] font-sans-medium text-red-600 mt-1">{reasonError}</Text>
                ) : null}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-5 pt-3 pb-6 border-t border-gray-100 bg-white gap-y-2">
            {isRejectMode ? (
              <View className="flex-row items-center gap-x-3">
                <View className="flex-1">
                  <Button
                    title={t('customer.cancelRequest', 'Cancel')}
                    variant="outline"
                    size="md"
                    onPress={() => {
                      setIsRejectMode(false);
                      setReasonError('');
                    }}
                    disabled={isRejectingInvoice}
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title={t('customer.submitRequest', 'Submit Request')}
                    variant="primary"
                    className="bg-red-600 active:bg-red-700"
                    size="md"
                    onPress={handleSubmitRejection}
                    loading={isRejectingInvoice}
                    disabled={isRejectingInvoice}
                  />
                </View>
              </View>
            ) : (
              <>
                <Button
                  title={`${t('customer.proceedToPay')} • Rs. ${totalPayableValue.toLocaleString()}`}
                  variant="primary"
                  size="lg"
                  onPress={() => {
                    onClose();
                    onProceedToPay();
                  }}
                  leftIcon={<Feather name="credit-card" size={16} color={THEME_COLORS.primaryForeground} />}
                />
                {onRejectInvoice && (
                  <Pressable
                    onPress={() => setIsRejectMode(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t('customer.requestChanges')}
                    hitSlop={8}
                    className="py-2 items-center justify-center flex-row gap-x-1.5 rounded-lg active:bg-gray-50"
                  >
                    <Feather name="alert-circle" size={13} color={THEME_COLORS.slate500} />
                    <Text className="text-xs font-sans-semibold text-gray-600">
                      {t('customer.requestChanges', 'Request Changes / Raise Issue')}
                    </Text>
                  </Pressable>
                )}
              </>
            )}
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
