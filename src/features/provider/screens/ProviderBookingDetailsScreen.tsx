import React, { useState } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { Image } from 'expo-image';
import { View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
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
import { useUpdateBooking, useConfirmPayment, useDownloadInvoice } from '@/api';
import { BOOKING_STATUSES } from '@/constants/bookings';
import { getImageUrl } from '@/utils/image';

import { formatDate, formatTime } from '@/utils/time';

interface ProviderBookingDetailsScreenProps {
  booking: Booking;
}

function SectionDivider() {
  return <View className="h-px bg-gray-200 my-5" />;
}

export default function ProviderBookingDetailsScreen({ booking: initialBooking }: ProviderBookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const updateBooking = useUpdateBooking();
  const confirmPayment = useConfirmPayment();
  const downloadInvoice = useDownloadInvoice();

  const [optimisticStatus, setOptimisticStatus] = useState<Booking['status'] | null>(null);
  const currentStatus = optimisticStatus ?? initialBooking.status;
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
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
  const coordinates = initialBooking.coordinates;
  const additionalNote = initialBooking.additional_note;
  const descriptionText = initialBooking.service?.description;
  const invoiceData = initialBooking.invoice;
  const allInvoiceItems = invoiceData?.invoice_items || [];
  const primaryInvoiceItems = allInvoiceItems.filter((item) => item.is_primary_item);
  const mainInvoiceItems =
    primaryInvoiceItems.length > 0 ? primaryInvoiceItems : allInvoiceItems.length > 0 ? [allInvoiceItems[0]] : [];

  const matchingOffering = initialBooking.service?.service_offerings?.find(
    (offering) =>
      offering?.sub_category?.name &&
      (initialBooking.service?.name?.toLowerCase().includes(offering.sub_category.name.toLowerCase()) ||
        mainInvoiceItems[0]?.name?.toLowerCase().includes(offering.sub_category.name.toLowerCase())),
  );
  const primaryBillingOpt =
    matchingOffering?.billing_option || initialBooking.service?.service_offerings?.[0]?.billing_option;
  const billingLabel = primaryBillingOpt?.name || primaryBillingOpt?.label?.replace(/[()]/g, '') || '';

  const bookedServiceName =
    mainInvoiceItems[0]?.name ||
    initialBooking.service?.service_offerings?.[0]?.sub_category?.name ||
    serviceName ||
    t('provider.service', 'Service');

  const basePriceValue = invoiceData ? Number(invoiceData.sub_total) || 0 : 0;
  const totalPrice = invoiceData ? Number(invoiceData.total) || 0 : 0;
  const cancelReason = initialBooking.cancellation_reason;

  const hasInvoiceSection =
    currentStatus === BOOKING_STATUSES.Completed ||
    currentStatus === BOOKING_STATUSES.ReadyToPay ||
    currentStatus === BOOKING_STATUSES.PaymentInitiated ||
    currentStatus === BOOKING_STATUSES.Paid;

  const showDetailsCards =
    currentStatus === BOOKING_STATUSES.Pending ||
    currentStatus === BOOKING_STATUSES.Confirmed ||
    currentStatus === BOOKING_STATUSES.InProgress ||
    currentStatus === BOOKING_STATUSES.Completed ||
    currentStatus === BOOKING_STATUSES.ReadyToPay ||
    currentStatus === BOOKING_STATUSES.PaymentInitiated ||
    currentStatus === BOOKING_STATUSES.Paid;

  const statusMessages: Record<string, string> = {
    [BOOKING_STATUSES.Confirmed]: t('provider.bookingAccepted'),
    [BOOKING_STATUSES.Rejected]: t('provider.bookingRejected'),
    [BOOKING_STATUSES.InProgress]: t('provider.jobMarkedInProgress'),
    [BOOKING_STATUSES.Completed]: t('provider.jobMarkedCompleted'),
    [BOOKING_STATUSES.ReadyToPay]: t('provider.invoiceSent'),
  };

  const handleStatusUpdate = (status: Booking['status'], options?: { cancellation_reason?: string }) => {
    updateBooking.mutate(
      { id: initialBooking.id, data: { status, ...options } },
      {
        onSuccess: (result: Booking) => {
          setOptimisticStatus(result.status);
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
    const amountToSend = invoiceTotal > 0 ? invoiceTotal : totalPrice;
    if (amountToSend <= 0) {
      showSnackbar({ message: t('provider.validInvoiceAmount'), type: 'error' });
      return;
    }
    showError({
      title: t('provider.sendInvoiceTitle'),
      message: t('provider.sendInvoiceConfirm', { amount: amountToSend.toLocaleString() }),
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
                  setOptimisticStatus(result.status);
                  showSnackbar({ message: t('provider.paymentConfirmed'), type: 'success' });
                },
              },
            );
          },
        },
      ],
    });
  };

  const handleDownloadInvoice = () => {
    const id = invoiceData?.id || initialBooking.invoice?.id;
    if (!id) return;
    downloadInvoice.mutate(id, {
      onSuccess: () => {
        showSnackbar({ message: t('provider.invoiceDownloaded', 'Invoice downloaded successfully.'), type: 'success' });
      },
      onError: (error) => {
        showSnackbar({ message: error.message || t('errors.generic'), type: 'error' });
      },
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
          {/* Customer Details Section */}
          <View className="flex-row items-center mb-3">
            <Feather name="user" size={15} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-bold text-gray-900 ml-2">
              {t('provider.customerInfo', 'Customer Details')}
            </Text>
          </View>

          <View className="flex-row items-center">
            {customerAvatar ? (
              <Image
                source={{ uri: customerAvatar }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                className="h-12 w-12 rounded-full shrink-0"
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                <Feather name="user" size={20} color={THEME_COLORS.primary} />
              </View>
            )}
            <View className="ml-3 flex-1">
              <Text className="text-sm font-sans-bold text-gray-900">{customerName}</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                {t('provider.customer', 'Customer')}
              </Text>
            </View>
          </View>

          {showDetailsCards && (
            <>
              <View className="mt-2.5 gap-y-2">
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
                <Pressable
                  onPress={() => {
                    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
                    if (coordinates) {
                      Linking.openURL(
                        `${scheme}${coordinates.lat},${coordinates.lng}?q=${encodeURIComponent(location)}`,
                      );
                    } else {
                      Linking.openURL(`${scheme}0,0?q=${encodeURIComponent(location)}`);
                    }
                  }}
                  accessibilityRole="button"
                  className="flex-row items-center active:opacity-70"
                >
                  <Feather name="map-pin" size={13} color="#94a3b8" accessible={false} />
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2 flex-1" numberOfLines={1}>
                    {location}
                  </Text>
                  <Feather
                    name="external-link"
                    size={10}
                    color="#94a3b8"
                    style={{ marginLeft: 4 }}
                    accessible={false}
                  />
                </Pressable>
              </View>

              <SectionDivider />

              {/* Booking Details Section */}
              <View>
                <View className="flex-row items-center mb-2.5">
                  <Feather name="calendar" size={15} color={THEME_COLORS.primary} />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.bookingDetails')}</Text>
                </View>
                <View className="gap-y-2">
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
                  <View className="mt-2.5 pt-2 border-t border-gray-100">
                    <Text className="text-xs font-sans-medium text-gray-500 mb-0.5">
                      {t('customer.specialInstructions')}
                    </Text>
                    <Text className="text-xs font-sans-medium text-gray-700 leading-snug">{additionalNote}</Text>
                  </View>
                ) : null}
              </View>

              <SectionDivider />

              {/* Service Details Section */}
              <View>
                <View className="flex-row items-center mb-2.5">
                  <Feather name="briefcase" size={15} color={THEME_COLORS.primary} />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.serviceDetails')}</Text>
                </View>
                <View className="gap-y-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('provider.service')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">
                      {bookedServiceName || serviceName || categoryName}
                    </Text>
                  </View>
                  {categoryName ? (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-sans-medium text-gray-500">{t('provider.category')}</Text>
                      <Text className="text-xs font-sans-semibold text-gray-800">{categoryName}</Text>
                    </View>
                  ) : null}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('customer.location')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800 flex-1 text-right ml-4" numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                  {descriptionText ? (
                    <View className="mt-1">
                      <Text className="text-xs font-sans-medium text-gray-500 mb-0.5">{t('provider.description')}</Text>
                      <Text className="text-xs font-sans-medium text-gray-700 leading-snug">{descriptionText}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {!hasInvoiceSection && (
                <>
                  <SectionDivider />

                  {/* Price Details Section (Only shown before invoice exists) */}
                  <View>
                    <View className="flex-row items-center mb-2.5">
                      <Feather name="tag" size={15} color={THEME_COLORS.primary} />
                      <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('provider.priceDetails')}</Text>
                    </View>
                    <View className="gap-y-2">
                      {mainInvoiceItems.length > 0 ? (
                        mainInvoiceItems.map((item, idx) => {
                          const itemAmount =
                            Number(item.total_amount) ||
                            Number(item.unit_price) * (item.quantity || 1) ||
                            basePriceValue;
                          return (
                            <View key={item.id || idx} className="flex-row justify-between items-start">
                              <View className="flex-1 mr-3">
                                <Text className="text-xs font-sans-medium text-gray-700">{item.name}</Text>
                                {billingLabel ? (
                                  <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                                    {billingLabel}
                                    {item.quantity && item.quantity > 1 ? ` • Qty: ${item.quantity}` : ''}
                                  </Text>
                                ) : null}
                              </View>
                              <Text className="text-xs font-sans-bold text-gray-800">
                                Rs. {itemAmount.toLocaleString()}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <View className="flex-row justify-between items-start">
                          <View className="flex-1 mr-3">
                            <Text className="text-xs font-sans-medium text-gray-700">{bookedServiceName}</Text>
                            {billingLabel ? (
                              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">{billingLabel}</Text>
                            ) : null}
                          </View>
                          <Text className="text-xs font-sans-bold text-gray-800">
                            Rs. {basePriceValue.toLocaleString()}
                          </Text>
                        </View>
                      )}
                      <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
                        <Text className="text-sm font-sans-bold text-gray-900">{t('provider.total')}</Text>
                        <Text className="text-sm font-sans-extrabold text-primary">
                          Rs. {totalPrice.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
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

        {/* Customer Rejection / Conflict Alert Banner */}
        {currentStatus === BOOKING_STATUSES.Completed && Boolean(cancelReason) && (
          <View className="mb-5 p-3.5 rounded-lg border border-red-200 bg-red-50/80 flex-row items-start gap-x-2.5">
            <Feather name="alert-triangle" size={15} color={THEME_COLORS.dangerRed} style={{ marginTop: 2 }} />
            <View className="flex-1 gap-y-1">
              <Text className="text-xs font-sans-semibold text-red-950">
                {t('provider.invoiceRejectedTitle', 'Customer Requested Changes to Invoice')}
              </Text>
              <Text className="text-xs font-sans-medium text-red-950 leading-tight">&ldquo;{cancelReason}&rdquo;</Text>
              <Text className="text-xs font-sans-regular text-red-900/80 leading-snug">
                {t(
                  'provider.invoiceRejectedAction',
                  'Please edit the line items or pricing below, save the changes, and click "Send Invoice" to resubmit.',
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Invoice Section for Completed, ReadyToPay, PaymentInitiated, Paid statuses */}
        {(currentStatus === BOOKING_STATUSES.Completed ||
          currentStatus === BOOKING_STATUSES.ReadyToPay ||
          currentStatus === BOOKING_STATUSES.PaymentInitiated ||
          currentStatus === BOOKING_STATUSES.Paid) && (
          <ProviderInvoiceEditorCard
            key={`${initialBooking.id}-${initialBooking.invoice?.id || 'inv'}-${initialBooking.invoice?.updated_at || 'date'}`}
            booking={initialBooking}
            canEdit={currentStatus === BOOKING_STATUSES.Completed}
            isEditing={currentStatus === BOOKING_STATUSES.Completed ? isEditingInvoice : false}
            onToggleEdit={currentStatus === BOOKING_STATUSES.Completed ? setIsEditingInvoice : () => {}}
            onTotalCalculated={setInvoiceTotal}
            onDownloadInvoice={invoiceData?.id ? handleDownloadInvoice : undefined}
            isDownloadingInvoice={downloadInvoice.isPending}
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
              size="sm"
              onPress={handleReject}
              className="flex-1 min-h-[42px] h-10 border-red-200 bg-red-50/70 active:bg-red-100"
              textClassName="text-red-600 font-sans-bold text-xs"
            />
            <Button
              title={t('provider.accept')}
              variant="primary"
              size="sm"
              onPress={handleAccept}
              className="flex-1 min-h-[42px] h-10"
              textClassName="text-primary-foreground font-sans-bold text-xs"
            />
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
            title={t('provider.sendInvoice')}
            variant="primary"
            onPress={handleSendInvoice}
            loading={updateBooking.isPending}
            className="w-full"
            leftIcon={!updateBooking.isPending ? <Feather name="send" size={14} color="#ffffff" /> : null}
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
