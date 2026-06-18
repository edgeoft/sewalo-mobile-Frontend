import React from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

import { FinancialData } from '../data/schemas';

interface FinancialDetailsStepProps {
  control: Control<FinancialData>;
  errors: FieldErrors<FinancialData>;
  onNext: () => void;
  onSkip: () => void;
  stepper?: React.ReactNode;
}

export default function FinancialDetailsStep({ control, errors, onNext, onSkip, stepper }: FinancialDetailsStepProps) {
  const insets = useSafeAreaInsets();

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  };

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
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
          <View className="mb-4">
            <Text className="text-base font-sans-bold text-gray-950 mb-1">Financial Details (Optional)</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
              Enter your bank account details. This is how you will receive payouts for your completed bookings.
            </Text>
          </View>

          <View className="gap-y-4">
            {/* Account Holder Name */}
            <Controller
              control={control}
              name="accountHolderName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Holder Name *"
                  placeholder="Enter account holder's full name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.accountHolderName?.message as string}
                />
              )}
            />

            {/* Bank Name */}
            <Controller
              control={control}
              name="bankName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Bank Name *"
                  placeholder="e.g. Nabil Bank, Global IME Bank"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.bankName?.message as string}
                />
              )}
            />

            {/* Account Number */}
            <Controller
              control={control}
              name="accountNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Account Number *"
                  placeholder="Enter your bank account number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  inputStyle={{ padding: 0 }}
                  error={errors.accountNumber?.message as string}
                />
              )}
            />

            {/* Branch Name */}
            <Controller
              control={control}
              name="branchName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Branch Name / Location (Optional)"
                  placeholder="e.g. New Road Branch"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.branchName?.message as string}
                />
              )}
            />
          </View>
        </View>
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
        <Button title="Save" onPress={onNext} variant="primary" size="sm" className="w-full bg-primary" />
        <Button
          title="Skip this step"
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
