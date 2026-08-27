import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormSetValue, useWatch } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AvatarPicker, DateOfBirthPickerModal } from '@/components/common';
import Input from '@/components/ui/Input';
import LocationSelector from '@/components/ui/LocationSelector';
import PhoneNumberField from '@/features/auth/components/PhoneNumberField';
import LanguageSelectionModal from './LanguageSelectionModal';
import ChangePhoneSheet from './ChangePhoneSheet';
import { AVAILABLE_LANGUAGES } from '@/constants/languages';
import { THEME_COLORS } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { useRequestPhoneChange } from '@/api';
import { unformatPhone } from '@/features/auth/utils/phone';

export interface BasicInfoFormData {
  fullName: string;
  email?: string;
  mobileNumber: string;
  location: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
  country?: string;
  dateOfBirth?: string;
  languages?: string[];
  bio?: string;
  avatar?: string | null;
}

interface BasicInfoSectionProps {
  control: Control<BasicInfoFormData>;
  errors: FieldErrors<BasicInfoFormData>;
  setValue: UseFormSetValue<BasicInfoFormData>;
  getValues?: UseFormGetValues<BasicInfoFormData>;
  watchLanguages: string[];
  watchDateOfBirth: string;
  watchAvatar: string | null;
  isProvider?: boolean;
}

export default function BasicInfoSection({
  control,
  errors,
  setValue,
  getValues,
  watchLanguages = [],
  watchDateOfBirth = '',
  watchAvatar = null,
  isProvider = false,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);
  const [changePhoneSheetVisible, setChangePhoneSheetVisible] = useState(false);

  const watchMobile = useWatch({ control, name: 'mobileNumber' }) || '';
  const currentPhone = unformatPhone(user?.phone) || '';
  const cleanMobile = unformatPhone(watchMobile);
  const isPhoneChanged = Boolean(
    cleanMobile && currentPhone && cleanMobile !== currentPhone && cleanMobile.length === 10,
  );

  const requestPhoneOtpMutation = useRequestPhoneChange(() => {
    setChangePhoneSheetVisible(true);
  });

  const handleRequestPhoneChange = () => {
    if (!cleanMobile || cleanMobile === currentPhone) return;
    requestPhoneOtpMutation.mutate({ new_phone: cleanMobile });
  };

  const handleLanguageToggle = (langId: string) => {
    const currentSelected = [...watchLanguages];
    const index = currentSelected.findIndex((l) => l.toLowerCase() === langId.toLowerCase());
    if (index > -1) {
      currentSelected.splice(index, 1);
    } else {
      currentSelected.push(langId);
    }
    setValue('languages', currentSelected, { shouldValidate: true });
  };

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
      <View className="mb-3 flex-row items-center gap-x-2.5">
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
          <Feather name="user" size={16} color={THEME_COLORS.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-gray-950">{t('components.basicInfo')}</Text>
          <Text className="text-xs font-sans-medium text-gray-500 mt-0.5 leading-tight">
            {t('components.basicInfoDesc')}
          </Text>
        </View>
      </View>

      <View className="border-b border-gray-100 mb-4" />

      <View className="gap-y-4">
        <AvatarPicker
          avatarUri={watchAvatar}
          onAvatarChange={(uri) => setValue('avatar', uri, { shouldValidate: true })}
          className="mb-2"
        />

        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={`${t('auth.fullName')} *`}
              placeholder={t('components.enterFullName')}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              inputStyle={{ padding: 0 }}
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={`${t('common.email')} (${t('common.optional')})`}
              placeholder="user@example.com"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              inputStyle={{ padding: 0 }}
              error={errors.email?.message}
            />
          )}
        />

        <View>
          <PhoneNumberField
            control={control}
            name="mobileNumber"
            label={`${t('common.mobileNumber')} *`}
            placeholder="98XXXXXXX"
            error={errors.mobileNumber?.message}
          />
          {isPhoneChanged && (
            <View className="flex-row items-center justify-between mt-2 px-0.5">
              <Pressable
                onPress={() => setValue('mobileNumber', currentPhone, { shouldValidate: true })}
                style={{ borderRadius: 6, height: 28 }}
                className="flex-row items-center justify-center bg-gray-100 border border-gray-200 px-2.5 active:bg-gray-200"
                accessibilityRole="button"
              >
                <View className="w-3.5 h-3.5 items-center justify-center mr-1">
                  <Feather name="rotate-ccw" size={11} color="#64748b" />
                </View>
                <Text className="text-[11px] font-sans-medium text-gray-700">{t('common.revert')}</Text>
              </Pressable>

              <Pressable
                onPress={handleRequestPhoneChange}
                disabled={requestPhoneOtpMutation.isPending}
                style={{ borderRadius: 6, height: 28 }}
                className="flex-row items-center justify-center bg-primary/10 border border-primary/30 px-2.5 active:bg-primary/20"
                accessibilityRole="button"
              >
                <View className="w-3.5 h-3.5 items-center justify-center mr-1">
                  {requestPhoneOtpMutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color={THEME_COLORS.primary}
                      style={{ transform: [{ scale: 0.6 }] }}
                    />
                  ) : (
                    <Feather name="smartphone" size={11} color={THEME_COLORS.primary} />
                  )}
                </View>
                <Text className="text-[11px] font-sans-semibold text-primary">
                  {t('customer.verifyAndChange') || 'Verify & Change'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="w-full">
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{`${t('services.location')} *`}</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => {
              const currentLat = getValues ? getValues('lat') : undefined;
              const currentLng = getValues ? getValues('lng') : undefined;
              return (
                <LocationSelector
                  value={value}
                  coordinates={
                    currentLat !== undefined && currentLng !== undefined
                      ? { lat: Number(currentLat), lng: Number(currentLng) }
                      : null
                  }
                  lat={currentLat}
                  lng={currentLng}
                  placeholder={t('components.locationPlaceholder')}
                  onChange={(data) => {
                    onChange(data.address);
                    setValue('lat', data.lat, { shouldValidate: true });
                    setValue('lng', data.lng, { shouldValidate: true });
                    setValue('city', data.city, { shouldValidate: true });
                    setValue('state', data.state, { shouldValidate: true });
                    setValue('country', data.country, { shouldValidate: true });
                  }}
                  error={errors.location?.message}
                />
              );
            }}
          />
        </View>

        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Date of Birth (Optional)</Text>
          <Pressable
            onPress={() => setDobModalVisible(true)}
            accessibilityRole="button"
            className="form-input-container form-input-container-single justify-between border-gray-200 px-3.5"
          >
            <Text className={`text-sm flex-1 ${watchDateOfBirth ? 'text-gray-900' : 'text-gray-400'}`}>
              {watchDateOfBirth ? watchDateOfBirth : t('components.selectBirthdayPlaceholder')}
            </Text>
            <Feather name="calendar" size={16} color={THEME_COLORS.slate400} accessible={false} />
          </Pressable>
        </View>

        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{t('components.languages')}</Text>
          <Pressable
            onPress={() => setLangModalVisible(true)}
            accessibilityRole="button"
            className="form-input-container form-input-container-single justify-between border-gray-200 px-3.5"
          >
            <Text
              numberOfLines={1}
              className={`text-sm flex-1 ${watchLanguages.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}
            >
              {watchLanguages.length > 0
                ? watchLanguages
                    .map((val) => {
                      const found = AVAILABLE_LANGUAGES.find(
                        (l) => l.id.toLowerCase() === val.toLowerCase() || l.name.toLowerCase() === val.toLowerCase(),
                      );
                      return found ? found.name : val;
                    })
                    .join(', ')
                : t('components.selectLanguagesPlaceholder')}
            </Text>
            <Feather name="chevron-down" size={16} color={THEME_COLORS.slate400} accessible={false} />
          </Pressable>
        </View>

        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => {
            const bioPlaceholder = isProvider
              ? t('components.bioPlaceholderProvider')
              : t('components.bioPlaceholderCustomer');

            return (
              <Input
                label={t('components.bioOptional')}
                placeholder={bioPlaceholder}
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline={true}
                numberOfLines={4}
                inputStyle={{ height: 90, textAlignVertical: 'top', padding: 0 }}
                error={errors.bio?.message}
              />
            );
          }}
        />
      </View>

      <LanguageSelectionModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        selectedLanguages={watchLanguages}
        onToggleLanguage={handleLanguageToggle}
      />

      <DateOfBirthPickerModal
        visible={dobModalVisible}
        onClose={() => setDobModalVisible(false)}
        onConfirm={(dateString) => setValue('dateOfBirth', dateString, { shouldValidate: true })}
        initialDate={watchDateOfBirth}
      />

      <ChangePhoneSheet
        visible={changePhoneSheetVisible}
        onClose={() => setChangePhoneSheetVisible(false)}
        newPhone={cleanMobile}
      />
    </View>
  );
}
