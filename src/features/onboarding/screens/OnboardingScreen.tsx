import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, SafeAreaView, Text, View } from 'react-native';

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith('en') ? 'ne' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-2xl font-semibold text-blue-600 text-center">{t('onboarding.welcome')}</Text>

        <View className="mt-6">
          <Link href={'/auth' as never} asChild>
            <Pressable>
              <Text className="text-blue-600 text-center font-medium text-lg">{t('onboarding.goToAuth')}</Text>
            </Pressable>
          </Link>
        </View>

        <Pressable onPress={toggleLanguage} className="mt-8 px-4 py-2 bg-blue-100 rounded-lg active:bg-blue-200">
          <Text className="text-blue-700 font-semibold">
            {t('common.changeLanguage')} ({i18n.language.startsWith('en') ? 'English' : 'नेपाली'})
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
