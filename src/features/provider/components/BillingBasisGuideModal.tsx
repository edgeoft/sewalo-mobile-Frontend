import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

interface BillingBasisGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

interface GuideItemProps {
  number: number;
  title: string;
  whatItMeans: string;
  bestFor: string;
  examples: string;
}

function GuideItem({
  number,
  title,
  whatItMeans,
  bestFor,
  examples,
  t,
}: GuideItemProps & { t: (key: string) => string }) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-sans-bold text-gray-900 mb-1.5">
        {number}. {title}
      </Text>

      <View className="pl-0.5 gap-y-1">
        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">{t('provider.whatItMeans')} </Text>
          {whatItMeans}
        </Text>

        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">{t('provider.bestFor')} </Text>
          {bestFor}
        </Text>

        <Text className="text-[11px] font-sans-medium text-gray-600 leading-normal">
          <Text className="font-sans-bold text-gray-800">{t('provider.examples')} </Text>
          {examples}
        </Text>
      </View>
    </View>
  );
}

export default function BillingBasisGuideModal({ visible, onClose }: BillingBasisGuideModalProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl overflow-hidden" style={{ height: '80%' }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-base font-sans-extrabold text-gray-950">
                Quick Guide: How to Choose Your Billing Basis
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1">
                Choose the option that best fits how you work and charge.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              className="h-8 w-8 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
            >
              <Feather name="x" size={18} color={THEME_COLORS.slate500} />
            </Pressable>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            className="px-6 py-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* VAT-Inclusive Pricing Note */}
            <View className="flex-row items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 mb-5">
              <Feather name="info" size={16} color={THEME_COLORS.infoBlue} style={{ marginTop: 1 }} />
              <View className="flex-1">
                <Text className="text-xs font-sans-bold text-blue-900 mb-0.5">{t('services.vatInclusivePricing')}</Text>
                <Text className="text-[11px] font-sans-medium text-blue-700 leading-4">
                  {t('services.vatInclusivePricingDesc')}
                </Text>
              </View>
            </View>

            <GuideItem
              number={1}
              title={t('provider.perService')}
              whatItMeans={t('provider.perServiceMeans')}
              bestFor={t('provider.perServiceBestFor')}
              examples={t('provider.perServiceExamples')}
              t={t}
            />

            <GuideItem
              number={2}
              title={t('provider.perJob')}
              whatItMeans={t('provider.perJobMeans')}
              bestFor={t('provider.perJobBestFor')}
              examples={t('provider.perJobExamples')}
              t={t}
            />

            <GuideItem
              number={3}
              title={t('provider.fixedTotal')}
              whatItMeans={t('provider.fixedTotalMeans')}
              bestFor={t('provider.fixedTotalBestFor')}
              examples={t('provider.fixedTotalExamples')}
              t={t}
            />

            <GuideItem
              number={4}
              title={t('provider.perProject')}
              whatItMeans={t('provider.perProjectMeans')}
              bestFor={t('provider.perProjectBestFor')}
              examples={t('provider.perProjectExamples')}
              t={t}
            />

            <GuideItem
              number={5}
              title={t('provider.startingAt')}
              whatItMeans={t('provider.startingAtMeans')}
              bestFor={t('provider.startingAtBestFor')}
              examples={t('provider.startingAtExamples')}
              t={t}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
