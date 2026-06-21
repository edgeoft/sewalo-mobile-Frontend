import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

const SECTION_IDS = [
  'introduction',
  'purpose',
  'dataCollection',
  'chatAndCall',
  'dataUse',
  'dataSharing',
  'aggregatedData',
  'cookies',
  'userRights',
  'dataRetention',
  'security',
  'children',
  'location',
  'limitations',
  'notifications',
  'wallet',
  'updates',
] as const;

interface SectionData {
  title: string;
  content: string[];
}

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

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
          title={t('privacy.pageTitle') || 'Privacy Policy'}
          description={t('privacy.meta.description') || 'This policy outlines how we safeguard your personal details.'}
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <ScrollView scrollEnabled={false} className="gap-y-6">
            {SECTION_IDS.map((id) => {
              const section = t(`privacy.sections.${id}`, { returnObjects: true }) as SectionData;
              if (!section || !section.title) return null;

              return (
                <View key={id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <Text className="text-sm font-sans-bold text-gray-900 mb-3">{section.title}</Text>
                  <View className="gap-y-3">
                    {Array.isArray(section.content) &&
                      section.content.map((paragraph, index) => {
                        if (!paragraph) return null;
                        return (
                          <Text key={index} className="text-xs font-sans-regular text-gray-500 leading-5">
                            {paragraph}
                          </Text>
                        );
                      })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <Text className="text-[10px] font-sans-medium text-gray-400 text-center mt-3">
          If you have questions regarding this policy, contact us at privacy@sewalo.com
        </Text>
      </ContentLayout>
    </View>
  );
}
