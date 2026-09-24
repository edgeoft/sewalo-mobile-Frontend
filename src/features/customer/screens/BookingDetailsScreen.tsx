import React, { useMemo, useState } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { Image, View, Text, Pressable, StyleSheet, Linking, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import type {
  Booking,
  PaymentMethod,
  MakePaymentResponse,
  EsewaPaymentDetails,
  Coupon as BookingCoupon,
} from '@/types';
import { BOOKING_STATUSES } from '@/types';
import RadialStepper from '@/components/common/RadialStepper';
import DiscountLoyaltyCard from '../components/DiscountLoyaltyCard';
import PaymentOptionsModal from '../components/PaymentOptionsModal';
import RatingModal from '../components/RatingModal';
import EsewaPaymentModal from '../components/EsewaPaymentModal';
import InvoiceReviewModal from '../components/InvoiceReviewModal';
import {
  useGetApplicableCoupons,
  useProcessPayment,
  useCancelBooking,
  useDownloadInvoice,
  useGetProfileQuery,
} from '@/api';
import { useAuth } from '@/providers/AuthProvider';
import { LOYALTY_POINTS_VALUE, MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE, DISCOUNT_TYPES } from '@/constants/loyalty';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { getProviderRating } from '@/utils/rating';
import { getImageUrl } from '@/utils/image';
import { formatDate, formatTime } from '@/utils/time';
import { processPaymentResponse } from '../utils/paymentStrategies';

interface BookingDetailsScreenProps {
  booking: Booking;
}

function SectionDivider() {
  return <View className="h-px bg-gray-100 my-4" />;
}

export default function BookingDetailsScreen({ booking }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const { data: profileData } = useGetProfileQuery();

  const [selectedCoupon, setSelectedCoupon] = useState<BookingCoupon | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState<string>('');
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isReviewInvoiceModalVisible, setIsReviewInvoiceModalVisible] = useState(false);
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [isEsewaModalVisible, setIsEsewaModalVisible] = useState(false);
  const [esewaPaymentDetails, setEsewaPaymentDetails] = useState<EsewaPaymentDetails | null>(null);

  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const { data: couponsData } = useGetApplicableCoupons(booking.id);
  const processPayment = useProcessPayment();
  const cancelBooking = useCancelBooking();
  const downloadInvoice = useDownloadInvoice();

  const availableCoupons = useMemo(() => couponsData?.data || [], [couponsData]);

  const user = profileData?.user ?? authUser;
  const currentLoyaltyPoints = user?.loyalty_points || 0;
  const pointsValue = LOYALTY_POINTS_VALUE;

  const invoice = booking.invoice;
  const subtotal = Number(invoice?.sub_total || 0);

  let discountAmount = 0;
  if (selectedCoupon) {
    if (selectedCoupon.discount_type === DISCOUNT_TYPES.PERCENT) {
      discountAmount = (Number(selectedCoupon.discount_value) / 100) * subtotal;
    } else {
      discountAmount = Number(selectedCoupon.discount_value);
    }
  }

  const maxPayableWithPoints = (subtotal - discountAmount) * MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE;
  const maxPointsAllowed = Math.max(0, Math.floor(maxPayableWithPoints / pointsValue));
  const effectiveMaxPoints = Math.min(currentLoyaltyPoints, maxPointsAllowed);

  const resolvedPoints = parseInt(loyaltyPoints, 10) || 0;
  const pointsDiscount = resolvedPoints * pointsValue;
  const totalDiscount = discountAmount + pointsDiscount;
  const totalPayableValue = Math.max(subtotal - totalDiscount, 0);

  const handleLoyaltyPointsChange = (val: string) => {
    const numericText = val.replace(/[^0-9]/g, '');
    if (numericText === '') {
      setLoyaltyPoints('');
      return;
    }

    const num = Number(numericText);
    if (num > currentLoyaltyPoints) {
      showSnackbar({ message: t('customer.onlyLoyaltyPoints', { balance: currentLoyaltyPoints }), type: 'info' });
      setLoyaltyPoints(effectiveMaxPoints > 0 ? effectiveMaxPoints.toString() : '');
      return;
    }

    if (num > maxPointsAllowed) {
      showSnackbar({ message: t('customer.maxRedeemPoints', { maxPoints: maxPointsAllowed }), type: 'info' });
      setLoyaltyPoints(maxPointsAllowed.toString());
      return;
    }

    setLoyaltyPoints(numericText);
  };

  const handleApplyMaxPoints = () => {
    if (effectiveMaxPoints > 0) {
      setLoyaltyPoints(effectiveMaxPoints.toString());
    }
  };

  const handleSelectCoupon = (coupon: BookingCoupon | null) => {
    setSelectedCoupon(coupon);
    if (loyaltyPoints) {
      let newDiscount = 0;
      if (coupon) {
        newDiscount =
          coupon.discount_type === DISCOUNT_TYPES.PERCENT
            ? (Number(coupon.discount_value) / 100) * subtotal
            : Number(coupon.discount_value);
      }
      const newMaxPayable = (subtotal - newDiscount) * MAX_LOYALTY_POINTS_REDEMPTION_PERCENTAGE;
      const newMaxPoints = Math.max(0, Math.floor(newMaxPayable / pointsValue));
      const currentPts = parseInt(loyaltyPoints, 10) || 0;
      if (currentPts > newMaxPoints) {
        setLoyaltyPoints(newMaxPoints > 0 ? newMaxPoints.toString() : '');
      }
    }
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
      ...(selectedCoupon ? { coupon_id: selectedCoupon.id } : {}),
      ...(resolvedPoints > 0 ? { loyalty_points: resolvedPoints } : {}),
    };

    processPayment.mutate(
      { bookingId: booking.id, payload },
      {
        onSuccess: (response: MakePaymentResponse) => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
          processPaymentResponse(response.type, {
            response,
            showSnackbar,
            t,
            onInitiateEsewa: (payment) => {
              setEsewaPaymentDetails(payment);
              setIsEsewaModalVisible(true);
            },
          });
        },
      },
    );
  };

  const handleEsewaSuccess = () => {
    setIsEsewaModalVisible(false);
    setEsewaPaymentDetails(null);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.DETAIL(booking.id) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.BASE });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    showSnackbar({ message: t('customer.paymentCompleted', 'Payment completed successfully!'), type: 'success' });
  };

  const handleEsewaFailure = (errorMsg?: string) => {
    setIsEsewaModalVisible(false);
    setEsewaPaymentDetails(null);
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS.DETAIL(booking.id) });
    showSnackbar({
      message: errorMsg || t('customer.paymentFailed', 'Payment failed. Please try again.'),
      type: 'error',
    });
  };

  const handleEsewaClose = () => {
    setIsEsewaModalVisible(false);
    setEsewaPaymentDetails(null);
    showSnackbar({
      message: t('customer.paymentCancelled', 'Payment was cancelled.'),
      type: 'info',
    });
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
  const providerRating = Number(getProviderRating([booking.service, booking.provider])).toFixed(1);
  const serviceDate = formatDate(booking.service_date || '');
  const startTime = formatTime(booking.start_time || '');
  const location = booking.address || 'Kathmandu Metropolitan City';
  const coordinates = booking.coordinates;
  const phoneNumber = booking.provider?.phone || '';
  const additionalNote = booking.additional_note;
  const descriptionText = booking.service?.description;
  const totalPrice = invoice?.total ? Number(invoice.total) : 0;
  const basePrice = invoice?.sub_total ? Number(invoice.sub_total) : 0;

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
            accessibilityRole="button"
            className="flex-row items-center justify-center gap-2 mb-4 py-3 rounded-lg border border-red-200 bg-red-50 active:bg-red-100"
          >
            <Feather name="x-circle" size={16} color="#ef4444" accessible={false} />
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
                <Feather name="user" size={20} color={THEME_COLORS.primary} />
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
                <View className="flex-row items-center mb-3">
                  <Feather name="calendar" size={15} color={THEME_COLORS.primary} />
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
                  <Feather name="briefcase" size={15} color={THEME_COLORS.primary} />
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
                  <Feather name="tag" size={15} color={THEME_COLORS.primary} />
                  <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.priceDetails')}</Text>
                </View>
                <View className="gap-y-2.5">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs font-sans-medium text-gray-500">
                      {serviceName || t('home.service')} {t('customer.price')}
                    </Text>
                    <Text className="text-xs font-sans-semibold text-gray-800">Rs. {basePrice.toLocaleString()}</Text>
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
                <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
                <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.invoiceSummary')}</Text>
              </View>

              <DiscountLoyaltyCard
                selectedCoupon={selectedCoupon}
                onSelectCoupon={handleSelectCoupon}
                loyaltyPoints={loyaltyPoints}
                onChangeLoyaltyPoints={handleLoyaltyPointsChange}
                onApplyMaxPoints={handleApplyMaxPoints}
                loyaltyBalance={currentLoyaltyPoints}
                pointsRate={pointsValue}
                availableCoupons={availableCoupons}
                subtotal={subtotal}
              />

              <View className="border-t border-gray-100 pt-4 gap-y-2.5 mb-4">
                <View className="flex-row justify-between">
                  <Text className="text-xs font-sans-medium text-gray-500">{t('customer.subtotal')}</Text>
                  <Text className="text-xs font-sans-semibold text-gray-800">Rs. {subtotal.toLocaleString()}</Text>
                </View>
                {discountAmount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">{t('customer.couponDiscount')}</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {discountAmount.toLocaleString()}
                    </Text>
                  </View>
                )}
                {pointsDiscount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs font-sans-medium text-green-600">{t('customer.loyaltyDiscount')}</Text>
                    <Text className="text-xs font-sans-semibold text-green-600">
                      - Rs. {pointsDiscount.toLocaleString()}
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
                  onPress={() => setIsReviewInvoiceModalVisible(true)}
                  accessibilityRole="button"
                  className="border border-primary/40 bg-surface-indigo-subtle/60 py-3.5 rounded-lg items-center active:bg-surface-indigo-subtle flex-row justify-center gap-x-2"
                >
                  <Feather name="file-text" size={16} color={THEME_COLORS.primary} />
                  <Text className="text-sm font-sans-bold text-primary">{t('customer.reviewInvoice')}</Text>
                </Pressable>
                <Pressable
                  onPress={handlePayNow}
                  accessibilityRole="button"
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90 flex-row justify-center gap-x-2"
                >
                  <Feather name="credit-card" size={16} color="#ffffff" />
                  <Text className="text-sm font-sans-bold text-white">{t('customer.payNow')}</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {/* Payment Completed Section */}
        {isPaymentCompletedOrInitiated && (
          <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-4">
            <View className="flex-row items-center mb-4">
              <Feather name="file-text" size={15} color={THEME_COLORS.primary} />
              <Text className="text-sm font-sans-bold text-gray-900 ml-2">{t('customer.invoiceSummary')}</Text>
            </View>
            <View className="gap-y-2.5 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">{t('customer.basePrice')}</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {subtotal.toLocaleString()}</Text>
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
                accessibilityRole="button"
                accessibilityState={{ disabled: downloadInvoice.isPending }}
                className="border border-primary py-3.5 rounded-lg items-center bg-white active:bg-blue-50/30 disabled:opacity-50"
              >
                {downloadInvoice.isPending ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.primary} />
                ) : (
                  <Text className="text-sm font-sans-semibold text-primary">{t('customer.downloadInvoice')}</Text>
                )}
              </Pressable>
              {booking.status === BOOKING_STATUSES.Paid && (
                <Pressable
                  onPress={handleRateProvider}
                  accessibilityRole="button"
                  className="bg-primary py-3.5 rounded-lg items-center active:opacity-90"
                >
                  <Text className="text-sm font-sans-bold text-white">{t('customer.rateProvider')}</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ContentLayout>

      <InvoiceReviewModal
        visible={isReviewInvoiceModalVisible}
        onClose={() => setIsReviewInvoiceModalVisible(false)}
        onProceedToPay={() => {
          setIsReviewInvoiceModalVisible(false);
          setIsPaymentModalVisible(true);
        }}
        booking={booking}
        couponDiscountValue={discountAmount}
        loyaltyDiscountValue={pointsDiscount}
        platformFeeValue={0}
        totalPayableValue={totalPayableValue}
        onDownloadInvoice={handleDownloadInvoice}
        isDownloadingInvoice={downloadInvoice.isPending}
      />

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

      <EsewaPaymentModal
        visible={isEsewaModalVisible}
        paymentDetails={esewaPaymentDetails}
        onSuccess={handleEsewaSuccess}
        onFailure={handleEsewaFailure}
        onClose={handleEsewaClose}
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
