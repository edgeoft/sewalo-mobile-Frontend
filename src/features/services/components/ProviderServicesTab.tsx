import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { PackageDeal, ServiceItem } from '@/types';

interface ProviderServicesTabProps {
  specialPackage?: PackageDeal | null;
  individualServices: ServiceItem[];
  selectedServices: Record<string, boolean>;
  onServiceToggle: (serviceId: string) => void;
  onBookPackage: () => void;
}

export default function ProviderServicesTab({
  specialPackage,
  individualServices,
  selectedServices,
  onServiceToggle,
  onBookPackage,
}: ProviderServicesTabProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-y-5">
      {/* Special Package Deals (Conditional) */}
      {specialPackage && (
        <View className="gap-y-3">
          <View className="flex-row items-center gap-1.5">
            <Feather name="zap" size={16} color="#485aff" />
            <Text className="text-sm font-sans-extrabold text-gray-950">{t('services.specialPackageDeals')}</Text>
          </View>

          <View className="bg-[#eef1ff] border border-blue-100 rounded-lg p-4">
            <Text className="text-sm font-sans-extrabold text-gray-950 mb-1">{specialPackage.title}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-4.5 mb-3">
              {specialPackage.description}
            </Text>

            {/* Package Inclusions Card */}
            <View className="bg-white rounded-lg p-3.5 mb-4 border border-blue-50/50">
              <Text className="text-[10px] font-sans-bold text-primary uppercase tracking-wider mb-2">
                {t('services.packageIncludes')}
              </Text>
              {specialPackage.inclusions.map((item, idx) => (
                <View key={idx} className="flex-row items-center mb-1.5">
                  <View className="h-4 w-4 bg-[#eef1ff] rounded-full items-center justify-center mr-2">
                    <Feather name="check" size={10} color="#485aff" />
                  </View>
                  <Text className="text-xs font-sans-medium text-gray-700">{item}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-[9px] font-sans-semibold text-gray-400 uppercase">
                  {t('services.packagePrice')}
                </Text>
                <Text className="text-base font-sans-extrabold text-primary">{specialPackage.price}</Text>
              </View>

              <View className="flex-row items-center bg-blue-100/70 px-2.5 py-1 rounded-lg">
                <Feather name="clock" size={11} color="#485aff" className="mr-1" />
                <Text className="text-[10px] font-sans-bold text-primary">{specialPackage.durationLabel}</Text>
              </View>
            </View>

            <Button
              title={t('services.bookPackage')}
              variant="primary"
              onPress={onBookPackage}
              className="py-3 rounded-lg"
              leftIcon={<Feather name="calendar" size={16} color="white" />}
            />
          </View>
        </View>
      )}

      {/* Individual Services */}
      <View className="gap-y-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-sans-extrabold text-gray-950">{t('services.individualServices')}</Text>
          <View className="bg-gray-100 rounded-lg px-2 py-0.5">
            <Text className="text-[10px] font-sans-semibold text-gray-500">
              {t('services.servicesAvailable', { count: individualServices.length })}
            </Text>
          </View>
        </View>

        {individualServices.map((service) => {
          const isChecked = !!selectedServices[service.id];
          return (
            <Pressable
              key={service.id}
              onPress={() => onServiceToggle(service.id)}
              accessibilityRole="button"
              accessibilityState={{ checked: isChecked }}
              className={`bg-white border rounded-lg p-3.5 flex-row items-center justify-between ${
                isChecked ? 'border-primary' : 'border-gray-200'
              }`}
              style={styles.shadowMin}
            >
              <View className="flex-row items-center flex-1 pr-4">
                <Checkbox checked={isChecked} onChange={() => onServiceToggle(service.id)} className="mr-3" />
                <View className="flex-1">
                  <Text className="text-xs font-sans-bold text-gray-900 mb-1">{service.title}</Text>
                  <View className="flex-row items-center flex-wrap gap-2">
                    <View className="bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                      <Text className="text-[9px] font-sans-semibold text-gray-400">{service.category}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Feather name="clock" size={10} color="#94a3b8" className="mr-0.5" />
                      <Text className="text-[9px] font-sans-medium text-gray-400">{service.durationLabel}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text className="text-sm font-sans-extrabold text-gray-900">{service.price}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Pricing Info Card */}
      <View className="bg-amber-50/50 border border-amber-200 rounded-lg p-4">
        <View className="flex-row items-center gap-1.5 mb-2">
          <Feather name="info" size={14} color="#b45309" />
          <Text className="text-xs font-sans-bold text-amber-800">{t('services.pricingInfo')}</Text>
        </View>
        {[
          t('services.pricingBullet1'),
          t('services.pricingBullet2'),
          t('services.pricingBullet3'),
          t('services.pricingBullet4'),
          t('services.pricingBullet5'),
        ].map((bullet, idx) => (
          <View key={idx} className="flex-row items-start mb-1.5">
            <Text className="text-[8px] text-amber-600 mr-2 mt-1">•</Text>
            <Text className="flex-1 text-[11px] font-sans-medium text-amber-700/80 leading-4">{bullet}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowMin: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 0,
  },
});
