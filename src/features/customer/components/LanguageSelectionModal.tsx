import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import SelectionOption from '@/components/ui/SelectionOption';
import { AVAILABLE_LANGUAGES } from '@/constants/languages';
import { THEME_COLORS } from '@/constants/colors';

interface LanguageSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguages: string[];
  onToggleLanguage: (langId: string) => void;
}

export default function LanguageSelectionModal({
  visible,
  onClose,
  selectedLanguages,
  onToggleLanguage,
}: LanguageSelectionModalProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="absolute inset-0 bg-slate-900/40" />
        </TouchableWithoutFeedback>

        <View
          style={{ maxHeight: height * 0.65 }}
          className="bg-white rounded-t-3xl px-5 pb-7 pt-4 border-t border-slate-100 shadow-xl"
        >
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-gray-900 text-xl font-sans-extrabold">{t('common.languages') || 'Languages'}</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
            >
              <Feather name="x" size={16} color={THEME_COLORS.slate500} />
            </Pressable>
          </View>

          <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose the languages you can speak</Text>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="gap-y-2.5 pb-4">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.some(
                  (l) => l.toLowerCase() === lang.id.toLowerCase() || l.toLowerCase() === lang.name.toLowerCase(),
                );
                return (
                  <SelectionOption
                    key={lang.id}
                    onPress={() => onToggleLanguage(lang.id)}
                    title={lang.name}
                    selected={isSelected}
                    indicatorType="checkbox"
                    gradientColors={['#eef0ff', '#f8fafc']}
                  />
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
