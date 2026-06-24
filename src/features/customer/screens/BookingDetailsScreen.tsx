import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import type { Booking, PaymentMethod } from '@/types';
import { BOOKING_STATUSES, PAYMENT_METHODS } from '@/types';
import RadialStepper from '@/components/common/RadialStepper';
import DiscountLoyaltyCard, { type Coupon } from '../components/DiscountLoyaltyCard';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import RatingModal from '../components/RatingModal';
import { useGetApplicableCoupons, useProcessPayment, useCancelBooking, useDownloadInvoice } from '@/api';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { getImageUrl } from '@/utils/image';

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

function formatDate(isoString: string) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0];
  } catch {
    return isoString;
  }
}

interface BookingDetailsScreenProps {
  booking: Booking;
}

function SectionDivider() {
  return <View className="h-px bg-gray-100 my-4" />;
}

export default function BookingDetailsScreen({ booking }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();

  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<string>('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);

  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const { data: couponsData } = useGetApplicableCoupons();
  const processPayment = useProcessPayment();
  const cancelBooking = useCancelBooking();
  const downloadInvoice = useDownloadInvoice();

  const availableCoupons: Coupon[] = (couponsData?.data || []).map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.discount_type === 'percent' ? `${c.discount_value}% off` : `Rs. ${c.discount_value} off`,
    discountType: c.discount_type,
    value: c.discount_value,
    remaining_uses: c.remaining_uses,
  }));

  const loyaltyBalance = booking.user?.loyalty_points || 0;
  const pointsRate = 2;

  const invoice = booking.invoice;
  const basePriceValue = invoice ? Number(invoice.sub_total) || 0 : 0;
  const platformFeeValue = 0;
  const vatValue = invoice ? Number(invoice.vat) || 0 : 0;

  let couponDiscountValue = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discountType === 'percent') {
      couponDiscountValue = basePriceValue * (selectedCoupon.value / 100);
    } else {
      couponDiscountValue = selectedCoupon.value;
    }
  }

  const loyaltyPointsNum = parseInt(loyaltyPoints) || 0;
  const loyaltyDiscountValue = loyaltyPointsNum * pointsRate;

  const subtotal = Math.max(0, basePriceValue + platformFeeValue - couponDiscountValue - loyaltyDiscountValue);
  const totalPayableValue = subtotal + vatValue;

  const handleLoyaltyPointsChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const points = parseInt(numericText) || 0;

    if (points > loyaltyBalance) {
      showSnackbar({ message: `You only have ${loyaltyBalance} loyalty points.`, type: 'info' });
      setLoyaltyPoints(loyaltyBalance.toString());
      return;
    }

    const pointsVal = points * pointsRate;
    const maxAllowedDiscount = basePriceValue + platformFeeValue - couponDiscountValue;
    if (pointsVal > maxAllowedDiscount) {
      const maxPoints = Math.floor(maxAllowedDiscount / pointsRate);
      showSnackbar({ message: `You can only redeem up to ${maxPoints} points for this invoice.`, type: 'info' });
      setLoyaltyPoints(maxPoints.toString());
      return;
    }

    setLoyaltyPoints(numericText);
  };

  const handleCancel = () => {
    showError({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      actions: [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => submitCancel() },
      ],
    });
  };

  const submitCancel = (reason?: string) => {
    cancelBooking.mutate(
      { id: booking.id, reason },
      { onSuccess: () => showSnackbar({ message: 'Your booking has been cancelled.', type: 'success' }) },
    );
  };

  const handlePayNow = () => {
    setIsPaymentModalVisible(true);
  };

  const handlePaymentConfirm = (option: PaymentMethod) => {
    setIsPaymentModalVisible(false);

    const payload = {
      payment_method: option,
      ...(selectedCoupon ? { coupon_id: couponsData?.data.find((c) => c.code === selectedCoupon.code)?.id } : {}),
      ...(loyaltyPointsNum > 0 ? { loyalty_points: loyaltyPointsNum } : {}),
    };

    processPayment.mutate(
      { bookingId: booking.id, payload },
      {
        onSuccess: (response) => {
          if (response.type === PAYMENT_METHODS.Cash) {
            showSnackbar({ message: 'Payment completed successfully!', type: 'success' });
          } else {
            const { payment } = response;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payment.api_endpoint;
            const fields = {
              amount: payment.amount.toString(),
              tax_amount: payment.tax_amount.toString(),
              total_amount: payment.total_amount.toString(),
              transaction_uuid: payment.transaction_uuid,
              product_code: payment.product_code,
              product_service_charge: payment.product_service_charge.toString(),
              product_delivery_charge: payment.product_delivery_charge.toString(),
              success_url: payment.success_url,
              failure_url: payment.failure_url,
              signed_field_names: payment.signed_field_names,
              signature: payment.signature,
            };
            Object.entries(fields).forEach(([key, value]) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
          }
        },
      },
    );
  };

  const handleDownloadInvoice = () => {
    if (!invoice?.id) return;
    downloadInvoice.mutate(invoice.id, {
      onSuccess: () => {
        showSnackbar({ message: 'Invoice downloaded successfully.', type: 'success' });
      },
      onError: (error) => {
        showSnackbar({ message: error.message || 'Failed to download invoice.', type: 'error' });
      },
    });
  };

  const handleRateProvider = () => {
    setIsRatingModalVisible(true);
  };

  const providerAvatar = getImageUrl(booking.provider?.avatar) || '';
  const providerName = booking.provider?.name || 'Service Provider';
  const serviceName = booking.service?.name || '';
  const categoryName = booking.service?.category?.name || '';
  const providerRating = Number(booking.service?.average_rating || booking.provider?.avg_rating || 0).toFixed(1);
  const serviceDate = formatDate(booking.service_date || '');
  const startTime = formatTime(booking.start_time || '');
  const location = booking.address || 'Kathmandu Metropolitan City';
  const coordinates = booking.coordinates;
  const phoneNumber = booking.provider?.phone || '';
  const additionalNote = booking.additional_note;
  const descriptionText = booking.service?.description;
  const totalPrice = invoice?.total ? Number(invoice.total) : 0;
  const basePrice = invoice?.sub_total ? Number(invoice.sub_total) : 0;
  const vat = invoice?.vat ? Number(invoice.vat) : 0;

  const showDetailsCards =
    booking.status === BOOKING_STATUSES.Pending ||
    booking.status === BOOKING_STATUSES.Confirmed ||
    booking.status === BOOKING_STATUSES.InProgress ||
    booking.status === BOOKING_STATUSES.Completed ||
    booking.status === BOOKING_STATUSES.PaymentInitiated ||
    booking.status === BOOKING_STATUSES.Paid;

  const isReadyToPay = booking.status === BOOKING_STATUSES.ReadyToPay;
  const isPaymentCompletedOrInitiated =
    booking.status === BOOKING_STATUSES.PaymentInitiated || booking.status === BOOKING_STATUSES.Paid;

  const canCancel = booking.status === BOOKING_STATUSES.Pending || booking.status === BOOKING_STATUSES.Confirmed;

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

        <RadialStepper status={booking.status} role="customer" />

        {canCancel && (
          <Pressable
            onPress={handleCancel}
            className="flex-row items-center justify-center gap-2 mb-4 py-3 rounded-lg border border-red-200 bg-red-50 active:bg-red-100"
          >
            <Feather name="x-circle" size={16} color="#ef4444" />
            <Text className="text-sm font-sans-semibold text-red-600">Cancel Booking</Text>
          </Pressable>
        )}

        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
          {/* Provider Section */}
          <View className="flex-row items-center">
            {providerAvatar ? (
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
                <Text className="text-sm font-sans-bold text-gray-900 mr-1">{providerName}</Text>
                <View className="bg-blue-50/70 border border-blue-100/50 rounded px-1.5 py-0.5">
                  <Text className="text-[9px] font-sans-bold text-primary lowercase">{categoryName}</Text>
                </View>
              </View>
              <View className="flex-row items-center mt-0.5">
                <Feather name="star" size={11} color="#f59e0b" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-1">{providerRating}</Text>
              </View>
            </View>
          </View>

          {/* Provider Details */}
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
                  <Text className="text-xs font-sans-medium text-gray-500 ml-2">{booking.provider?.email || '-'}</Text>
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
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
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
          {(booking.status === BOOKING_STATUSES.Cancelled || booking.status === BOOKING_STATUSES.Rejected) &&
            booking.cancellation_reason && (
              <>
                <SectionDivider />
                <View>
                  <View className="flex-row items-center mb-3">
                    <Feather name="alert-circle" size={15} color="#ef4444" />
                    <Text className="text-sm font-sans-bold text-gray-900 ml-2">
                      {booking.status === BOOKING_STATUSES.Cancelled ? 'Cancellation Details' : 'Rejection Details'}
                    </Text>
                  </View>
                  <View className="bg-red-50/50 border border-red-100 rounded-lg p-3">
                    <Text className="text-xs font-sans-medium text-gray-700 leading-5">
                      {booking.cancellation_reason}
                    </Text>
                  </View>
                </View>
              </>
            )}
        </View>

        {/* Ready to Pay Section */}
        {isReadyToPay && (
          <>
            <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-4">
              <View className="flex-row items-center mb-4">
                <Feather name="file-text" size={15} color="#485aff" />
                <Text className="text-sm font-sans-bold text-gray-900 ml-2">Invoice Summary</Text>
              </View>
              <View className="gap-y-2.5 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">Base Price</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
                </View>
              </View>

              <DiscountLoyaltyCard
                selectedCoupon={selectedCoupon}
                onSelectCoupon={setSelectedCoupon}
                loyaltyPoints={loyaltyPoints}
                onChangeLoyaltyPoints={handleLoyaltyPointsChange}
                loyaltyBalance={loyaltyBalance}
                pointsRate={pointsRate}
                availableCoupons={availableCoupons}
              />

              <View className="border-t border-gray-100 pt-4 gap-y-2.5 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">Base Price</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">Platform Fee</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">
                    Rs. {platformFeeValue.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
                </View>
                {couponDiscountValue > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">Coupon Discount</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {couponDiscountValue.toLocaleString()}
                    </Text>
                  </View>
                )}
                {loyaltyDiscountValue > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">Loyalty Discount</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {loyaltyDiscountValue.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center mb-4">
                <Text className="text-sm font-sans-bold text-gray-900">Total Payable</Text>
                <Text className="text-lg font-sans-extrabold text-primary">
                  Rs. {totalPayableValue.toLocaleString()}
                </Text>
              </View>

              <View className="gap-y-2.5">
                <Pressable
                  onPress={handlePayNow}
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90"
                >
                  <Text className="text-sm font-sans-bold text-white">Pay Now</Text>
                </Pressable>
                <Pressable
                  onPress={handleDownloadInvoice}
                  disabled={downloadInvoice.isPending}
                  className="border border-primary py-3.5 rounded-lg items-center bg-white active:bg-blue-50/30 disabled:opacity-50"
                >
                  {downloadInvoice.isPending ? (
                    <ActivityIndicator size="small" color="#485aff" />
                  ) : (
                    <Text className="text-sm font-sans-semibold text-primary">Download Invoice</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </>
        )}

        {/* Payment Completed Section */}
        {isPaymentCompletedOrInitiated && (
          <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-4">
            <View className="flex-row items-center mb-4">
              <Feather name="file-text" size={15} color="#485aff" />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">Invoice Summary</Text>
            </View>
            <View className="gap-y-2.5 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">Base Price</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center mb-4">
              <Text className="text-sm font-sans-bold text-gray-900">Total Paid</Text>
              <Text className="text-lg font-sans-extrabold text-primary">Rs. {totalPayableValue.toLocaleString()}</Text>
            </View>

            <View className="gap-y-2.5">
              <Pressable
                onPress={handleDownloadInvoice}
                disabled={downloadInvoice.isPending}
                className="border border-primary py-3.5 rounded-lg items-center bg-white active:bg-blue-50/30 disabled:opacity-50"
              >
                {downloadInvoice.isPending ? (
                  <ActivityIndicator size="small" color="#485aff" />
                ) : (
                  <Text className="text-sm font-sans-semibold text-primary">Download Invoice</Text>
                )}
              </Pressable>
              {booking.status === BOOKING_STATUSES.Paid && (
                <Pressable
                  onPress={handleRateProvider}
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90"
                >
                  <Text className="text-sm font-sans-bold text-white">Rate Provider</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ContentLayout>

      <PaymentOptionsModal
        visible={isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onConfirm={handlePaymentConfirm}
        totalAmount={totalPayableValue}
      />

      <RatingModal
        visible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        bookingId={booking.id}
        providerId={booking.provider?.id || ''}
        providerName={providerName}
        serviceName={serviceName}
      />
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
