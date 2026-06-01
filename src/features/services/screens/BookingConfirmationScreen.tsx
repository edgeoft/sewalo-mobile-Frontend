import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import BookingAnimatedCheckmark from '../components/BookingAnimatedCheckmark';

interface ParsedService {
  id: string;
  title: string;
  price: string;
}

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const providerName = (params.providerName as string) || 'Service Provider';
  const providerAvatar = (params.providerAvatar as string) || '';
  const providerCategory = (params.providerCategory as string) || 'Services';
  const isVerified = params.providerVerified === 'true';
  const serviceDate = (params.serviceDate as string) || 'Not Selected';
  const startTime = (params.startTime as string) || 'Not Selected';
  const location = (params.location as string) || 'Kathmandu Metropolitan City';
  const totalPrice = Number(params.totalPrice) || 0;

  let servicesList: ParsedService[] = [];
  try {
    if (params.services) {
      servicesList = JSON.parse(params.services as string);
    }
  } catch (e) {
    console.error('Error parsing services', e);
  }

  const baseSubtotal = totalPrice / 1.13;
  const vatAmount = totalPrice - baseSubtotal;

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

          <Text className="text-xl font-sans-extrabold text-gray-900 text-center tracking-tight mb-2 text-center mt-4">
            Booking Confirmed!
          </Text>

          <Text className="text-sm font-sans-medium text-gray-500 text-center leading-5 mb-4 px-4 text-center">
            Your booking has been sent to the provider. You&apos;ll be notified once they accept.
          </Text>

          <View className="flex-row items-center bg-emerald-50 border border-emerald-100 rounded-full px-3.5 py-1.5">
            <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
            <Text className="text-xs font-sans-bold text-emerald-600">Status: Confirmed</Text>
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
                  {isVerified && <MaterialCircleCheckIcon />}
                </View>
                <View className="flex-row mt-1">
                  <View className="bg-blue-50/70 border border-blue-100/50 rounded px-2 py-0.5 flex-row items-center">
                    <Text className="text-[10px] font-sans-bold text-primary lowercase">{providerCategory}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Pressable className="h-8 w-8 items-center justify-center rounded-full active:bg-gray-50">
              <Feather name="more-horizontal" size={18} color="#94a3b8" />
            </Pressable>
          </View>

          <View className="gap-y-3.5 mb-5">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="briefcase" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Service</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800">{providerCategory}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="calendar" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Date & Time</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800">
                {serviceDate} • {startTime}
              </Text>
            </View>

            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center mt-0.5">
                <Feather name="map-pin" size={15} color="#94a3b8" />
                <Text className="text-xs font-sans-medium text-gray-500 ml-2">Location</Text>
              </View>
              <Text className="text-xs font-sans-bold text-gray-800 flex-1 text-right ml-4" numberOfLines={2}>
                {location}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-4 gap-y-2 mb-4">
            {servicesList.map((service) => (
              <View key={service.id} className="flex-row justify-between">
                <Text className="text-xs font-sans-medium text-gray-500">{service.title}</Text>
                <Text className="text-xs font-sans-semibold text-gray-800">
                  {typeof service.price === 'string' && service.price.includes('Rs')
                    ? service.price
                    : `Rs. ${Number(service.price).toLocaleString()}`}
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between">
              <Text className="text-xs font-sans-medium text-gray-500">VAT (13%)</Text>
              <Text className="text-xs font-sans-semibold text-gray-800">
                Rs. {Math.round(vatAmount).toLocaleString()}
              </Text>
            </View>
          </View>

          <View className="border-t border-gray-100 pt-4 flex-row justify-between items-center">
            <Text className="text-sm font-sans-bold text-gray-900">Total :</Text>
            <Text className="text-base font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
          </View>
        </View>

        <View className="gap-y-3 mt-2 px-1">
          <Button title="View Booking Status" variant="primary" onPress={() => {}} className="rounded-lg" />

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

function MaterialCircleCheckIcon() {
  return (
    <View className="bg-primary rounded-full p-0.5 items-center justify-center" style={{ width: 14, height: 14 }}>
      <Feather name="check" size={8} color="#ffffff" strokeWidth={4} />
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
