import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import { type CustomerBookingItem } from '../constants/customerBookings';
import RadialStepper from '../components/RadialStepper';

interface BookingDetailsScreenProps {
  booking: CustomerBookingItem;
}

export default function BookingDetailsScreen({ booking }: BookingDetailsScreenProps) {
  const insets = useSafeAreaInsets();

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
      </ContentLayout>
    </View>
  );
}
