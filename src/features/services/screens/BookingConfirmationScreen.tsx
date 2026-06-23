import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useGetBookingByIdQuery } from '@/api/bookings';
import { getImageUrl } from '@/utils/image';
import BookingAnimatedCheckmark from '../components/BookingAnimatedCheckmark';

function formatTime(timeString: string) {
  if (!timeString) return '';
  if (/^\d{1,2}:\d{2}$/.test(timeString)) return timeString;
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const bookingId = params.bookingId as string;

  const { data: booking, isLoading } = useGetBookingByIdQuery(bookingId || '');

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  const providerName = booking?.provider?.name || 'Service Provider';
  const providerAvatar = getImageUrl(booking?.provider?.avatar) || '';
  const providerCategory = booking?.service?.category?.name || 'Services';
  const serviceDate = formatDate(booking?.service_date || '');
  const startTime = formatTime(booking?.start_time || '');
  const location = booking?.address || '';
  const invoice = booking?.invoice;
  const status = booking?.status || 'pending';
  const serviceName = booking?.service?.name || '';

  const subTotal = invoice?.sub_total ? Number(invoice.sub_total) : 0;
  const vatAmount = invoice?.vat ? Number(invoice.vat) : 0;
  const totalPrice = invoice?.total ? Number(invoice.total) : 0;

  const isConfirmed = status !== 'pending' && status !== 'rejected';
  const isProviderNotFound = !bookingId;

  if (!booking && !isProviderNotFound) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center px-6">
        <Feather name="alert-triangle" size={40} color="#ef4444" />
        <Text className="text-lg font-sans-bold text-gray-950 mt-4 mb-2">Booking Not Found</Text>
        <Text className="text-sm font-sans-medium text-gray-500 text-center mb-6">
          Unable to load booking details. Please try again.
        </Text>
        <Button title="Go Back" variant="primary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} />
      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-6 items-center mb-5">
          <BookingAnimatedCheckmark />

          <Text className="text-xl font-sans-extrabold text-gray-900 text-center tracking-tight mb-2 mt-4">
            Booking {isConfirmed ? 'Confirmed!' : 'Submitted!'}
          </Text>

          <Text className="text-sm font-sans-medium text-gray-500 text-center leading-5 mb-4 px-4">
            {isConfirmed
              ? 'Your booking has been successfully created.'
              : "Your booking has been sent to the provider. You'll be notified once they accept."}
          </Text>

          <View className="flex-row items-center bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-1.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-xs font-sans-bold text-emerald-600">
              Status: {status.replace(/_/g, ' ') || 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.cardShadow} className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
          <Text className="text-lg font-sans-bold text-gray-900 mb-4">Booking Summary</Text>

          <View className="flex-row items-center justify-between mb-5 border-b border-gray-100 pb-4">
            <View className="flex-row items-center flex-1">
              {providerAvatar ? (
                <Image source={{ uri: providerAvatar }} className="h-11 w-11 rounded-full bg-gray-100" />
              ) : (
                <View className="h-11 w-11 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name="user" size={18} color="#485aff" />
                </View>
              )}
              <View className="ml-3 flex-1">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-sm font-sans-bold text-gray-900 mr-1">{providerName}</Text>
                </View>
                <View className="flex-row mt-1">
                  <View className="bg-blue-50/70 border border-blue-100/50 rounded px-2 py-0.5 flex-row items-center">
                    <Text className="text-[10px] font-sans-bold text-primary lowercase">{providerCategory}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-y-3.5 mb-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="briefcase" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Service</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800">{serviceName || providerCategory}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="calendar" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Date & Time</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800">
                {serviceDate}
                {startTime ? ` • ${startTime}` : ''}
              </Text>
            </View>

            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center mt-0.5">
                <Feather name="map-pin" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Location</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800 flex-1 text-right ml-4" numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          {subTotal > 0 && (
            <View className="border-t border-gray-100 pt-4 gap-y-2 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">Sub Total</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {subTotal.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">Rs. {vatAmount.toLocaleString()}</Text>
              </View>
            </View>
          )}

          {totalPrice > 0 && (
            <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
              <Text className="text-sm font-sans-bold text-gray-900">Total :</Text>
              <Text className="text-base font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
            </View>
          )}
        </View>

        <View className="gap-y-3 mt-2 px-1">
          <Button
            title="View Booking Status"
            variant="primary"
            onPress={() => router.push(ROUTES.customer.bookingDetail(bookingId))}
            className="rounded-lg"
          />

          <Button
            title="Back to Home"
            variant="outline"
            onPress={() => {
              router.replace(ROUTES.customer.home);
            }}
            className="rounded-lg border-primary bg-transparent"
            textClassName="text-primary font-sans-semibold"
          />
        </View>
      </ContentLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
});
