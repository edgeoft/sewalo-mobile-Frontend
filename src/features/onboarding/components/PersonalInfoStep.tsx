import React, { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { AvatarPicker } from '@/components/common';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { THEME_COLORS } from '@/constants/colors';
import LocationSelector from '@/components/ui/LocationSelector';

import { PersonalInfoData } from '@/types';

interface PersonalInfoStepProps {
  control: Control<PersonalInfoData>;
  errors: FieldErrors<PersonalInfoData>;
  setValue: UseFormSetValue<PersonalInfoData>;
  watchDateOfBirth: string;
  watchAvatar: string;
  onNext: () => void;
  loading?: boolean;
  stepper?: React.ReactNode;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function PersonalInfoStep({
  control,
  errors,
  setValue,
  watchDateOfBirth = '',
  watchAvatar = '',
  onNext,
  loading = false,
  stepper,
}: PersonalInfoStepProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [dobModalVisible, setDobModalVisible] = useState(false);

  const watchLat = useWatch({ control, name: 'lat' }) || 27.700769;
  const watchLng = useWatch({ control, name: 'lng' }) || 85.30014;

  // Date picker state helper
  const [tempDay, setTempDay] = useState('01');
  const [tempMonth, setTempMonth] = useState('January');
  const [tempYear, setTempYear] = useState('2000');

  // Date picker state helper

  const handleConfirmDate = () => {
    const monthIndex = MONTHS.indexOf(tempMonth) + 1;
    const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
    const formattedDay = parseInt(tempDay, 10) < 10 ? `0${parseInt(tempDay, 10)}` : tempDay;
    const dateStr = `${tempYear}-${formattedMonth}-${formattedDay}`;
    setValue('dateOfBirth', dateStr, { shouldValidate: true });
    setDobModalVisible(false);
  };

  const openDatePicker = () => {
    if (watchDateOfBirth) {
      const parts = watchDateOfBirth.split('-');
      if (parts.length === 3) {
        setTempYear(parts[0]);
        const mIndex = parseInt(parts[1], 10) - 1;
        if (mIndex >= 0 && mIndex < 12) setTempMonth(MONTHS[mIndex]);
        setTempDay(parts[2]);
      }
    }
    setDobModalVisible(true);
  };

  const daysList = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const yearsList = Array.from({ length: 80 }, (_, i) => String(2026 - i - 16)); // Age 16 to 96

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
        <View
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.02,
            shadowRadius: 8,
            elevation: 0,
          }}
          className="rounded-xl border border-gray-200 bg-white p-4 mb-6"
        >
          <View className="mb-4">
            <Text className="text-base font-sans-bold text-gray-950 mb-1">{t('onboarding.personalDetails')}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
              {t('onboarding.personalDetailsDesc')}
            </Text>
          </View>

          <View className="gap-y-4">
            {/* Profile Avatar Selection Section */}
            <AvatarPicker
              avatarUri={watchAvatar}
              onAvatarChange={(uri) => setValue('avatar', uri, { shouldValidate: true })}
              className="mb-2"
            />

            {/* Email Address */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t('onboarding.emailAddress')}
                  placeholder={t('onboarding.enterEmail')}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  inputStyle={{ padding: 0 }}
                  error={errors.email?.message as string}
                />
              )}
            />

            {/* Location */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
                {t('onboarding.locationCityAddress')}
              </Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, value } }) => (
                  <LocationSelector
                    value={value}
                    lat={watchLat}
                    lng={watchLng}
                    placeholder={t('onboarding.selectLocationMap')}
                    onChange={(data) => {
                      onChange(data.address);
                      setValue('lat', data.lat);
                      setValue('lng', data.lng);
                      setValue('city', data.city);
                      setValue('state', data.state);
                      setValue('country', data.country);
                    }}
                    error={errors.location?.message as string}
                  />
                )}
              />
            </View>

            {/* Date of Birth */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
                {t('onboarding.dateOfBirth')}
              </Text>
              <Pressable
                onPress={openDatePicker}
                className={`form-input-container form-input-container-single justify-between ${
                  errors.dateOfBirth ? 'border-destructive' : 'border-gray-200'
                }`}
                accessibilityRole="button"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.015,
                  shadowRadius: 2,
                  elevation: 0,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  className={`text-sm flex-1 ${watchDateOfBirth ? 'text-gray-900' : 'text-form-field-placeholder'}`}
                >
                  {watchDateOfBirth ? watchDateOfBirth : t('onboarding.selectBirthday')}
                </Text>
                <Feather name="calendar" size={16} color={THEME_COLORS.slate400} accessible={false} />
              </Pressable>
              {errors.dateOfBirth && (
                <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
                  {errors.dateOfBirth.message as string}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5"
        style={{
          paddingTop: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 0 : 10,
        }}
      >
        <Button
          title={t('onboarding.save')}
          onPress={onNext}
          loading={loading}
          variant="primary"
          size="sm"
          className="w-full bg-primary"
        />
      </View>

      {/* Custom DOB Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dobModalVisible}
        onRequestClose={() => setDobModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setDobModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.6 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('onboarding.selectBirthdayTitle')}</Text>
              <Pressable
                onPress={() => setDobModalVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
              >
                <Feather name="x" size={16} color="#64748b" accessible={false} />
              </Pressable>
            </View>

            <View className="flex-row justify-between mb-6 gap-x-2">
              {/* Day Selector */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">{t('onboarding.day')}</Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {daysList.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setTempDay(d)}
                      className={`py-2 items-center ${tempDay === d ? 'bg-primary/10' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempDay === d }}
                    >
                      <Text
                        className={`font-sans-medium ${tempDay === d ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {d}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Month Selector */}
              <View className="flex-[1.5]">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                  {t('onboarding.month')}
                </Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {MONTHS.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setTempMonth(m)}
                      className={`py-2 items-center ${tempMonth === m ? 'bg-primary/10' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempMonth === m }}
                    >
                      <Text
                        className={`font-sans-medium ${tempMonth === m ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Year Selector */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                  {t('onboarding.year')}
                </Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {yearsList.map((y) => (
                    <Pressable
                      key={y}
                      onPress={() => setTempYear(y)}
                      className={`py-2 items-center ${tempYear === y ? 'bg-primary/10' : ''}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempYear === y }}
                    >
                      <Text
                        className={`font-sans-medium ${tempYear === y ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {y}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Button
              title={t('onboarding.confirmDate')}
              onPress={handleConfirmDate}
              variant="primary"
              className="w-full"
            />
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
