import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AvatarPicker, DateOfBirthPickerModal } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LocationSelector from '@/components/ui/LocationSelector';
import PhoneNumberField from '@/features/auth/components/PhoneNumberField';
import LanguageSelectionModal from './LanguageSelectionModal';
import { AVAILABLE_LANGUAGES } from '@/constants/languages';
import { THEME_COLORS } from '@/constants/colors';

export interface BasicInfoFormData {
  fullName: string;
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
  onSave: () => void;
  loading?: boolean;
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
  onSave,
  loading = false,
  isProvider = false,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);

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
          <Feather name="user" size={16} color="#485aff" />
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

        <PhoneNumberField
          control={control}
          name="mobileNumber"
          label={`${t('common.mobileNumber')} *`}
          placeholder="98XXXXXXX"
          error={errors.mobileNumber?.message}
        />

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

        <Button
          title={t('common.save')}
          onPress={onSave}
          loading={loading}
          variant="primary"
          size="md"
          className="mt-4 w-full bg-primary"
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
    </View>
  );
}
