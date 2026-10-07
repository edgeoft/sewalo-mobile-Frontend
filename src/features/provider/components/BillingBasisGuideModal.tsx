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
  description: string;
}

function GuideItem({ number, title, description }: GuideItemProps) {
  return (
    <View className="mb-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/60">
      <Text className="text-xs font-sans-bold text-gray-950 mb-1">
        {number}. {title}
      </Text>
      <Text className="text-[11px] font-sans-medium text-gray-600 leading-relaxed">{description}</Text>
    </View>
  );
}

export default function BillingBasisGuideModal({ visible, onClose }: BillingBasisGuideModalProps) {
  const { t } = useTranslation();

  const guideItems = [
    {
      number: 1,
      title: t('provider.guideFixedPriceTitle', 'Fixed Price'),
      description: t('provider.guideFixedPriceDesc', 'Charge one fixed price for the complete service.'),
    },
    {
      number: 2,
      title: t('provider.guidePerSessionTitle', 'Per Session'),
      description: t('provider.guidePerSessionDesc', 'Charge for each individual session.'),
    },
    {
      number: 3,
      title: t('provider.guidePerHourTitle', 'Per Hour'),
      description: t('provider.guidePerHourDesc', 'Charge based on the time spent providing the service.'),
    },
    {
      number: 4,
      title: t('provider.guidePerDayTitle', 'Per Day'),
      description: t('provider.guidePerDayDesc', 'Charge for each day the service is provided.'),
    },
    {
      number: 5,
      title: t('provider.guidePerJobTitle', 'Per Job'),
      description: t('provider.guidePerJobDesc', 'Charge for completing a specific task or job.'),
    },
    {
      number: 6,
      title: t('provider.guidePerProjectTitle', 'Per Project'),
      description: t(
        'provider.guidePerProjectDesc',
        'Charge for completing a larger project with defined deliverables.',
      ),
    },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: '85%' }}>
          {/* Header */}
          <View className="px-6 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-start">
            <View className="flex-1 mr-4">
              <Text className="text-base font-sans-extrabold text-gray-950">
                {t('provider.quickGuideBillingBasisTitle', 'Quick Guide: Choose Your Billing Basis')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-1">
                {t(
                  'provider.quickGuideBillingBasisSubtitle',
                  'Choose how you normally charge customers for this service.',
                )}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', 'Close')}
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
            {guideItems.map((item) => (
              <GuideItem key={item.number} number={item.number} title={item.title} description={item.description} />
            ))}
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
