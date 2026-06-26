import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import LocationMapPicker from './LocationMapPicker';

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
  lat: number;
  lng: number;
  onChange: (data: LocationData) => void;
  placeholder?: string;
  error?: string;
}

export default function LocationSelector({ value, lat, lng, onChange, placeholder, error }: LocationSelectorProps) {
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
          <LocationMapPicker
            initialLat={lat || 27.700769}
            initialLng={lng || 85.30014}
            initialAddress={value}
            onSelectLocation={async (data) => {
              onChange(data);
              setModalVisible(false);
            }}
            onCancel={async () => {
              setModalVisible(false);
            }}
            dom={{ style: styles.domMap }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  domMap: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
