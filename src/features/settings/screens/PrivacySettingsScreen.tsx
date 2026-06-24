import React, { useState } from 'react';
import { View, Text, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

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
      title: 'Download Data',
      message:
        'We will compile your personal profile, services, and transactions history into a zip archive and send it to your email within 24 hours.',
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => showSnackbar({ message: 'Data export request submitted!', type: 'success' }),
        },
      ],
    });
  };

  const handleDeleteAccount = () => {
    showError({
      title: 'Delete Account',
      message:
        'WARNING: Deleting your account will permanently wipe all your profile details, booking histories, and earnings. This action is irreversible.\n\nAre you sure you want to proceed?',
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delete',
          style: 'destructive',
          onPress: () => {
            showError({
              title: 'Final Confirmation Required',
              message:
                'Please confirm once more that you want to DELETE your account. All data will be destroyed immediately.',
              actions: [
                { text: 'Cancel', style: 'cancel' },
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
          title="Privacy Settings"
          description="Control your account visibility, data preferences, and account security details."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Profile and Visibility */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Visibility & Activity</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'eye',
            'Public Profile Search',
            'Allow other users to locate your profile in direct search outcomes.',
            profileVisible,
            setProfileVisible,
          )}
          {renderToggleItem(
            'circle',
            'Online Status',
            'Show when you are active to clients or service providers in chat.',
            activityStatus,
            setActivityStatus,
          )}
        </View>

        {/* Data Preferences */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Security & Verification</Text>
        <View style={cardShadow} className="bg-white rounded-xl border border-gray-100 px-4 py-1.5 mb-6">
          {renderToggleItem(
            'lock',
            'Two-Factor Authentication (2FA)',
            'Require verification code in SMS for login attempts.',
            twoFactorAuth,
            setTwoFactorAuth,
          )}
          {renderToggleItem(
            'shield',
            'Share Analytics Data',
            'Permit tracking diagnostics statistics to improve Sewalo services.',
            shareData,
            setShareData,
          )}
        </View>

        {/* Account Actions Section */}
        <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">Account Management</Text>
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
                <Text className="text-sm font-sans-bold text-gray-900">Download My Account Data</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                  Request copy of your stored details.
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
                <Text className="text-sm font-sans-bold text-red-500">Permanently Delete Account</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
                  Wipe profile info, records and login.
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
