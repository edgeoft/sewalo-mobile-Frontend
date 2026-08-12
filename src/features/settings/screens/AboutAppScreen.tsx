import React, { useState } from 'react';
import { View, Text, Linking, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader, UpdateAlertModal } from '@/components/common';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useDistributionUpdate } from '@/hooks/useDistributionUpdate';

export default function AboutAppScreen() {
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const { version, buildNumber, isBeta, isChecking, updateInfo, checkForUpdate } = useDistributionUpdate();

  const handleCheckUpdates = async () => {
    const result = await checkForUpdate();
    if (result.updateAvailable) {
      setShowUpdateModal(true);
    } else {
      showSnackbar({
        message: t('settings.appUpToDate'),
        type: 'success',
      });
    }
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      showSnackbar({ message: t('settings.unableToOpenLink') + url, type: 'error' });
    });
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
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
          title={t('settings.aboutTitle')}
          description={t('settings.aboutDesc')}
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
          <Text className="text-xs font-sans-semibold text-primary mb-5">{t('settings.tagline')}</Text>

          <View className="w-full border-t border-gray-50 pt-4 gap-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">{t('settings.version')}</Text>
              <View className="flex-row items-center gap-x-2">
                <Text className="text-xs font-sans-bold text-gray-800">
                  {version.startsWith('v') ? version : `v${version}`} (Build {buildNumber})
                </Text>
                <View className={`px-2 py-0.5 rounded-full ${isBeta ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                  <Text className={`text-[10px] font-sans-bold ${isBeta ? 'text-amber-800' : 'text-emerald-800'}`}>
                    {isBeta ? 'Beta' : 'Production'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">{t('settings.developer')}</Text>
              <Text className="text-xs font-sans-bold text-gray-800">Edgeoft Pvt. Ltd.</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">{t('settings.website')}</Text>
              <Pressable
                onPress={() => handleOpenLink('https://sewalo.com')}
                accessibilityRole="button"
                className="active:opacity-50"
              >
                <Text className="text-xs font-sans-bold text-primary underline">www.sewalo.com</Text>
              </Pressable>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-xs font-sans-semibold text-gray-400">{t('settings.releaseDate')}</Text>
              <Text className="text-xs font-sans-bold text-gray-800">August 2026</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-y-3">
          <Button
            title={isChecking ? t('settings.checking') : t('settings.checkForUpdates')}
            variant="outline"
            loading={isChecking}
            onPress={handleCheckUpdates}
            className="w-full h-12 bg-white border-gray-200"
            textClassName="text-gray-700"
          />
        </View>

        {/* Copyright Footer */}
        <View className="mt-8 items-center justify-center">
          <Text className="text-[10px] font-sans-semibold text-gray-400 text-center leading-4">
            {t('settings.copyright')}
          </Text>
          <Text className="text-[10px] font-sans-medium text-gray-450 text-center mt-1 leading-4">
            {t('settings.madeWithLove')}
          </Text>
        </View>
      </ContentLayout>

      {/* Update Modal */}
      <UpdateAlertModal
        visible={showUpdateModal}
        latestVersion={updateInfo?.latestVersion}
        releaseNotes={updateInfo?.releaseNotes}
        isMandatory={updateInfo?.isMandatory}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={() => {
          setShowUpdateModal(false);
          // Launch distribution update or store link
        }}
      />
    </View>
  );
}
