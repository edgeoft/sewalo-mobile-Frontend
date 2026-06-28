import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

const SECTION_IDS = [
  'intro',
  'services',
  'definitions',
  'representation',
  'account',
  'platformUse',
  'profile',
  'communication',
  'personalData',
  'serviceListings',
  'bookingPayments',
  'nonCircumvention',
  'cancellations',
  'reviews',
  'notifications',
  'suspension',
  'ip',
  'liability',
  'mvp',
  'law',
  'platformFee',
  'warranties',
] as const;

type ContentBlock = { type: 'p'; text: string } | { type: 'ul'; items: string[] } | { type: 'ol'; items: string[] };

interface SectionData {
  title: string;
  content: ContentBlock[];
}

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  const renderBlock = (block: ContentBlock, blockIdx: number) => {
    if (!block) return null;

    if (block.type === 'p') {
      return (
        <Text key={blockIdx} className="text-xs font-sans-regular text-gray-500 leading-5 mb-4">
          {block.text}
        </Text>
      );
    }

    if (block.type === 'ul' && Array.isArray(block.items)) {
      return (
        <View key={blockIdx} className="mb-4 gap-y-2">
          {block.items.map((item, idx) => (
            <View key={idx} className="flex-row items-start pl-2 pr-4">
              <Text className="text-xs font-sans-bold text-gray-500 mr-2 leading-5">•</Text>
              <Text className="text-xs font-sans-regular text-gray-500 leading-5 flex-1">{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (block.type === 'ol' && Array.isArray(block.items)) {
      return (
        <View key={blockIdx} className="mb-4 gap-y-2">
          {block.items.map((item, idx) => (
            <View key={idx} className="flex-row items-start pl-2 pr-4">
              <Text className="text-xs font-sans-bold text-gray-500 mr-2 leading-5">{idx + 1}.</Text>
              <Text className="text-xs font-sans-regular text-gray-500 leading-5 flex-1">{item}</Text>
            </View>
          ))}
        </View>
      );
    }

    return null;
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
          title={t('terms.pageTitle') || 'Terms of Service'}
          description={t('terms.meta.description') || 'Please read these terms carefully before using our platform.'}
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <ScrollView scrollEnabled={false} className="gap-y-6">
            {SECTION_IDS.map((id) => {
              const section = t(`terms.sections.${id}`, { returnObjects: true }) as SectionData;
              if (!section || !section.title) return null;

              return (
                <View key={id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <Text className="text-sm font-sans-bold text-gray-900 mb-3">{section.title}</Text>
                  <View>
                    {Array.isArray(section.content) && section.content.map((block, idx) => renderBlock(block, idx))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <Text className="text-[10px] font-sans-medium text-gray-400 text-center mt-3">
          {t('settings.termsContact')}
        </Text>
      </ContentLayout>
    </View>
  );
}
