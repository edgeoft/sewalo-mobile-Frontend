import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const currentLanguage = i18n.language || 'en';

  const languages = [
    { code: 'en', name: 'Eng(US)', flag: '🇺🇸', label: 'English (US)' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵', label: 'नेपाली (Nepali)' },
  ];

  const activeLang = languages.find((l) => currentLanguage.startsWith(l.code)) || languages[0];

  const handleSelectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7} className="flex-row items-center">
        <Text className="text-base mr-1">{activeLang.flag}</Text>
        <Text className="text-gray-800 font-sans-medium text-[13px] mr-1">{activeLang.name}</Text>
        <Text className="text-gray-400 text-[10px]">▼</Text>
      </TouchableOpacity>
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

          <View style={styles.drawerContainer} className="bg-white px-5 pb-8 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />

            <Text className="text-gray-900 text-lg font-sans-bold mb-4">{t('common.changeLanguage')}</Text>

            <View className="gap-y-3">
              {languages.map((lang) => {
                const isSelected = currentLanguage.startsWith(lang.code);
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleSelectLanguage(lang.code)}
                    activeOpacity={0.7}
                    className={`flex-row items-center justify-between p-4 rounded-xl border ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50/50'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">{lang.flag}</Text>
                      <View>
                        <Text
                          className={`text-base ${
                            isSelected ? 'text-primary font-sans-semibold' : 'text-gray-800 font-sans-medium'
                          }`}
                        >
                          {lang.label}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View className="w-5 h-5 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
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
    maxHeight: height * 0.5,
  },
});
