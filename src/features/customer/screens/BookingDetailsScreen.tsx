import React, { useState } from 'react';
import { Image, View, Text, Pressable, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

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
import { formatDate, formatTime } from '@/utils/time';
import { PaymentFactory } from '../utils/paymentStrategies';

interface BookingDetailsScreenProps {
  booking: Booking;
}

function SectionDivider() {
  return <View className="h-px bg-gray-100 my-4" />;
}

export default function BookingDetailsScreen({ booking }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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
      showSnackbar({ message: t('customer.onlyLoyaltyPoints', { balance: loyaltyBalance }), type: 'info' });
      setLoyaltyPoints(loyaltyBalance.toString());
      return;
    }

    const pointsVal = points * pointsRate;
    const maxAllowedDiscount = basePriceValue + platformFeeValue - couponDiscountValue;
    if (pointsVal > maxAllowedDiscount) {
      const maxPoints = Math.floor(maxAllowedDiscount / pointsRate);
      showSnackbar({ message: t('customer.maxRedeemPoints', { maxPoints }), type: 'info' });
      setLoyaltyPoints(maxPoints.toString());
      return;
    }

    setLoyaltyPoints(numericText);
  };

  const handleCancel = () => {
    showError({
      title: t('customer.cancelBooking'),
      message: t('customer.cancelBookingConfirm'),
      actions: [
        { text: t('customer.no'), style: 'cancel' },
        { text: t('customer.yesCancel'), style: 'destructive', onPress: () => submitCancel() },
      ],
    });
  };

  const submitCancel = (reason?: string) => {
    cancelBooking.mutate(
      { id: booking.id, reason },
      { onSuccess: () => showSnackbar({ message: t('customer.bookingCancelled'), type: 'success' }) },
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
          PaymentFactory.get(response.type).process(response, showSnackbar, t);
        },
      },
    );
  };

  const handleDownloadInvoice = () => {
    if (!invoice?.id) return;
    downloadInvoice.mutate(invoice.id, {
      onSuccess: () => {
        showSnackbar({ message: t('customer.invoiceDownloaded'), type: 'success' });
      },
      onError: (error) => {
        showSnackbar({ message: error.message || t('customer.failedToDownloadInvoice'), type: 'error' });
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
  const providerRating = Number(
    booking.service?.average_rating || booking.provider?.average_rating || booking.provider?.avg_rating || 0,
  ).toFixed(1);
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
          title={t('customer.bookingDetailsTitle')}
          description={t('customer.bookingDetailsDesc')}
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
            <Text className="text-sm font-sans-semibold text-red-600">{t('customer.cancelBooking')}</Text>
          </Pressable>
        )}

        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
          {/* Provider Section */}
          <View className="flex-row items-center">
            {providerAvatar ? (
              <Image source={{ uri: providerAvatar }} className="h-12 w-12 rounded-full" resizeMode="cover" />
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
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.bookingDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('customer.date')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceDate}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('customer.time')}</Text>
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
                    <Text className="text-xs font-sans-medium text-gray-500">{t('home.service')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">{serviceName || categoryName}</Text>
                  </View>
                  {categoryName ? (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs font-sans-medium text-gray-500">{t('customer.category')}</Text>
                      <Text className="text-xs font-sans-semibold text-gray-800">{categoryName}</Text>
                    </View>
                  ) : null}
                  {descriptionText ? (
                    <View className="mt-1">
                      <Text className="text-xs font-sans-medium text-gray-500 mb-1">{t('common.description')}</Text>
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
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.priceDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">
                      {serviceName || t('home.service')} {t('customer.price')}
                    </Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">{t('customer.vat')}</Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
                  </View>
                  <View className="pt-2 border-t border-gray-100 flex-row justify-between items-center">
                    <Text className="text-sm font-sans-bold text-gray-900">{t('customer.total')}</Text>
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
                      {booking.status === BOOKING_STATUSES.Cancelled
                        ? t('customer.cancellationDetails')
                        : t('customer.rejectionDetails')}
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
                <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.invoiceSummary')}</Text>
              </View>
              <View className="gap-y-2.5 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.basePrice')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.vat')}</Text>
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
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.basePrice')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.platformFee')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">
                    Rs. {platformFeeValue.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.vat')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
                </View>
                {couponDiscountValue > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">{t('customer.couponDiscount')}</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {couponDiscountValue.toLocaleString()}
                    </Text>
                  </View>
                )}
                {loyaltyDiscountValue > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">{t('customer.loyaltyDiscount')}</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {loyaltyDiscountValue.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>

              <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center mb-4">
                <Text className="text-sm font-sans-bold text-gray-900">{t('customer.totalPayable')}</Text>
                <Text className="text-lg font-sans-extrabold text-primary">
                  Rs. {totalPayableValue.toLocaleString()}
                </Text>
              </View>

              <View className="gap-y-2.5">
                <Pressable
                  onPress={handlePayNow}
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90"
                >
                  <Text className="text-sm font-sans-bold text-white">{t('customer.payNow')}</Text>
                </Pressable>
                <Pressable
                  onPress={handleDownloadInvoice}
                  disabled={downloadInvoice.isPending}
                  className="border border-primary py-3.5 rounded-lg items-center bg-white active:bg-blue-50/30 disabled:opacity-50"
                >
                  {downloadInvoice.isPending ? (
                    <ActivityIndicator size="small" color="#485aff" />
                  ) : (
                    <Text className="text-sm font-sans-semibold text-primary">{t('customer.downloadInvoice')}</Text>
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
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.invoiceSummary')}</Text>
            </View>
            <View className="gap-y-2.5 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">{t('customer.basePrice')}</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">{t('customer.vat')}</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vat.toLocaleString()}</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center mb-4">
              <Text className="text-sm font-sans-bold text-gray-900">{t('customer.totalPaid')}</Text>
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
                  <Text className="text-sm font-sans-semibold text-primary">{t('customer.downloadInvoice')}</Text>
                )}
              </Pressable>
              {booking.status === BOOKING_STATUSES.Paid && (
                <Pressable
                  onPress={handleRateProvider}
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90"
                >
                  <Text className="text-sm font-sans-bold text-white">{t('customer.rateProvider')}</Text>
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
    elevation: 0,
  },
});
