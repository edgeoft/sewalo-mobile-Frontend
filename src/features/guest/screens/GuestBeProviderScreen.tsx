import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { SectionHeader } from '@/components/common';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import { BECOME_PROVIDER } from '@/constants/images';
import { ROUTES } from '@/constants/routes';
import { USER_ROLES } from '@/types';
import BeProviderBenefitCard from '../components/BeProviderBenefitCard';
import BeProviderFaqItem from '../components/BeProviderFaqItem';
import BeProviderHeroSection from '../components/BeProviderHeroSection';
import BeProviderStepCard from '../components/BeProviderStepCard';

export default function GuestBeProviderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const steps = [
    {
      step: '1',
      title: t('guest.signUp'),
      description: t('guest.signUpDesc'),
    },
    {
      step: '2',
      title: t('guest.setupProfile'),
      description: t('guest.setupProfileDesc'),
    },
    {
      step: '3',
      title: t('guest.connectWithClients'),
      description: t('guest.connectWithClientsDesc'),
    },
    {
      step: '4',
      title: t('guest.getPaid'),
      description: t('guest.getPaidDesc'),
    },
  ];

  const benefits = [
    {
      icon: 'briefcase' as const,
      color: '#485aff',
      title: t('guest.beYourOwnBoss'),
      description: t('guest.beYourOwnBossDesc'),
    },
    {
      icon: 'credit-card' as const,
      color: '#10b981',
      title: t('guest.setYourOwnEarnings'),
      description: t('guest.setYourOwnEarningsDesc'),
    },
    {
      icon: 'users' as const,
      color: '#f59e0b',
      title: t('guest.reachMoreCustomers'),
      description: t('guest.reachMoreCustomersDesc'),
    },
    {
      icon: 'trending-up' as const,
      color: '#ec4899',
      title: t('guest.learnAndGrow'),
      description: t('guest.learnAndGrowDesc'),
    },
  ];

  const faqs = [
    {
      question: t('guest.faqWhoCanBecome'),
      answer: t('guest.faqWhoCanBecomeAns'),
    },
    {
      question: t('guest.faqHowToList'),
      answer: t('guest.faqHowToListAns'),
    },
    {
      question: t('guest.faqHowReceiveEarnings'),
      answer: t('guest.faqHowReceiveEarningsAns'),
    },
    {
      question: t('guest.faqCommission'),
      answer: t('guest.faqCommissionAns'),
    },
  ];

  const handleGetStarted = () => {
    router.push({
      pathname: ROUTES.auth.signup,
      params: { role: USER_ROLES.Provider },
    });
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <BeProviderHeroSection />

        <View className="pb-8">
          <SectionHeader title={t('guest.howItWorks')} description={t('guest.howItWorksDesc')} className="mb-5" />
          <Image source={BECOME_PROVIDER.process} className="w-full h-40 rounded-2xl mb-5" resizeMode="cover" />
          <View className="gap-y-3">
            {steps.map((item) => (
              <BeProviderStepCard key={item.step} {...item} />
            ))}
          </View>
        </View>

        <View className="pb-8">
          <SectionHeader title={t('guest.keyBenefits')} description={t('guest.keyBenefitsDesc')} className="mb-5" />
          <Image source={BECOME_PROVIDER.benefits} className="w-full h-40 rounded-2xl mb-5" resizeMode="cover" />
          <View className="gap-y-3">
            {benefits.map((item) => (
              <BeProviderBenefitCard key={item.title} {...item} />
            ))}
          </View>
        </View>

        <View className="pb-8">
          <SectionHeader
            title={t('guest.frequentlyAskedQuestions')}
            description={t('guest.frequentlyAskedQuestionsDesc')}
            className="mb-5"
          />
          <View className="gap-y-3">
            {faqs.map((item, index) => (
              <BeProviderFaqItem key={item.question} {...item} defaultOpen={index === 0} />
            ))}
          </View>
        </View>

        <View className="rounded-2xl bg-white border border-gray-200 p-5 mb-2">
          <Text className="text-xl font-sans-extrabold text-gray-950 tracking-tight mb-2">
            {t('guest.readyToGrow')}
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-6 mb-5">{t('guest.readyToGrowDesc')}</Text>
          <Button
            title={t('guest.startAsProvider')}
            variant="primary"
            onPress={handleGetStarted}
            rightIcon={<Feather name="arrow-right" size={16} color="#ffffff" />}
            accessibilityLabel="Start as provider"
          />
        </View>
      </ContentLayout>
    </View>
  );
}
