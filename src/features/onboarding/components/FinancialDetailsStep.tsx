import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

import PayoutAccountsManager from '@/features/provider/components/PayoutAccountsManager';

interface FinancialDetailsStepProps {
  onNext: () => void;
  onSkip: () => void;
  stepper?: React.ReactNode;
}

export default function FinancialDetailsStep({ onNext, onSkip, stepper }: FinancialDetailsStepProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 justify-between bg-transparent">
      <ContentLayout
        scrollable={true}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 24,
        }}
      >
        {stepper}

        <PayoutAccountsManager
          header={
            <View>
              <Text className="text-xl font-sans-extrabold text-gray-950 mb-1">Financial Details (Optional)</Text>
              <Text className="text-sm font-sans-medium text-gray-500 leading-normal">
                Manage your payout accounts. This is where you will receive your earnings.
              </Text>
            </View>
          }
        />
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5 pt-2.5 gap-y-1.5"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 10,
        }}
      >
        <Button title="Continue" onPress={onNext} variant="primary" size="sm" className="w-full bg-primary" />
        <Button
          title="Skip for now"
          onPress={onSkip}
          variant="ghost"
          size="sm"
          className="w-full border border-gray-200 active:bg-gray-50"
          textClassName="text-gray-600 font-sans-bold"
        />
      </View>
    </View>
  );
}
