import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: '1. Information We Collect',
      content:
        'We collect personal information you provide directly to us, including your full name, email, mobile phone number, location information, billing credentials, profile avatar, and documentation for verification purposes.',
    },
    {
      title: '2. How We Use Information',
      content:
        'Your data is utilized to operate, maintain, and personalize Sewalo services. This includes coordinating bookings, validating identities, processing payouts, improving security safeguards, and communicating critical service updates.',
    },
    {
      title: '3. Data Sharing and Location Information',
      content:
        'To facilitate service execution, we share relevant details (like name, address, and mobile number) with the service provider selected for your booking. We do not sell or lease your personal identifiers to marketing third parties.',
    },
    {
      title: '4. Information Security',
      content:
        'We implement industry-standard secure storage and encryption technologies to shield your personal details from unauthorized access, modification, or destruction. However, no electronic transmission mechanism is 100% secure.',
    },
    {
      title: '5. Your Privacy Rights',
      content:
        'You have full access to inspect, correct, or request deletion of your personal details stored on Sewalo. Account deletion requests can be triggered directly via Account > Privacy Settings.',
    },
    {
      title: '6. Policy Changes',
      content:
        'We may periodically update this Privacy Policy to reflect changes in our operational procedures. We will notify you of any material changes by posting the updated policy in this section.',
    },
  ];

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
          title="Privacy Policy"
          description="Last Updated: June 2026. This policy outlines how we safeguard your personal details."
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <Text className="text-xs font-sans-bold text-primary mb-4 uppercase tracking-wider">
            Data Collection & Safety Policy
          </Text>

          <ScrollView scrollEnabled={false} className="gap-y-5">
            {sections.map((sec, idx) => (
              <View key={idx} className="mb-4">
                <Text className="text-xs font-sans-bold text-gray-900 mb-1.5">{sec.title}</Text>
                <Text className="text-xs font-sans-regular text-gray-500 leading-5">{sec.content}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Text className="text-[10px] font-sans-medium text-gray-400 text-center mt-3">
          If you have questions regarding this policy, contact us at privacy@sewalo.com
        </Text>
      </ContentLayout>
    </View>
  );
}
