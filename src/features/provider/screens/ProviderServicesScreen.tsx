import React from 'react';
import { Text, View, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';

export default function ProviderServicesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleCreateService = () => {
    Alert.alert('Create Service', 'Service creation flow will be implemented next.');
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showNotifications onNotificationsPress={() => router.push('/notifications')} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="My Services"
          description="Manage your service catalog, prices, and bookings details."
          className="mb-6"
          titleClassName="text-2xl"
        />

        {/* Clean, Premium Empty State Container */}
        <View className="flex-1 justify-center items-center px-4 py-12">
          {/* Service/Tool Themed SVG Illustration */}
          <Svg width={120} height={120} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r="50" fill="#eef2ff" />

            {/* Toolbox / Catalog Representation */}
            <Rect x="40" y="45" width="40" height="32" rx="6" fill="#485aff" />
            <Path d="M48 45v-6a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v6" stroke="#485aff" strokeWidth="2.5" fill="none" />
            <Circle cx="60" cy="61" r="5" fill="#ffffff" />

            {/* Left/Right Floating Accent Gears */}
            <Circle cx="30" cy="80" r="10" fill="#f1f5f9" />
            <Path d="M26 80h8M30 76v8" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

            <Circle cx="90" cy="45" r="12" fill="#fff6e6" />
            <Feather name="plus" size={12} color="#d97706" style={{ position: 'absolute', top: 38, left: 84 }} />
          </Svg>

          <Text className="text-base font-sans-bold text-gray-900 mt-5 mb-1.5 text-center">
            No Services Created Yet
          </Text>

          <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-6 max-w-[280px]">
            Create and publish your services to start receiving bookings from customers in your area.
          </Text>

          <Button
            title="Create a Service"
            variant="primary"
            size="sm"
            className="px-6 rounded-lg"
            leftIcon={<Feather name="plus" size={14} color="#ffffff" />}
            onPress={handleCreateService}
          />
        </View>
      </ContentLayout>
    </View>
  );
}
