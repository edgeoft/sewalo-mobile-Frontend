import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import { type CustomerBookingItem } from '../constants/customerBookings';
import RadialStepper from '../components/RadialStepper';
import BookingProviderCard from '../components/BookingProviderCard';
import BookingInfoCard from '../components/BookingInfoCard';
import ServiceInfoCard from '../components/ServiceInfoCard';
import PriceInfoCard from '../components/PriceInfoCard';
import InvoiceSummaryCard from '../components/InvoiceSummaryCard';
import DiscountLoyaltyCard, { type Coupon } from '../components/DiscountLoyaltyCard';
import FinalInvoiceCard from '../components/FinalInvoiceCard';
import CompletedBookingSummaryCard from '../components/CompletedBookingSummaryCard';
import PaymentOptionsModal, { type PaymentOption } from '../components/PaymentOptionsModal';
import { BOOKING_STATUSES } from '@/types';

interface BookingDetailsScreenProps {
  booking: CustomerBookingItem;
}

const AVAILABLE_COUPONS: Coupon[] = [
  { code: 'SEWALO10', description: '10% off service cost', discountType: 'percent', value: 10 },
  { code: 'WELCOME500', description: 'Rs. 500 flat off', discountType: 'fixed', value: 500 },
];

export default function BookingDetailsScreen({ booking }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();

  // Invoice & discount states
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<string>('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const loyaltyBalance = 250;
  const pointsRate = 2; // 1 point = Rs. 2

  // Parsing values safely
  const basePriceValue = parseFloat((booking.basePrice || booking.bookedPrice)?.replace(/[^0-9.]/g, '') || '5000');
  const platformFeeValue = 150;

  // Coupon discount calculation
  let couponDiscountValue = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discountType === 'percent') {
      couponDiscountValue = basePriceValue * (selectedCoupon.value / 100);
    } else {
      couponDiscountValue = selectedCoupon.value;
    }
  }

  // Loyalty points discount calculation
  const loyaltyPointsNum = parseInt(loyaltyPoints) || 0;
  const loyaltyDiscountValue = loyaltyPointsNum * pointsRate;

  // Invoice calculation logic
  const subtotal = Math.max(0, basePriceValue + platformFeeValue - couponDiscountValue - loyaltyDiscountValue);
  const vatValue = subtotal * 0.13;
  const totalPayableValue = subtotal + vatValue;

  const handleLoyaltyPointsChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const points = parseInt(numericText) || 0;

    if (points > loyaltyBalance) {
      Alert.alert('Limit Exceeded', `You only have ${loyaltyBalance} loyalty points.`);
      setLoyaltyPoints(loyaltyBalance.toString());
      return;
    }

    // Check if points discount exceeds invoice total
    const pointsVal = points * pointsRate;
    const maxAllowedDiscount = basePriceValue + platformFeeValue - couponDiscountValue;
    if (pointsVal > maxAllowedDiscount) {
      const maxPoints = Math.floor(maxAllowedDiscount / pointsRate);
      Alert.alert('Limit Exceeded', `You can only redeem up to ${maxPoints} points for this invoice.`);
      setLoyaltyPoints(maxPoints.toString());
      return;
    }

    setLoyaltyPoints(numericText);
  };

  const handlePayNow = () => {
    setIsPaymentModalVisible(true);
  };

  const handlePaymentConfirm = (option: PaymentOption) => {
    setIsPaymentModalVisible(false);
    Alert.alert(
      'Proceed to Payment',
      `You are paying Rs. ${totalPayableValue.toLocaleString()} via ${
        option === 'cash' ? 'Cash' : 'eSewa'
      } for ${booking.serviceLabel}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay', onPress: () => Alert.alert('Success', 'Payment completed successfully!') },
      ],
    );
  };

  const handleDownloadInvoice = () => {
    Alert.alert('Invoice Downloaded', 'The invoice PDF has been saved to your downloads.');
  };

  const handleRateProvider = () => {
    Alert.alert('Rate Provider', 'Rating modal will open here.');
  };

  const showDetailsCards =
    booking.status === BOOKING_STATUSES.Pending ||
    booking.status === BOOKING_STATUSES.Confirmed ||
    booking.status === BOOKING_STATUSES.InProgress ||
    booking.status === BOOKING_STATUSES.Completed ||
    booking.status === BOOKING_STATUSES.PaymentInitiated ||
    booking.status === BOOKING_STATUSES.Paid;

  const isReadyToPay = booking.status === BOOKING_STATUSES.ReadyToPay;

  const isPaymentCompletedOrInitiated =
    booking.status === BOOKING_STATUSES.Completed ||
    booking.status === BOOKING_STATUSES.PaymentInitiated ||
    booking.status === BOOKING_STATUSES.Paid;

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="Booking Details"
          description="View status and progression of your booking."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Progress Tracker (Radial Stepper) */}
        <RadialStepper status={booking.status} />

        <View className="gap-4">
          {/* Provider Details Card */}
          <BookingProviderCard booking={booking} />

          {/* Dynamic Detail Sections (Visible till Completed) */}
          {showDetailsCards && (
            <>
              <BookingInfoCard booking={booking} />
              <ServiceInfoCard booking={booking} />
              <PriceInfoCard booking={booking} />
            </>
          )}

          {/* Ready to Pay Invoicing Flow */}
          {isReadyToPay && (
            <>
              <InvoiceSummaryCard booking={booking} />
              <DiscountLoyaltyCard
                selectedCoupon={selectedCoupon}
                onSelectCoupon={setSelectedCoupon}
                loyaltyPoints={loyaltyPoints}
                onChangeLoyaltyPoints={handleLoyaltyPointsChange}
                loyaltyBalance={loyaltyBalance}
                pointsRate={pointsRate}
                availableCoupons={AVAILABLE_COUPONS}
              />
              <FinalInvoiceCard
                booking={booking}
                basePriceValue={basePriceValue}
                platformFeeValue={platformFeeValue}
                vatValue={vatValue}
                couponDiscountValue={couponDiscountValue}
                loyaltyDiscountValue={loyaltyDiscountValue}
                totalPayableValue={totalPayableValue}
                onPayNow={handlePayNow}
                onDownloadInvoice={handleDownloadInvoice}
              />
            </>
          )}

          {/* Payment Initiated / Completed Flow */}
          {isPaymentCompletedOrInitiated && (
            <>
              <InvoiceSummaryCard booking={booking} />
              <CompletedBookingSummaryCard
                totalPayableValue={totalPayableValue}
                onDownloadInvoice={handleDownloadInvoice}
                onRateProvider={
                  booking.status === BOOKING_STATUSES.Paid || booking.status === BOOKING_STATUSES.Completed
                    ? handleRateProvider
                    : undefined
                }
              />
            </>
          )}
        </View>
      </ContentLayout>

      <PaymentOptionsModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={totalPayableValue}
      />
    </View>
  );
}
