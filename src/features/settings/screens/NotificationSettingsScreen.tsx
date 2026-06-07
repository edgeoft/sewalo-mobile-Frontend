import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();

  const [pushBookings, setPushBookings] = useState(true);
  const [pushOffers, setPushOffers] = useState(false);
  const [pushChat, setPushChat] = useState(true);

  const [emailWeekly, setEmailWeekly] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);

  const [smsStatus, setSmsStatus] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  const renderToggleItem = (
    icon: keyof typeof Feather.glyphMap,
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (val: boolean) => void,
  ) => (
    <View className="flex-row items-center justify-between py-3.5 border-b border-gray-50 last:border-0">
      <View className="flex-row items-center flex-1 mr-4">
        <View className="h-8 w-8 rounded-full bg-gray-50 items-center justify-center mr-3">
          <Feather name={icon} size={15} color="#64748b" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900">{title}</Text>
          <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5 leading-4">{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#cbd5e1', true: '#a5b4fc' }}
        thumbColor={value ? '#485aff' : '#f4f4f5'}
      />
    </View>
  );

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
          title="Notification Settings"
          description="Configure how and when you want to receive booking alerts and promotional updates."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Push Notifications Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Push Notifications</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'bell',
            'Service Bookings',
            'Get notified about new bookings, schedules, and status shifts.',
            pushBookings,
            setPushBookings,
          )}
          {renderToggleItem(
            'message-square',
            'In-App Chat Messages',
            'Receive alerts for new messages from customers or partners.',
            pushChat,
            setPushChat,
          )}
          {renderToggleItem(
            'gift',
            'Promotions & Discounts',
            'Keep up with coupon codes, credits, and special deals.',
            pushOffers,
            setPushOffers,
          )}
        </View>

        {/* Email Updates Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Email Preferences</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'mail',
            'Transaction Receipts',
            'Receive copy of bills, payouts, and billing records in email.',
            emailReceipts,
            setEmailReceipts,
          )}
          {renderToggleItem(
            'file-text',
            'Weekly Performance Digest',
            'Get summary reviews, earnings analysis, and newsletter updates.',
            emailWeekly,
            setEmailWeekly,
          )}
        </View>

        {/* Sound & System Settings Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">App Sounds & Vibration</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'volume-2',
            'Sound Effects',
            'Play alert tone on receiving messages or requests.',
            soundEnabled,
            setSoundEnabled,
          )}
          {renderToggleItem(
            'activity',
            'Vibration Alerts',
            'Vibrate device on receiving important request notifications.',
            vibrateEnabled,
            setVibrateEnabled,
          )}
        </View>

        {/* SMS settings Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Text Messages (SMS)</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5">
          {renderToggleItem(
            'message-circle',
            'SMS Booking Updates',
            'Receive text alerts directly on registered mobile number.',
            smsStatus,
            setSmsStatus,
          )}
        </View>
      </ContentLayout>
    </View>
  );
}
