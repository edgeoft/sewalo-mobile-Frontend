import React, { useState } from 'react';
import { View, Text, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';

export default function AboutAppScreen() {
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const [checking, setChecking] = useState(false);

  const handleCheckUpdates = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      showSnackbar({
        message: 'Your app is up to date! Version 1.0.0 is the latest version available.',
        type: 'success',
      });
    }, 1500);
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showSnackbar({ message: 'Unable to open link on this device: ' + url, type: 'error' });
    });
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

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
          title="About Sewalo"
          description="Learn more about Sewalo application, developer team, and version updates."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Logo and App Details Card */}
        <View
          style={cardShadow}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-5 items-center justify-center"
        >
          {/* Sewalo Logo description mockup */}
          <View className="h-16 w-16 bg-primary rounded-2xl items-center justify-center mb-4 rotate-6 shadow-sm shadow-primary/20">
            <Feather name="activity" size={32} color="#ffffff" className="-rotate-6" />
          </View>

          <Text className="text-lg font-sans-extrabold text-gray-900 mb-1">Sewalo</Text>
          <Text className="text-xs font-sans-semibold text-primary mb-5">Reliable Services, At Your Doorstep</Text>

          <View className="w-full border-t border-gray-50 pt-4 gap-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">Version</Text>
              <Text className="text-xs font-sans-bold text-gray-800">1.0.0 (Build 47)</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">Developer</Text>
              <Text className="text-xs font-sans-bold text-gray-800">Edgeoft Pvt. Ltd.</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">Website</Text>
              <Pressable onPress={() => handleOpenLink('https://sewalo.com')} className="active:opacity-50">
                <Text className="text-xs font-sans-bold text-primary underline">www.sewalo.com</Text>
              </Pressable>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">Release Date</Text>
              <Text className="text-xs font-sans-bold text-gray-800">June 2026</Text>
            </View>
          </View>
        </View>

        {/* Check Updates Button */}
        <Button
          title={checking ? 'Checking...' : 'Check for Updates'}
          variant="outline"
          loading={checking}
          onPress={handleCheckUpdates}
          className="w-full h-12 bg-white border-gray-200"
          textClassName="text-gray-700"
        />

        {/* Copyright Footer */}
        <View className="mt-8 items-center justify-center">
          <Text className="text-[10px] font-sans-semibold text-gray-400 text-center leading-4">
            &copy; 2026 Edgeoft Pvt. Ltd. All rights reserved.
          </Text>
          <Text className="text-[10px] font-sans-medium text-gray-450 text-center mt-1 leading-4">
            Made with love in Kathmandu, Nepal.
          </Text>
        </View>
      </ContentLayout>
    </View>
  );
}
