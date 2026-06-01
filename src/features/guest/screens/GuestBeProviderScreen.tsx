import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const steps = [
  {
    step: '1',
    title: 'Sign Up',
    description: 'Create your account in minutes with just a few details.',
  },
  {
    step: '2',
    title: 'Setup Your Profile',
    description: 'Showcase your skills, services, and experience.',
  },
  {
    step: '3',
    title: 'Connect with Clients',
    description: 'Get matched with clients looking for your services.',
  },
  {
    step: '4',
    title: 'Get Paid',
    description: 'Receive secure payments for your completed work.',
  },
];

const benefits = [
  {
    icon: 'briefcase' as const,
    color: '#485aff',
    title: 'Be Your Own Boss',
    description: "Decide when, where, and how you work - whether it's home services, tutoring, repairs, or beauty.",
  },
  {
    icon: 'credit-card' as const,
    color: '#10b981',
    title: 'Set Your Own Earnings',
    description: 'Choose your price and get paid safely via digital wallet or cash - no middlemen, no surprises.',
  },
  {
    icon: 'users' as const,
    color: '#f59e0b',
    title: 'Reach More Customers',
    description: 'No need to advertise - Sewalo connects you with people looking for your services.',
  },
  {
    icon: 'trending-up' as const,
    color: '#ec4899',
    title: 'Learn & Grow',
    description: 'Training and support to improve skills and boost credibility.',
  },
];

const faqs = [
  {
    question: 'Who can become a service provider?',
    answer:
      'Anyone who offers professional services and meets basic eligibility requirements can join Sewalo. Certain services may require certifications or licenses, which we will guide you through during signup.',
  },
  {
    question: 'How do I list my service?',
    answer:
      'Anyone who offers professional services and meets basic eligibility requirements can join Sewalo. Certain services may require certifications or licenses, which we will guide you through during signup.',
  },
  {
    question: 'How will I receive my earnings?',
    answer:
      'Sewalo lets you get paid through your preferred method, such as bank deposit or digital wallets. Simply select your preferred option in the financial section when creating your profile, and your earnings will be securely processed.',
  },
  {
    question: 'Does Sewalo charge commission on my earnings?',
    answer:
      "Yes, Sewalo applies a small platform fee per booking to support secure payments and maintain the platform. Exact details of fees are provided in your provider agreement and your account dashboard, so you always know what you'll earn.",
  },
];

export default function GuestBeProviderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          <SectionHeader
            title="How It Works"
            description="Join our platform in just a few simple steps and start growing your business today."
            className="mb-5"
          />
          <Image source={BECOME_PROVIDER.process} className="w-full h-40 rounded-2xl mb-5" resizeMode="cover" />
          <View className="gap-y-3">
            {steps.map((item) => (
              <BeProviderStepCard key={item.step} {...item} />
            ))}
          </View>
        </View>

        <View className="pb-8">
          <SectionHeader
            title="Key Benefits"
            description="Why service providers choose Sewalo to grow their business."
            className="mb-5"
          />
          <Image source={BECOME_PROVIDER.benefits} className="w-full h-40 rounded-2xl mb-5" resizeMode="cover" />
          <View className="gap-y-3">
            {benefits.map((item) => (
              <BeProviderBenefitCard key={item.title} {...item} />
            ))}
          </View>
        </View>

        <View className="pb-8">
          <SectionHeader
            title="Frequently asked questions"
            description="These are the questions we hear more often."
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
            Ready to grow with Sewalo?
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-6 mb-5">
            Create your provider profile and start connecting with clients looking for your skills.
          </Text>
          <Button
            title="Start as provider"
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
