import React from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ServiceFormData, DELIVERY_TYPES, DeliveryType } from '@/types';
import DeliveryOptionCard from './DeliveryOptionCard';

interface ServiceFormDeliveryProps {
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  watchDeliveryTypes: DeliveryType[];
}

export default function ServiceFormDelivery({
  control,
  errors,
  setValue,
  watchDeliveryTypes = [],
}: ServiceFormDeliveryProps) {
  const { t } = useTranslation();
  const handleSelectDelivery = (type: DeliveryType) => {
    const current = [...watchDeliveryTypes];
    const index = current.indexOf(type);

    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(type);
    }

    setValue('deliveryTypes', current, { shouldValidate: true });
  };

  return (
    <View
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 0,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3.5 mb-6"
    >
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">{t('provider.serviceDelivery')}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          {t('provider.serviceDeliveryDesc')}
        </Text>
      </View>

      <View className="gap-y-1">
        <DeliveryOptionCard
          label={t('provider.fixedLocation')}
          sublabel={t('provider.fixedLocationSub')}
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Fixed)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Fixed)}
          iconName="home"
        />

        <DeliveryOptionCard
          label={t('provider.remoteOnline')}
          sublabel={t('provider.remoteOnlineSub')}
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Remote)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Remote)}
          iconName="globe"
        />

        <DeliveryOptionCard
          label={t('provider.customerLocation')}
          sublabel={t('provider.customerLocationSub')}
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Customer)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Customer)}
          iconName="map-pin"
        />
      </View>
    </View>
  );
}
