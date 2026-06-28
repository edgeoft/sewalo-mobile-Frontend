import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';

interface ProviderContactDetailsProps {
  phone: string;
  email: string;
  fullLocation: string;
  workingHours: string;
  onCallPress: () => void;
  onEmailPress: () => void;
  onDirectionsPress: () => void;
}

export default function ProviderContactDetails({
  phone,
  email,
  fullLocation,
  workingHours,
  onCallPress,
  onEmailPress,
  onDirectionsPress,
}: ProviderContactDetailsProps) {
  const { t } = useTranslation();
  return (
    <View className="bg-white border border-gray-200 rounded-lg p-4 gap-y-3.5" style={styles.shadowSm}>
      {/* Location */}
      <Pressable onPress={onDirectionsPress} className="flex-row items-center active:opacity-75">
        <View className="h-8 w-8 bg-gray-50 rounded-xl items-center justify-center mr-3">
          <Feather name="map-pin" size={14} color="#485aff" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            {t('services.location')}
          </Text>
          <Text className="text-xs font-sans-medium text-gray-700 leading-4">{fullLocation}</Text>
        </View>
        <Feather name="chevron-right" size={14} color="#94a3b8" />
      </Pressable>

      <View className="border-t border-gray-100/70" />

      {/* Phone */}
      <Pressable onPress={onCallPress} className="flex-row items-center active:opacity-75">
        <View className="h-8 w-8 bg-gray-50 rounded-xl items-center justify-center mr-3">
          <Feather name="phone" size={14} color="#485aff" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            {t('common.phone')}
          </Text>
          <Text className="text-xs font-sans-bold text-primary">{phone}</Text>
        </View>
        <Feather name="chevron-right" size={14} color="#94a3b8" />
      </Pressable>

      <View className="border-t border-gray-100/70" />

      {/* Email */}
      <Pressable onPress={onEmailPress} className="flex-row items-center active:opacity-75">
        <View className="h-8 w-8 bg-gray-50 rounded-xl items-center justify-center mr-3">
          <Feather name="mail" size={14} color="#485aff" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            {t('common.email')}
          </Text>
          <Text className="text-xs font-sans-bold text-primary">{email}</Text>
        </View>
        <Feather name="chevron-right" size={14} color="#94a3b8" />
      </Pressable>

      <View className="border-t border-gray-100/70" />

      {/* Working Hours */}
      <View className="flex-row items-center">
        <View className="h-8 w-8 bg-gray-50 rounded-xl items-center justify-center mr-3">
          <Feather name="clock" size={14} color="#485aff" />
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Working Hours
          </Text>
          <Text className="text-xs font-sans-medium text-gray-700 leading-4">{workingHours}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowSm: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
});
