import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Input from '@/components/ui/Input';
import SelectionOption from '@/components/ui/SelectionOption';

export type BillingBasisType = 'per_hour' | 'per_day' | 'per_job' | 'per_project' | 'per_session';
export type DurationUnitType = 'minutes' | 'hours' | 'days' | 'weeks';

interface RateCardProps {
  serviceTypeName: string;
  priceValue: string;
  onPriceChange: (val: string) => void;
  priceError?: string;

  billingBasisValue: BillingBasisType;
  onBillingBasisChange: (val: BillingBasisType) => void;
  billingBasisError?: string;

  durationValue: string;
  onDurationChange: (val: string) => void;
  durationError?: string;

  durationUnitValue: DurationUnitType;
  onDurationUnitChange: (val: DurationUnitType) => void;
}

const BILLING_BASIS_OPTIONS: { value: BillingBasisType; labelKey: string }[] = [
  { value: 'per_hour', labelKey: 'services.billingBasisPerHour' },
  { value: 'per_day', labelKey: 'services.billingBasisPerDay' },
  { value: 'per_job', labelKey: 'services.billingBasisPerJob' },
  { value: 'per_project', labelKey: 'services.billingBasisPerProject' },
  { value: 'per_session', labelKey: 'services.billingBasisPerSession' },
];

const DURATION_UNIT_OPTIONS: { value: DurationUnitType; labelKey: string }[] = [
  { value: 'minutes', labelKey: 'services.durationUnitMinutes' },
  { value: 'hours', labelKey: 'services.durationUnitHours' },
  { value: 'days', labelKey: 'services.durationUnitDays' },
  { value: 'weeks', labelKey: 'services.durationUnitWeeks' },
];

export default function RateCard({
  serviceTypeName,
  priceValue,
  onPriceChange,
  priceError,
  billingBasisValue,
  onBillingBasisChange,
  billingBasisError,
  durationValue,
  onDurationChange,
  durationError,
  durationUnitValue,
  onDurationUnitChange,
}: RateCardProps) {
  const { height } = useWindowDimensions();
  const { t } = useTranslation();
  const [basisModalVisible, setBasisModalVisible] = useState(false);
  const [unitModalVisible, setUnitModalVisible] = useState(false);

  const selectedBasis = BILLING_BASIS_OPTIONS.find((o) => o.value === billingBasisValue) || BILLING_BASIS_OPTIONS[0];
  const selectedUnit = DURATION_UNIT_OPTIONS.find((o) => o.value === durationUnitValue) || DURATION_UNIT_OPTIONS[0];

  const handleSelectBasis = (value: BillingBasisType) => {
    onBillingBasisChange(value);
    setBasisModalVisible(false);
  };

  const handleSelectUnit = (value: DurationUnitType) => {
    onDurationUnitChange(value);
    setUnitModalVisible(false);
  };

  return (
    <View className="w-full">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="h-1.5 w-1.5 rounded-full bg-primary" />
        <Text className="text-xs font-sans-bold text-gray-900 flex-1">{serviceTypeName}</Text>
      </View>

      <View className="gap-y-3.5">
        {/* Row 1: Price and Billing Basis */}
        <View className="flex-row gap-3 items-start">
          {/* Price Input */}
          <View className="flex-1">
            <Input
              label={t('services.price')}
              placeholder={t('services.pricePlaceholder')}
              keyboardType="numeric"
              value={priceValue}
              onChangeText={onPriceChange}
              inputStyle={{ padding: 0 }}
              error={priceError}
              leftIcon={<Text className="text-xs font-sans-semibold text-gray-500">Rs.</Text>}
            />
          </View>

          {/* Billing Basis Selector */}
          <View className="flex-1">
            <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{t('services.billingBasis')}</Text>
            <Pressable
              onPress={() => setBasisModalVisible(true)}
              accessibilityRole="button"
              className={`form-input-container form-input-container-single justify-between ${
                billingBasisError ? 'border-destructive' : 'border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.015,
                shadowRadius: 2,
                elevation: 0,
                paddingHorizontal: 14,
              }}
            >
              <Text className="text-sm text-gray-900">{t(selectedBasis.labelKey)}</Text>
              <Feather name="chevron-down" size={15} color="#898f8f" accessible={false} />
            </Pressable>
            {billingBasisError && (
              <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{billingBasisError}</Text>
            )}
          </View>
        </View>

        {/* Row 2: Duration and Unit */}
        <View className="flex-row gap-3 items-start">
          {/* Duration Input */}
          <View className="flex-1">
            <Input
              label={t('services.estimatedDuration')}
              placeholder={t('services.durationPlaceholder')}
              keyboardType="numeric"
              value={durationValue}
              onChangeText={onDurationChange}
              inputStyle={{ padding: 0 }}
              error={durationError}
            />
          </View>

          {/* Unit Selector */}
          <View className="flex-1">
            {/* Transparent spacer label to match 'Estimated Duration' label spacing */}
            <Text className="text-xs font-sans-semibold text-transparent mb-1.5 ml-0.5">Duration Unit Spacer</Text>
            <Pressable
              onPress={() => setUnitModalVisible(true)}
              accessibilityRole="button"
              className="form-input-container form-input-container-single justify-between"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.015,
                shadowRadius: 2,
                elevation: 0,
                paddingHorizontal: 14,
              }}
            >
              <Text className="text-sm text-gray-900">{t(selectedUnit.labelKey)}</Text>
              <Feather name="chevron-down" size={15} color="#898f8f" accessible={false} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* 1. Billing Basis Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={basisModalVisible}
        onRequestClose={() => setBasisModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setBasisModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.6 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('services.billingBasis')}</Text>
              <Pressable
                onPress={() => setBasisModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">{t('services.chooseBillingBasis')}</Text>

            <View className="gap-y-2.5">
              {BILLING_BASIS_OPTIONS.map((opt) => {
                const isSelected = opt.value === billingBasisValue;
                return (
                  <SelectionOption
                    key={opt.value}
                    onPress={() => handleSelectBasis(opt.value)}
                    title={t(opt.labelKey)}
                    selected={isSelected}
                    indicatorType="radio"
                    gradientColors={['#eef0ff', '#f8fafc']}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Duration Unit Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={unitModalVisible}
        onRequestClose={() => setUnitModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setUnitModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.5 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('services.durationUnit')}</Text>
              <Pressable
                onPress={() => setUnitModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">{t('services.chooseDurationUnit')}</Text>

            <View className="gap-y-2.5">
              {DURATION_UNIT_OPTIONS.map((opt) => {
                const isSelected = opt.value === durationUnitValue;
                return (
                  <SelectionOption
                    key={opt.value}
                    onPress={() => handleSelectUnit(opt.value)}
                    title={t(opt.labelKey)}
                    selected={isSelected}
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
