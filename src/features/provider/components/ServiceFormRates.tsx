import React, { useEffect } from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Text, View } from 'react-native';

import { SERVICE_TYPES } from '../constants/serviceOptions';
import { ServiceFormData } from '../data/serviceSchemas';
import RateCard, { BillingBasisType, DurationUnitType } from './RateCard';

interface ServiceFormRatesProps {
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  watchServiceTypeIds: string[];
  watchRates: ServiceFormData['rates'];
}

export default function ServiceFormRates({
  control,
  errors,
  setValue,
  watchServiceTypeIds,
  watchRates = {},
}: ServiceFormRatesProps) {
  // Ensure that each selected service type has a rate structure initialized
  useEffect(() => {
    const currentRates = { ...watchRates };
    let hasChanges = false;

    watchServiceTypeIds.forEach((id) => {
      if (!currentRates[id]) {
        currentRates[id] = {
          price: '',
          billingBasis: 'per_hour',
          duration: '',
          durationUnit: 'hours',
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setValue('rates', currentRates);
    }
  }, [watchServiceTypeIds, watchRates, setValue]);

  const handlePriceChange = (id: string, value: string) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      price: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleBasisChange = (id: string, value: BillingBasisType) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      billingBasis: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleDurationChange = (id: string, value: string) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      duration: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  const handleUnitChange = (id: string, value: DurationUnitType) => {
    const currentRates = { ...watchRates };
    currentRates[id] = {
      ...currentRates[id],
      durationUnit: value,
    };
    setValue('rates', currentRates, { shouldValidate: true });
  };

  return (
    <View
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3.5 mb-6"
    >
      {/* Header Inside Card */}
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Your Services & Rates</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          List the specific tasks you perform and how much you charge for them. Refer to the{' '}
          <Text className="text-primary underline">guideline</Text>
        </Text>
      </View>

      {watchServiceTypeIds.length === 0 ? (
        <View className="items-center justify-center py-6 border-t border-gray-100 mt-2">
          <Text className="text-xs font-sans-medium text-gray-400 text-center">
            Please select at least one service type in Section 1 to configure rates.
          </Text>
        </View>
      ) : (
        <View className="gap-y-4">
          {watchServiceTypeIds.map((id, index) => {
            const typeInfo = SERVICE_TYPES.find((t) => t.id === id);
            if (!typeInfo) return null;

            const rate = watchRates[id] || {
              price: '',
              billingBasis: 'per_hour',
              duration: '',
              durationUnit: 'hours',
            };

            const rateErrors = errors.rates?.[id] as any;

            return (
              <View
                key={id}
                className={index > 0 ? 'border-t border-gray-100 pt-4 mt-2' : 'border-t border-gray-100 pt-2'}
              >
                <RateCard
                  serviceTypeName={typeInfo.name}
                  priceValue={rate.price}
                  onPriceChange={(val) => handlePriceChange(id, val)}
                  priceError={rateErrors?.price?.message}
                  billingBasisValue={rate.billingBasis}
                  onBillingBasisChange={(val) => handleBasisChange(id, val)}
                  billingBasisError={rateErrors?.billingBasis?.message}
                  durationValue={rate.duration}
                  onDurationChange={(val) => handleDurationChange(id, val)}
                  durationError={rateErrors?.duration?.message}
                  durationUnitValue={rate.durationUnit}
                  onDurationUnitChange={(val) => handleUnitChange(id, val)}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
