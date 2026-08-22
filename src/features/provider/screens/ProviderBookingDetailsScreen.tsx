import React, { useState } from 'react';
import { Image, View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import RadialStepper from '@/components/common/RadialStepper';
import ProviderInvoiceEditorCard from '../components/ProviderInvoiceEditorCard';
import Button from '@/components/ui/Button';

import type { Booking } from '@/types';
import { useUpdateBooking, useConfirmPayment } from '@/api';
import { BOOKING_STATUSES } from '@/types';
import { getImageUrl } from '@/utils/image';

import { formatDate, formatTime } from '@/utils/time';

interface ProviderBookingDetailsScreenProps {
  booking: Booking;
}

function SectionDivider() {
  return <View className="h-px bg-gray-100 my-4" />;
}

export default function ProviderBookingDetailsScreen({ booking: initialBooking }: ProviderBookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const updateBooking = useUpdateBooking();
  const confirmPayment = useConfirmPayment();

  const [currentStatus, setCurrentStatus] = useState(initialBooking.status);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const customerName = initialBooking.user?.name || 'Customer';
  const customerAvatar = getImageUrl(initialBooking.user?.avatar) || '';
  const phoneNumber = initialBooking.user?.phone || '';
  const email = initialBooking.user?.email || '';
  const serviceName = initialBooking.service?.name || '';
  const categoryName = initialBooking.service?.category?.name || '';
  const serviceDate = formatDate(initialBooking.service_date || '');
  const startTime = formatTime(initialBooking.start_time || '');
  const location = initialBooking.address || 'Kathmandu Metropolitan City';
  const additionalNote = initialBooking.additional_note;
  const descriptionText = initialBooking.service?.description;
  const invoiceData = initialBooking.invoice;
  const basePriceValue = invoiceData ? Number(invoiceData.sub_total) || 0 : 0;
  const totalPrice = invoiceData ? Number(invoiceData.total) || 0 : 0;
  const cancelReason = initialBooking.cancellation_reason;

  const showDetailsCards =
    currentStatus === BOOKING_STATUSES.Pending ||
    currentStatus === BOOKING_STATUSES.Confirmed ||
    currentStatus === BOOKING_STATUSES.InProgress ||
    currentStatus === BOOKING_STATUSES.Completed ||
    currentStatus === BOOKING_STATUSES.PaymentInitiated ||
    currentStatus === BOOKING_STATUSES.Paid;

  const statusMessages: Record<string, string> = {
    confirmed: t('provider.bookingAccepted'),
    rejected: t('provider.bookingRejected'),
    in_progress: t('provider.jobMarkedInProgress'),
    completed: t('provider.jobMarkedCompleted'),
    ready_to_pay: t('provider.invoiceSent'),
  };

  const handleStatusUpdate = (status: Booking['status'], options?: { cancellation_reason?: string }) => {
    updateBooking.mutate(
      { id: initialBooking.id, data: { status, ...options } },
      {
        onSuccess: (result: Booking) => {
          setCurrentStatus(result.status);
          const msg = statusMessages[status];
          if (msg) showSnackbar({ message: msg, type: 'success' });
        },
      },
    );
  };

  const handleAccept = () => {
    showError({
      title: t('provider.acceptBookingTitle'),
      message: t('provider.acceptBookingConfirm'),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('provider.accept'), onPress: () => handleStatusUpdate(BOOKING_STATUSES.Confirmed) },
      ],
    });
  };

  const handleReject = () => {
    showError({
      title: t('provider.rejectBookingTitle'),
      message: t('provider.rejectBookingConfirm'),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('provider.reject'),
          style: 'destructive',
          onPress: () =>
            handleStatusUpdate(BOOKING_STATUSES.Rejected, {
              cancellation_reason: 'Provider is not available for this booking.',
            }),
        },
      ],
    });
  };

  const handleJobStarted = () => {
    handleStatusUpdate(BOOKING_STATUSES.InProgress);
  };

  const handleJobCompleted = () => {
    handleStatusUpdate(BOOKING_STATUSES.Completed);
  };

  const handleSendInvoice = () => {
    if (invoiceTotal <= 0) {
      showSnackbar({ message: t('provider.validInvoiceAmount'), type: 'error' });
      return;
    }
    showError({
      title: t('provider.sendInvoiceTitle'),
      message: t('provider.sendInvoiceConfirm', { amount: invoiceTotal.toFixed(2) }),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('provider.send'), onPress: () => handleStatusUpdate(BOOKING_STATUSES.ReadyToPay) },
      ],
    });
  };

  const handleReceivedPayment = () => {
    showError({
      title: t('provider.confirmPaymentTitle'),
      message: t('provider.confirmPaymentMessage'),
      actions: [
        { text: t('customer.no'), style: 'cancel' },
        {
          text: t('provider.yesConfirm'),
          onPress: () => {
            confirmPayment.mutate(
              { bookingId: initialBooking.id, payload: { has_received_payment: true } },
              {
                onSuccess: (result: Booking) => {
                  setCurrentStatus(result.status);
                  showSnackbar({ message: t('provider.paymentConfirmed'), type: 'success' });
                },
              },
            );
          },
        },
      ],
    });
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24) + 80,
        }}
      >
        <SectionHeader
          title={t('customer.bookingDetailsTitle')}
          description={t('customer.bookingDetailsDesc')}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <RadialStepper status={currentStatus} role="provider" />

        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
          {/* Customer Section */}
          <View className="flex-row items-center">
            {customerAvatar ? (
              <Image source={{ uri: customerAvatar }} className="h-12 w-12 rounded-full" resizeMode="cover" />
            ) : (
              <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                <Feather name="user" size={20} color="#485aff" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-sm font-sans-bold text-gray-900">{customerName}</Text>
            </View>
          </View>

          {showDetailsCards && (
            <>
              <View className="mt-4 gap-y-2.5">
                <Pressable
                  onPress={() => phoneNumber && Linking.openURL(`tel:${phoneNumber}`)}
                  accessibilityRole="button"
                  className="flex-row items-center active:opacity-70"
                >
                  <Feather name="phone" size={13} color="#94a3b8" accessible={false} />
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2">{phoneNumber || '-'}</Text>
                  {phoneNumber ? (
                    <Feather
                      name="external-link"
                      size={10}
                      color="#94a3b8"
                      style={{ marginLeft: 4 }}
                      accessible={false}
                    />
                  ) : null}
                </Pressable>
                <View className="flex-row items-center">
                  <Feather name="mail" size={13} color="#94a3b8" />
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2">{email || '-'}</Text>
                </View>
              </View>

              <SectionDivider />

              {/* Booking Details Section */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Feather name="calendar" size={15} color="#485aff" />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.bookingDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('provider.date')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceDate}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('provider.time')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{startTime}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('customer.location')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800 flex-1 text-right ml-4" numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                </View>
                {additionalNote ? (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-sans-medium text-gray-500 mb-1">
                      {t('customer.specialInstructions')}
                    </Text>
                    <Text className="text-xs font-sans-medium text-gray-700 leading-5">{additionalNote}</Text>
                  </View>
                ) : null}
              </View>

              <SectionDivider />

              {/* Service Details Section */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Feather name="briefcase" size={15} color="#485aff" />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.serviceDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('provider.service')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceName || categoryName}</Text>
                  </View>
                  {categoryName ? (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-sans-medium text-gray-500">{t('provider.category')}</Text>
                      <Text className="text-xs font-sans-semibold text-gray-800">{categoryName}</Text>
                    </View>
                  ) : null}
                  {descriptionText ? (
                    <View className="mt-1">
                      <Text className="text-xs font-sans-medium text-gray-500 mb-1">{t('provider.description')}</Text>
                      <Text className="text-xs font-sans-medium text-gray-700 leading-5">{descriptionText}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <SectionDivider />

              {/* Price Details Section */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Feather name="tag" size={15} color="#485aff" />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('provider.priceDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{serviceName || 'Service'} Price</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">
                      Rs. {basePriceValue.toLocaleString()}
                    </Text>
                  </View>
                  <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
                    <Text className="text-sm font-sans-bold text-gray-900">{t('provider.total')}</Text>
                    <Text className="text-sm font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Cancellation / Rejection Reason */}
          {(currentStatus === BOOKING_STATUSES.Cancelled || currentStatus === BOOKING_STATUSES.Rejected) &&
            cancelReason && (
              <>
                <SectionDivider />
                <View>
                  <View className="flex-row items-center mb-3">
                    <Feather name="alert-circle" size={15} color="#ef4444" />
                    <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                      {currentStatus === BOOKING_STATUSES.Cancelled
                        ? t('provider.cancellationDetails')
                        : t('provider.rejectionDetails')}
                    </Text>
                  </View>
                  <View className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                    <Text className="text-xs font-sans-medium text-gray-700 leading-5">{cancelReason}</Text>
                  </View>
                </View>
              </>
            )}
        </View>

        {/* Invoice Editor for Completed status */}
        {currentStatus === BOOKING_STATUSES.Completed && (
          <ProviderInvoiceEditorCard
            booking={{
              id: initialBooking.id,
              customerName,
              customerAvatar,
              serviceLabel: serviceName || categoryName,
              location,
              bookingDate: [serviceDate, startTime].filter(Boolean).join(' • '),
              bookedPrice: totalPrice ? `Rs. ${totalPrice.toLocaleString()}` : '',
              status: currentStatus,
            }}
            initialBasePrice={basePriceValue}
            platformFee={0}
            onTotalCalculated={setInvoiceTotal}
          />
        )}
      </ContentLayout>

      {/* Bottom Action Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 0 : 10,
        }}
      >
        {currentStatus === BOOKING_STATUSES.Pending && (
          <View className="flex-row gap-3">
            <Button
              title={t('provider.reject')}
              variant="outline"
              onPress={handleReject}
              className="flex-1 border-gray-300"
              textClassName="text-gray-600"
            />
            <Button title={t('provider.accept')} variant="primary" onPress={handleAccept} className="flex-1" />
          </View>
        )}
        {currentStatus === BOOKING_STATUSES.Confirmed && (
          <Button title={t('provider.jobStarted')} variant="primary" onPress={handleJobStarted} className="w-full" />
        )}
        {currentStatus === BOOKING_STATUSES.InProgress && (
          <Button
            title={t('provider.jobCompleted')}
            variant="primary"
            onPress={handleJobCompleted}
            className="w-full"
          />
        )}
        {currentStatus === BOOKING_STATUSES.Completed && (
          <Button
            title={t('provider.sendToCustomer')}
            variant="primary"
            onPress={handleSendInvoice}
            className="w-full"
          />
        )}
        {currentStatus === BOOKING_STATUSES.PaymentInitiated && (
          <Button
            title={t('provider.receivedPayment')}
            variant="primary"
            onPress={handleReceivedPayment}
            className="w-full bg-green-600"
          />
        )}
        {currentStatus === BOOKING_STATUSES.ReadyToPay && (
          <View className="py-2 items-center">
            <Text className="text-sm font-sans-semibold text-gray-500">{t('provider.waitingForPayment')}</Text>
          </View>
        )}
        {currentStatus === BOOKING_STATUSES.Paid && (
          <View className="py-2 items-center">
            <Text className="text-sm font-sans-semibold text-green-600">{t('provider.bookingPaidComplete')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 0,
  },
});
