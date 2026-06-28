import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { ROUTES } from '@/constants/routes';

export default function ServiceCreatedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const handleGoToServices = () => {
    router.replace(ROUTES.provider.services);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  const steps = [
    {
      step: '1',
      title: t('provider.searchStep'),
      description: t('provider.searchStepDesc'),
      icon: 'search' as const,
      color: '#485aff',
      bg: 'bg-primary/10',
    },
    {
      step: '2',
      title: t('provider.discoverStep'),
      description: t('provider.discoverStepDesc'),
      icon: 'award' as const,
      color: '#d97706',
      bg: 'bg-amber-50 border border-amber-200/50',
    },
    {
      step: '3',
      title: t('provider.connectStep'),
      description: t('provider.connectStepDesc'),
      icon: 'calendar' as const,
      color: '#059669',
      bg: 'bg-emerald-50 border border-emerald-200/50',
    },
  ];

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={false} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 24,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        {/* Left-Aligned Success Hero Section */}
        <View className="mb-6">
          {/* Success Icon Badge */}
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 mb-4">
            <Feather name="check-circle" size={28} color="#10b981" />
          </View>

          {/* Celebration Heading */}
          <Text className="text-2xl font-sans-extrabold text-gray-900 leading-8">{t('provider.serviceSubmitted')}</Text>

          {/* Subtext */}
          <Text className="text-xs font-sans-medium text-gray-500 mt-2 leading-5">
            {t('provider.serviceSubmittedDesc')}
          </Text>

          {/* View Service button directly under success text */}
          <View className="w-full max-w-[180px] mt-5">
            <Button
              title={t('provider.viewService')}
              variant="primary"
              size="md"
              onPress={handleGoToServices}
              rightIcon={<Feather name="arrow-right" size={14} color="#ffffff" />}
            />
          </View>
        </View>

        <View className="gap-y-5">
          {/* Admin Review Card */}
          <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2.5">
                <View className="h-6 w-6 rounded-full bg-primary/10 items-center justify-center">
                  <Feather name="shield" size={12} color="#485aff" />
                </View>
                <Text className="text-xs font-sans-bold text-gray-900">{t('provider.adminReview')}</Text>
              </View>
              <View className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5">
                <Text className="text-[9px] font-sans-bold text-amber-700 uppercase">{t('provider.underReview')}</Text>
              </View>
            </View>

            <Text className="text-xs font-sans-medium text-gray-500 leading-5 mb-4">
              {t('provider.reviewDescription')}
            </Text>

            <View className="flex-row items-center gap-2 pt-3 border-t border-gray-200/50">
              <View className="h-2 w-2 rounded-full bg-primary/70" />
              <Text className="text-[10px] font-sans-semibold text-gray-400">{t('provider.reviewTimespan')}</Text>
            </View>
          </View>

          {/* Discovery Card (How Customers Will Find You) */}
          <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4">
            <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-4">
              {t('provider.howCustomersFindYou')}
            </Text>

            <View className="gap-y-4">
              {steps.map((item, index) => (
                <View
                  key={item.step}
                  className={`flex-row gap-x-3 pb-3 ${index !== steps.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <View className={`h-8 w-8 rounded-full items-center justify-center ${item.bg}`}>
                    <Feather name={item.icon} size={14} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[9px] font-sans-bold uppercase tracking-wider" style={{ color: item.color }}>
                      {t('provider.stepNumber', { number: item.step })}
                    </Text>
                    <Text className="text-xs font-sans-bold text-gray-900 mt-0.5">{item.title}</Text>
                    <Text className="text-xs font-sans-medium text-gray-500 mt-1 leading-normal">
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ContentLayout>
    </View>
  );
}
