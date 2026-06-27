import React, { useState } from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();
  const { t } = useTranslation();

  const [profileVisible, setProfileVisible] = useState(true);
  const [shareData, setShareData] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  const handleDownloadData = () => {
    showError({
      title: t('settings.downloadData'),
      message: t('settings.downloadDataMessage'),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => showSnackbar({ message: t('settings.dataExportSubmitted'), type: 'success' }),
        },
      ],
    });
  };

  const handleDeleteAccount = () => {
    showError({
      title: t('settings.deleteAccount'),
      message: t('settings.deleteAccountConfirm'),
      actions: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.permanentlyDelete'),
          style: 'destructive',
          onPress: () => {
            showError({
              title: t('settings.finalConfirmationTitle'),
              message: t('settings.finalConfirmationMessage'),
              actions: [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: 'Permanently Delete',
                  style: 'destructive',
                  onPress: () => {
                    logout();
                    router.replace(ROUTES.auth.signup);
                  },
                },
              ],
            });
          },
        },
      ],
    });
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
          title={t('settings.privacySettingsTitle')}
          description={t('settings.privacySettingsDesc')}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Profile and Visibility */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.visibilityAndActivity')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'eye',
            t('settings.publicProfileSearch'),
            t('settings.publicProfileSearchDesc'),
            profileVisible,
            setProfileVisible,
          )}
          {renderToggleItem(
            'circle',
            t('settings.onlineStatus'),
            t('settings.onlineStatusDesc'),
            activityStatus,
            setActivityStatus,
          )}
        </View>

        {/* Data Preferences */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.securityAndVerification')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'lock',
            t('settings.twoFactorAuth'),
            t('settings.twoFactorAuthDesc'),
            twoFactorAuth,
            setTwoFactorAuth,
          )}
          {renderToggleItem(
            'shield',
            t('settings.shareAnalyticsData'),
            t('settings.shareAnalyticsDataDesc'),
            shareData,
            setShareData,
          )}
        </View>

        {/* Account Actions Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('settings.accountManagement')}</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-2">
          {/* Download Data */}
          <Pressable
            onPress={handleDownloadData}
            className="flex-row items-center justify-between py-3.5 border-b border-gray-50 active:opacity-60"
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Feather name="download" size={15} color="#1d4ed8" />
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-gray-900">{t('settings.downloadData')}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                  {t('settings.downloadDataDesc')}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </Pressable>

          {/* Delete Account */}
          <Pressable
            onPress={handleDeleteAccount}
            className="flex-row items-center justify-between py-3.5 active:opacity-60"
          >
            <View className="flex-row items-center flex-1">
              <View className="h-8 w-8 rounded-full bg-red-50 items-center justify-center mr-3">
                <Feather name="trash-2" size={15} color="#ef4444" />
              </View>
              <View>
                <Text className="text-sm font-sans-bold text-red-500">{t('settings.deleteAccount')}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                  {t('settings.deleteAccountDesc')}
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={16} color="#94a3b8" />
          </Pressable>
        </View>
      </ContentLayout>
    </View>
  );
}
