import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';

import SelectionOption from './SelectionOption';

const languages = [
  { code: 'en', name: 'Eng', flag: '🇺🇸', label: 'English' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵', label: 'नेपाली (Nepali)' },
];

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = i18n.language || 'en';
  const activeLang = languages.find((l) => currentLanguage.startsWith(l.code)) || languages[0];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="flex-row items-center active:opacity-75"
        accessibilityRole="button"
        accessibilityLabel="Change language"
      >
        <Text className="text-base mr-1">{activeLang.flag}</Text>
        <Text className="text-gray-800 font-sans-medium text-sm mr-1">{activeLang.name}</Text>
        <Feather name="chevron-down" size={13} color="#9ca3af" />
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.56 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('common.changeLanguage')}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose your preferred app language</Text>

            <View className="gap-y-2.5">
              {languages.map((lang) => {
                const isSelected = currentLanguage.startsWith(lang.code);
                return (
                  <SelectionOption
                    key={lang.code}
                    onPress={() => handleSelectLanguage(lang.code)}
                    title={lang.label}
                    subtitle={isSelected ? 'Currently selected' : undefined}
                    selected={isSelected}
                    icon={<Text className="text-lg">{lang.flag}</Text>}
                    iconStyle="plain"
                    indicatorType="radio"
                    gradientColors={['#eef0ff', '#f8fafc']}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7, 17, 31, 0.4)',
  },
  drawerContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
});
