import React, { useState } from 'react';
import { Alert, View, Text, Pressable, StyleSheet, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import RadialStepper from '@/components/common/RadialStepper';
import ProviderInvoiceEditorCard from '../components/ProviderInvoiceEditorCard';
import Button from '@/components/ui/Button';

import type { Booking } from '@/api/bookings';
import { useUpdateBooking, useUpdateInvoiceItems, useConfirmPayment } from '@/api/bookings';
import { BOOKING_STATUSES } from '@/types';
import { getImageUrl } from '@/utils/image';

interface ProviderBookingDetailsScreenProps {
  booking: Booking;
}

function formatDate(dateString: string) {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

function formatTime(timeString: string) {
  if (!timeString) return '';
  if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch {
    return timeString;
  }
}

function SectionDivider() {
  return <View className="h-px bg-gray-100 my-4" />;
}

export default function ProviderBookingDetailsScreen({ booking: initialBooking }: ProviderBookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const updateBooking = useUpdateBooking();
  const updateInvoiceItems = useUpdateInvoiceItems();
  const confirmPayment = useConfirmPayment();

  const [currentStatus, setCurrentStatus] = useState(initialBooking.status);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

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
  const basePriceValue = invoiceData ? Number(invoiceData.sub_total) || 0 : 0;
  const vatValue = invoiceData ? Number(invoiceData.vat) || 0 : 0;
  const totalPrice = invoiceData ? Number(invoiceData.total) || 0 : 0;
  const cancelReason = initialBooking.cancellation_reason;

  const showDetailsCards =
    currentStatus === BOOKING_STATUSES.Pending ||
    currentStatus === BOOKING_STATUSES.Confirmed ||
    currentStatus === BOOKING_STATUSES.InProgress ||
    currentStatus === BOOKING_STATUSES.Completed ||
    currentStatus === BOOKING_STATUSES.PaymentInitiated ||
    currentStatus === BOOKING_STATUSES.Paid;

  const handleStatusUpdate = (status: string, options?: { cancellation_reason?: string }) => {
    updateBooking.mutate(
      { id: initialBooking.id, data: { status: status as any, ...options } },
      {
        onSuccess: (result) => {
          setCurrentStatus(result.status);
        },
      },
    );
  };

  const handleAccept = () => {
    Alert.alert('Accept Booking', 'Are you sure you want to accept this booking?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => handleStatusUpdate('confirmed') },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () =>
          handleStatusUpdate('rejected', {
            cancellation_reason: 'Provider is not available for this booking.',
          }),
      },
    ]);
  };

  const handleJobStarted = () => {
    handleStatusUpdate('in_progress');
  };

  const handleJobCompleted = () => {
    handleStatusUpdate('completed');
  };

  const handleSendInvoice = () => {
    if (invoiceTotal <= 0) {
      Alert.alert('Invalid Invoice', 'Please set a valid invoice amount.');
      return;
    }
    Alert.alert('Send Invoice', `Send invoice for Rs. ${invoiceTotal.toFixed(2)} to the customer?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => handleStatusUpdate('ready_to_pay') },
    ]);
  };

  const handleReceivedPayment = () => {
    Alert.alert('Confirm Payment', 'Have you received the payment from the customer?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Confirm',
        onPress: () => {
          confirmPayment.mutate(
            { bookingId: initialBooking.id, payload: { has_received_payment: true } },
            {
              onSuccess: (result) => {
                setCurrentStatus(result.status);
                Alert.alert('Success', 'Payment confirmed successfully.');
              },
            },
          );
        },
      },
    ]);
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
          title="Booking Details"
          description="Manage this booking and update its status."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <RadialStepper status={currentStatus} role="provider" />

        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
          {/* Customer Section */}
          <View className="flex-row items-center">
            {customerAvatar ? (
              <View className="h-12 w-12 rounded-full bg-gray-100 overflow-hidden">
                <Feather name="user" size={24} color="#cbd5e1" style={{ lineHeight: 48, textAlign: 'center' }} />
              </View>
            ) : (
              <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center">
                <Feather name="user" size={20} color="#485aff" />
              </View>
            )}
            <View className="ml-3 flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-sm font-sans-bold text-gray-900 mr-1">{customerName}</Text>
                <View className="bg-blue-50/70 border border-blue-100/50 rounded px-1.5 py-0.5">
                  <Text className="text-[9px] font-sans-bold text-primary lowercase">{categoryName}</Text>
                </View>
              </View>
              <View className="flex-row items-center mt-0.5">
                <Feather name="star" size={11} color="#f59e0b" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-1">
                  {initialBooking.user?.avg_rating ? Number(initialBooking.user.avg_rating).toFixed(1) : '0.0'}
                </Text>
              </View>
            </View>
          </View>

          {showDetailsCards && (
            <>
              <View className="mt-4 gap-y-2.5">
                <Pressable
                  onPress={() => phoneNumber && Linking.openURL(`tel:${phoneNumber}`)}
                  className="flex-row items-center active:opacity-70"
                >
                  <Feather name="phone" size={13} color="#94a3b8" />
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2">{phoneNumber || '-'}</Text>
                  {phoneNumber ? (
                    <Feather name="external-link" size={10} color="#94a3b8" style={{ marginLeft: 4 }} />
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
                  className="flex-row items-center active:opacity-70"
                >
                  <Feather name="map-pin" size={13} color="#94a3b8" />
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2 flex-1" numberOfLines={1}>
                    {location}
                  </Text>
                  <Feather name="external-link" size={10} color="#94a3b8" style={{ marginLeft: 4 }} />
                </Pressable>
              </View>

              <SectionDivider />

              {/* Booking Details Section */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Feather name="calendar" size={15} color="#485aff" />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">Booking Details</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">Date</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceDate}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">Time</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{startTime}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">Location</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800 flex-1 text-right ml-4" numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                </View>
                {additionalNote ? (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-sans-medium text-gray-500 mb-1">Special Instructions</Text>
                    <Text className="text-xs font-sans-medium text-gray-700 leading-5">{additionalNote}</Text>
                  </View>
                ) : null}
              </View>

              <SectionDivider />

              {/* Service Details Section */}
              <View>
                <View className="flex-row items-center mb-3">
                  <Feather name="briefcase" size={15} color="#485aff" />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">Service Details</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">Service</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceName || categoryName}</Text>
                  </View>
                  {categoryName ? (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-sans-medium text-gray-500">Category</Text>
                      <Text className="text-xs font-sans-semibold text-gray-800">{categoryName}</Text>
                    </View>
                  ) : null}
                  {descriptionText ? (
                    <View className="mt-1">
                      <Text className="text-xs font-sans-medium text-gray-500 mb-1">Description</Text>
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
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">Price Details</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{serviceName || 'Service'} Price</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">
                      Rs. {basePriceValue.toLocaleString()}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vatValue.toLocaleString()}</Text>
                  </View>
                  <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
                    <Text className="text-sm font-sans-bold text-gray-900">Total</Text>
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
                      {currentStatus === BOOKING_STATUSES.Cancelled ? 'Cancellation Details' : 'Rejection Details'}
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
          elevation: 10,
        }}
      >
        {currentStatus === BOOKING_STATUSES.Pending && (
          <View className="flex-row gap-3">
            <Button
              title="Reject"
              variant="outline"
              onPress={handleReject}
              className="flex-1 border-gray-300"
              textClassName="text-gray-600"
            />
            <Button title="Accept" variant="primary" onPress={handleAccept} className="flex-1" />
          </View>
        )}
        {currentStatus === BOOKING_STATUSES.Confirmed && (
          <Button title="Job Started" variant="primary" onPress={handleJobStarted} className="w-full" />
        )}
        {currentStatus === BOOKING_STATUSES.InProgress && (
          <Button title="Job Completed" variant="primary" onPress={handleJobCompleted} className="w-full" />
        )}
        {currentStatus === BOOKING_STATUSES.Completed && (
          <Button title="Send to Customer" variant="primary" onPress={handleSendInvoice} className="w-full" />
        )}
        {currentStatus === BOOKING_STATUSES.PaymentInitiated && (
          <Button
            title="Received Payment"
            variant="primary"
            onPress={handleReceivedPayment}
            className="w-full bg-green-600"
          />
        )}
        {currentStatus === BOOKING_STATUSES.ReadyToPay && (
          <View className="py-2 items-center">
            <Text className="text-sm font-sans-semibold text-gray-500">Waiting for customer payment...</Text>
          </View>
        )}
        {currentStatus === BOOKING_STATUSES.Paid && (
          <View className="py-2 items-center">
            <Text className="text-sm font-sans-semibold text-green-600">Booking Fully Paid & Complete</Text>
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
    elevation: 1,
  },
});
