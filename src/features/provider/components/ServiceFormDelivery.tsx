import React from 'react';
import { Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Text, View } from 'react-native';

import { ServiceFormData } from '../data/serviceSchemas';
import { DELIVERY_TYPES, DeliveryType } from '@/types';
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
        elevation: 1,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3.5 mb-6"
    >
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Service Delivery</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          Specify how and where you deliver these services to your customers.
        </Text>
      </View>

      <View className="gap-y-1">
        <DeliveryOptionCard
          label="Fixed Location"
          sublabel="Provider works from a set address"
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Fixed)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Fixed)}
          iconName="home"
        />

        <DeliveryOptionCard
          label="Remote / Online"
          sublabel="Service delivered digitally"
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Remote)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Remote)}
          iconName="globe"
        />

        <DeliveryOptionCard
          label="At Customer's Location"
          sublabel="Provider travels to the client"
          selected={watchDeliveryTypes.includes(DELIVERY_TYPES.Customer)}
          onPress={() => handleSelectDelivery(DELIVERY_TYPES.Customer)}
          iconName="map-pin"
        />
      </View>
    </View>
  );
}
