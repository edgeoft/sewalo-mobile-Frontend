import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By downloading, installing, or using the Sewalo mobile application, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not access or use the application.',
    },
    {
      title: '2. User Accounts',
      content:
        'You must maintain accurate, complete, and up-to-date information in your account. Failure to maintain accurate account information may result in your inability to access and use Sewalo services or termination of this agreement.',
    },
    {
      title: '3. Booking and Services',
      content:
        'Sewalo serves as a platform connecting customers with independent service providers. While we perform verification checks on partners, we do not directly employ the service providers and are not responsible for the performance or quality of services rendered.',
    },
    {
      title: '4. Cancellations and Refunds',
      content:
        'Users may cancel bookings subject to our cancellation guidelines. Cancellations made within 2 hours of the scheduled service time may incur a cancellation penalty fee of Rs. 150. Refunds are processed through original payment methods within 3-5 business days.',
    },
    {
      title: '5. Rules of Conduct',
      content:
        'You agree to treat all service providers with respect. Harassment, physical or verbal abuse, or discrimination of any form will result in immediate and permanent account suspension.',
    },
    {
      title: '6. Limitation of Liability',
      content:
        'To the maximum extent permitted by applicable law, Sewalo shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising out of your use of the application.',
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
          title="Terms of Service"
          description="Last Updated: June 2026. Please read these terms carefully before using our platform."
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <Text className="text-xs font-sans-bold text-primary mb-4 uppercase tracking-wider">
            User Agreement & Guidelines
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
          If you have questions regarding these terms, please contact us at terms@sewalo.com
        </Text>
      </ContentLayout>
    </View>
  );
}
