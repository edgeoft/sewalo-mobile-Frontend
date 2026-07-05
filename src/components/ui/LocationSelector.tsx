import React, { useState } from 'react';
import { View, Text, Pressable, Modal, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import NativeMapProvider from '../map/NativeMapProvider';

interface LocationData {
  address: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  country?: string;
}

interface LocationSelectorProps {
  value: string;
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number } | null;
  onChange: (data: LocationData) => void;
  placeholder?: string;
  error?: string;
}

export default function LocationSelector({
  value,
  lat,
  lng,
  coordinates,
  onChange,
  placeholder,
  error,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const resolvedPlaceholder = placeholder ?? t('components.selectLocation');

  return (
    <View className="w-full">
      <Pressable
        onPress={() => setModalVisible(true)}
        className={`form-input-container form-input-container-single flex-row items-center justify-between border bg-white px-3 py-3 rounded-lg ${
          error ? 'border-destructive' : 'border-gray-200'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.015,
          shadowRadius: 2,
          elevation: 0,
        }}
      >
        <View className="flex-row items-center gap-x-2 flex-1 mr-2 bg-transparent">
          <Feather name="map-pin" size={16} color="#898f8f" />
          <Text
            numberOfLines={1}
            className={`text-sm flex-1 ${value ? 'text-gray-900 font-sans-medium' : 'text-[#898f8f]'}`}
          >
            {value ? value : resolvedPlaceholder}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color="#898f8f" />
      </Pressable>

      {error ? <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{error}</Text> : null}

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <NativeMapProvider
            coordinates={coordinates}
            initialLat={lat}
            initialLng={lng}
            initialAddress={value}
            onSelectLocation={async (data) => {
              onChange(data);
              setModalVisible(false);
            }}
            onCancel={async () => {
              setModalVisible(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}
