import React, { useState } from 'react';
import { Alert, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import RadialStepper from '@/components/common/RadialStepper';
import StatusReasonCard from '@/features/customer/components/StatusReasonCard';
import BookingInfoCard from '@/features/customer/components/BookingInfoCard';
import ServiceInfoCard from '@/features/customer/components/ServiceInfoCard';
import CustomerDetailCard from '../components/CustomerDetailCard';
import ProviderInvoiceEditorCard from '../components/ProviderInvoiceEditorCard';
import Button from '@/components/ui/Button';

import { type ProviderBookingItem } from '../constants/providerBookings';
import { BOOKING_STATUSES, type BookingStatus } from '@/types';

interface ProviderBookingDetailsScreenProps {
  booking: ProviderBookingItem;
}

export default function ProviderBookingDetailsScreen({ booking: initialBooking }: ProviderBookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(initialBooking.status);
  const [invoiceTotal, setInvoiceTotal] = useState(0);

  // Mapping to CustomerBookingItem shape for reused components
  const mappedBooking: any = {
    ...initialBooking,
    serviceName: initialBooking.serviceLabel,
    avatarUri: initialBooking.customerAvatar,
    name: initialBooking.customerName,
  };

  const handleAccept = () => {
    Alert.alert('Accept Booking', 'Are you sure you want to accept this booking?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => setCurrentStatus(BOOKING_STATUSES.Confirmed) },
    ]);
  };

  const handleReject = () => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => setCurrentStatus(BOOKING_STATUSES.Rejected) },
    ]);
  };

  const handleJobStarted = () => {
    setCurrentStatus(BOOKING_STATUSES.InProgress);
  };

  const handleJobCompleted = () => {
    setCurrentStatus(BOOKING_STATUSES.Completed);
  };

  const handleSendInvoice = () => {
    Alert.alert('Invoice Sent', `Invoice for Rs. ${invoiceTotal.toFixed(2)} sent to customer.`, [
      { text: 'OK', onPress: () => setCurrentStatus(BOOKING_STATUSES.ReadyToPay) },
    ]);
  };

  const handleReceivedPayment = () => {
    Alert.alert('Payment Received', 'The payment has been confirmed.', [
      { text: 'OK', onPress: () => setCurrentStatus(BOOKING_STATUSES.Paid) },
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
          paddingBottom: Math.max(insets.bottom, 24) + 80, // Clearance for sticky footer
        }}
      >
        <SectionHeader
          title="Booking Details"
          description="Manage this booking and update its status."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <RadialStepper status={currentStatus} role="provider" />

        <View className="gap-4">
          <CustomerDetailCard booking={initialBooking} />

          <StatusReasonCard booking={{ ...initialBooking, status: currentStatus }} />

          {/* Reusing existing cards from customer flow since layout is identical */}
          <BookingInfoCard booking={mappedBooking} />
          <ServiceInfoCard booking={mappedBooking} />

          {currentStatus === BOOKING_STATUSES.Completed && (
            <ProviderInvoiceEditorCard
              booking={initialBooking}
              initialBasePrice={parseFloat(initialBooking.bookedPrice.replace(/[^0-9.]/g, '')) || 0}
              platformFee={150}
              onTotalCalculated={setInvoiceTotal}
            />
          )}
        </View>
      </ContentLayout>

      {/* Action Footer */}
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
