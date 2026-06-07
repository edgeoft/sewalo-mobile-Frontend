import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

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

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'bookings',
    question: 'How do I book a service on Sewalo?',
    answer:
      'To book a service, navigate to the Find Services tab, search or select a service category (like cleaning or plumbing), select a date and time, choose your preferred service provider based on reviews/pricing, and confirm your request.',
  },
  {
    id: 'faq-2',
    category: 'payments',
    question: 'What payment methods are supported?',
    answer:
      'We currently support digital wallet payments via eSewa and Khalti, direct bank transfers, and Cash on Delivery (COD) once the service is successfully completed.',
  },
  {
    id: 'faq-3',
    category: 'bookings',
    question: 'Can I cancel or reschedule a booking?',
    answer:
      'Yes. You can cancel or reschedule for free up to 2 hours before the scheduled time. Go to My Bookings, click on the booking details, and select Cancel or Reschedule. Cancellations within 2 hours may incur a small fee.',
  },
  {
    id: 'faq-4',
    category: 'safety',
    question: 'How does Sewalo verify service providers?',
    answer:
      'All providers undergo a strict verification process. They must submit government-issued photo IDs (Citizenship/Passport), professional certificates, and pass a background check before they are approved to accept bookings.',
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: 'How do payouts work for provider partners?',
    answer:
      'Payouts are cleared weekly. Every Friday, the earnings from your completed services are compiled and transferred directly to your linked primary payout account (bank or eSewa/Khalti wallet).',
  },
  {
    id: 'faq-6',
    category: 'general',
    question: 'What are loyalty points and how do I use them?',
    answer:
      'Loyalty points are earned for every booking and referral you make. You can redeem these points for discounts on future services during booking checkouts. 10 points = Rs. 1.',
  },
  {
    id: 'faq-7',
    category: 'safety',
    question: 'What if a provider causes damage during a service?',
    answer:
      'Sewalo covers verified services under our partner protection guidelines. If any damage occurs, please contact our Support team immediately through the Contact Support tab with booking info and photos.',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All FAQs' },
  { key: 'general', label: 'General' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'payments', label: 'Payments' },
  { key: 'safety', label: 'Safety' },
];

export default function HelpFaqScreen() {
  const insets = useSafeAreaInsets();

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
  }, [searchQuery, selectedCategory]);

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout scrollable={false} className="flex-1" style={{ paddingTop: 20 }}>
        <SectionHeader
          title="Help & FAQ"
          description="Find answers to common questions or browse categories below."
          className="mb-4"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Search Input */}
        <View className="mb-4">
          <Input
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Feather name="search" size={16} color="#94a3b8" />}
            className="h-12"
            inputClassName="text-sm font-sans-medium"
            containerStyle={{
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.02,
              shadowRadius: 4,
              elevation: 1,
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
                  <Feather name="help-circle" size={20} color="#94a3b8" />
                </View>
                <Text className="text-sm font-sans-bold text-gray-900 mb-1 text-center">No results found</Text>
                <Text className="text-xs font-sans-medium text-gray-400 text-center">
                  Try searching for a different keyword or category.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isExpanded = !!expandedIds[item.id];
              return (
                <View style={cardShadow} className="bg-white rounded-xl mb-3 overflow-hidden">
                  <Pressable
                    onPress={() => toggleExpand(item.id)}
                    className="flex-row justify-between items-center p-4 active:bg-gray-50/50"
                  >
                    <Text className="text-xs font-sans-bold text-gray-900 flex-1 mr-4">{item.question}</Text>
                    <Feather name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color="#64748b" />
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
