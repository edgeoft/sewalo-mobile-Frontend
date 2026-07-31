import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Input from '@/components/ui/Input';

interface FaqItem {
  id: string;
  category: 'general' | 'bookings' | 'payments' | 'safety';
  question: string;
  answer: string;
}

export default function HelpFaqScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const FAQ_ITEMS: FaqItem[] = useMemo(
    () => [
      {
        id: 'faq-1',
        category: 'bookings',
        question: t('settings.howToBook'),
        answer: t('settings.howToBookAns'),
      },
      {
        id: 'faq-2',
        category: 'payments',
        question: t('settings.whatPaymentMethods'),
        answer: t('settings.whatPaymentMethodsAns'),
      },
      {
        id: 'faq-3',
        category: 'bookings',
        question: t('settings.howToCancel'),
        answer: t('settings.howToCancelAns'),
      },
      {
        id: 'faq-4',
        category: 'safety',
        question: t('settings.howVerifyProviders'),
        answer: t('settings.howVerifyProvidersAns'),
      },
      {
        id: 'faq-5',
        category: 'payments',
        question: t('settings.howPaymentsWork'),
        answer: t('settings.howPaymentsWorkAns'),
      },
      {
        id: 'faq-6',
        category: 'general',
        question: t('settings.whatIsSewalo'),
        answer: t('settings.whatIsSewaloAns'),
      },
      {
        id: 'faq-7',
        category: 'safety',
        question: t('settings.whatIfDamage'),
        answer: t('settings.whatIfDamageAns'),
      },
    ],
    [t],
  );

  const CATEGORIES = useMemo(
    () => [
      { key: 'all', label: t('settings.allFaqs') },
      { key: 'general', label: t('settings.general') },
      { key: 'bookings', label: t('settings.bookings') },
      { key: 'payments', label: t('settings.payments') },
      { key: 'safety', label: t('settings.safety') },
    ],
    [t],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' ? true : item.category === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [FAQ_ITEMS, searchQuery, selectedCategory]);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout scrollable={false} className="flex-1" style={{ paddingTop: 20 }}>
        <SectionHeader
          title={t('settings.helpFaqTitle')}
          description={t('settings.helpFaqDesc')}
          className="mb-4"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Search Input */}
        <View className="mb-4">
          <Input
            placeholder={t('settings.searchQuestions')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Feather name="search" size={16} color="var(--muted-foreground)" />}
            className="h-12"
            inputClassName="text-sm font-sans-medium"
            containerStyle={{
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 0,
            }}
          />
        </View>

        {/* Category horizontal scrolling bar */}
        <View className="mb-4">
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8 }}
            renderItem={({ item }) => {
              const active = selectedCategory === item.key;
              return (
                <Pressable
                  onPress={() => setSelectedCategory(item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    active ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-sans-semibold ${active ? 'text-white' : 'text-gray-600'}`}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        {/* FAQ List */}
        <View className="flex-1">
          <FlatList
            data={filteredFaqs}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24),
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-12 px-6">
                <View className="h-12 w-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Feather name="help-circle" size={20} color="var(--muted-foreground)" />
                </View>
                <Text className="text-sm font-sans-bold text-gray-900 mb-1 text-center">
                  {t('settings.noResultsFound')}
                </Text>
                <Text className="text-xs font-sans-medium text-gray-400 text-center">
                  {t('settings.tryDifferentKeyword')}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isExpanded = !!expandedIds[item.id];
              return (
                <View style={cardShadow} className="bg-white rounded-xl mb-3 overflow-hidden">
                  <Pressable
                    onPress={() => toggleExpand(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                    className="flex-row justify-between items-center p-4 active:bg-gray-50/50"
                  >
                    <Text className="text-xs font-sans-bold text-gray-900 flex-1 mr-4">{item.question}</Text>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color="var(--muted-foreground)"
                      accessible={false}
                    />
                  </Pressable>

                  {isExpanded && (
                    <View className="px-4 pb-4 border-t border-gray-50 pt-3">
                      <Text className="text-xs font-sans-regular text-gray-500 leading-5">{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            }}
          />
        </View>
      </ContentLayout>
    </View>
  );
}
