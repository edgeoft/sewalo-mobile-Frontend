import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import { cardShadow } from '@/constants/shadows';
import { useNotificationSettingsStore } from '@/store/useNotificationSettingsStore';

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const pushBookings = useNotificationSettingsStore((s) => s.pushBookings);
  const pushOffers = useNotificationSettingsStore((s) => s.pushOffers);
  const pushChat = useNotificationSettingsStore((s) => s.pushChat);
  const emailWeekly = useNotificationSettingsStore((s) => s.emailWeekly);
  const emailReceipts = useNotificationSettingsStore((s) => s.emailReceipts);
  const smsStatus = useNotificationSettingsStore((s) => s.smsStatus);
  const soundEnabled = useNotificationSettingsStore((s) => s.soundEnabled);
  const vibrateEnabled = useNotificationSettingsStore((s) => s.vibrateEnabled);
  const setToggle = useNotificationSettingsStore((s) => s.setToggle);

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
          title={t('settings.notificationSettingsTitle')}
          description={t('settings.notificationSettingsDesc')}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Push Notifications Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.pushNotifications')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'bell',
            t('settings.serviceBookings'),
            t('settings.serviceBookingsDesc'),
            pushBookings,
            (val) => setToggle('pushBookings', val),
          )}
          {renderToggleItem(
            'message-square',
            t('settings.inAppChatMessages'),
            t('settings.inAppChatMessagesDesc'),
            pushChat,
            (val) => setToggle('pushChat', val),
          )}
          {renderToggleItem(
            'gift',
            t('settings.promotionsDiscounts'),
            t('settings.promotionsDiscountsDesc'),
            pushOffers,
            (val) => setToggle('pushOffers', val),
          )}
        </View>

        {/* Email Updates Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.emailNotifications')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'mail',
            t('settings.transactionReceipts'),
            t('settings.transactionReceiptsDesc'),
            emailReceipts,
            (val) => setToggle('emailReceipts', val),
          )}
          {renderToggleItem(
            'file-text',
            t('settings.weeklyPerformanceDigest'),
            t('settings.weeklyPerformanceDigestDesc'),
            emailWeekly,
            (val) => setToggle('emailWeekly', val),
          )}
        </View>

        {/* Sound & System Settings Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.appSoundsVibration')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'volume-2',
            t('settings.soundEffects'),
            t('settings.soundEffectsDesc'),
            soundEnabled,
            (val) => setToggle('soundEnabled', val),
          )}
          {renderToggleItem(
            'activity',
            t('settings.vibrationAlerts'),
            t('settings.vibrationAlertsDesc'),
            vibrateEnabled,
            (val) => setToggle('vibrateEnabled', val),
          )}
        </View>

        {/* SMS settings Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.smsNotifications')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5">
          {renderToggleItem(
            'message-circle',
            t('settings.smsBookingUpdates'),
            t('settings.smsBookingUpdatesDesc'),
            smsStatus,
            (val) => setToggle('smsStatus', val),
          )}
        </View>
      </ContentLayout>
    </View>
  );
}
