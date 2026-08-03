import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LocationSelector from '@/components/ui/LocationSelector';
import SelectionOption from '@/components/ui/SelectionOption';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useTranslation } from 'react-i18next';
import PhoneNumberField from '@/features/auth/components/PhoneNumberField';

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
  watchLanguages: string[];
  watchDateOfBirth: string;
  watchAvatar: string | null;
  onSave: () => void;
  loading?: boolean;
}

const AVAILABLE_LANGUAGES = [
  { id: 'english', name: 'English' },
  { id: 'nepali', name: 'Nepali' },
  { id: 'hindi', name: 'Hindi' },
  { id: 'newari', name: 'Newari' },
  { id: 'tamang', name: 'Tamang' },
  { id: 'maithili', name: 'Maithili' },
  { id: 'bhojpuri', name: 'Bhojpuri' },
  { id: 'magar', name: 'Magar' },
  { id: 'doteli', name: 'Doteli' },
  { id: 'tharu', name: 'Tharu' },
  { id: 'rai', name: 'Rai' },
  { id: 'limbu', name: 'Limbu' },
  { id: 'gurung', name: 'Gurung' },
  { id: 'sherpa', name: 'Sherpa' },
  { id: 'other', name: 'Other' },
];

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

export default function BasicInfoSection({
  control,
  errors,
  setValue,
  watchLanguages = [],
  watchDateOfBirth = '',
  watchAvatar = null,
  onSave,
  loading = false,
}: BasicInfoSectionProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { showSnackbar } = useSnackbar();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar({ message: 'We need access to your photo library to select a profile picture.', type: 'info' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setValue('avatar', pickedUri, { shouldValidate: true });
      }
    } catch {
      showSnackbar({ message: 'Something went wrong while picking the avatar.', type: 'error' });
    }
  };

  // Date picker state helper
  const [tempDay, setTempDay] = useState('01');
  const [tempMonth, setTempMonth] = useState('January');
  const [tempYear, setTempYear] = useState('2000');

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

  const handleOpenLangModal = () => {
    setLangModalVisible(true);
  };

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

  // Helper lists for date selectors
  const daysList = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const yearsList = Array.from({ length: 80 }, (_, i) => String(2026 - i - 16)); // Age 16 to 96

  return (
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
        <Text className="text-base font-sans-bold text-gray-950 mb-1">{t('components.basicInfo')}</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">{t('components.basicInfoDesc')}</Text>
      </View>

      <View className="gap-y-4">
        {/* Profile Avatar Selection Section */}
        <View className="items-center mb-2">
          <Pressable
            onPress={handlePickAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture"
            className="relative active:opacity-90"
          >
            {watchAvatar ? (
              <Image
                source={{ uri: watchAvatar }}
                className="h-20 w-20 rounded-full bg-gray-50 border-2 border-white"
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('@/assets/images/avatar-default.png')}
                className="h-20 w-20 rounded-full bg-gray-100 border-2 border-white"
                resizeMode="cover"
              />
            )}
            <View
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary border-2 border-white items-center justify-center shadow-sm"
              importantForAccessibility="no"
              accessibilityElementsHidden
            >
              <Feather name="camera" size={14} color="#ffffff" />
            </View>
          </Pressable>
        </View>
        {/* Full Name */}
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
              error={errors.fullName?.message as string}
            />
          )}
        />

        {/* Mobile Number */}
        <PhoneNumberField
          control={control as any}
          name="mobileNumber"
          label={`${t('common.mobileNumber')} *`}
          placeholder="98XXXXXXX"
          error={errors.mobileNumber?.message as string}
        />

        {/* Location */}
        <View className="w-full">
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{`${t('services.location')} *`}</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => {
              const formValues = control._formValues;
              return (
                <LocationSelector
                  value={value}
                  coordinates={
                    formValues.lat !== undefined && formValues.lng !== undefined
                      ? { lat: Number(formValues.lat), lng: Number(formValues.lng) }
                      : null
                  }
                  lat={formValues.lat}
                  lng={formValues.lng}
                  placeholder={t('components.locationPlaceholder')}
                  onChange={(data) => {
                    onChange(data.address);
                    setValue('lat', data.lat, { shouldValidate: true });
                    setValue('lng', data.lng, { shouldValidate: true });
                    setValue('city', data.city, { shouldValidate: true });
                    setValue('state', data.state, { shouldValidate: true });
                    setValue('country', data.country, { shouldValidate: true });
                  }}
                  error={errors.location?.message as string}
                />
              );
            }}
          />
        </View>

        {/* Date of Birth (Optional) */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Date of Birth (Optional)</Text>
          <Pressable
            onPress={openDatePicker}
            accessibilityRole="button"
            className="form-input-container form-input-container-single justify-between border-gray-200"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.015,
              shadowRadius: 2,
              elevation: 0,
              paddingHorizontal: 14,
            }}
          >
            <Text className={`text-sm flex-1 ${watchDateOfBirth ? 'text-gray-900' : 'text-[#898f8f]'}`}>
              {watchDateOfBirth ? watchDateOfBirth : t('components.selectBirthdayPlaceholder')}
            </Text>
            <Feather name="calendar" size={16} color="#898f8f" accessible={false} />
          </Pressable>
        </View>

        {/* Languages (Optional) */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{t('components.languages')}</Text>
          <Pressable
            onPress={handleOpenLangModal}
            accessibilityRole="button"
            className="form-input-container form-input-container-single justify-between border-gray-200"
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
              numberOfLines={1}
              className={`text-sm flex-1 ${watchLanguages.length > 0 ? 'text-gray-900' : 'text-[#898f8f]'}`}
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
            <Feather name="chevron-down" size={16} color="#898f8f" accessible={false} />
          </Pressable>
        </View>

        {/* Bio (Optional) */}
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Bio (Optional)"
              placeholder="Customers want to know who they are hiring. A friendly bio helps you win more jobs."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline={true}
              numberOfLines={4}
              inputStyle={{ height: 90, textAlignVertical: 'top', padding: 0 }}
              error={errors.bio?.message as string}
            />
          )}
        />

        {/* Save Profile Button */}
        <Button
          title={t('common.save')}
          onPress={onSave}
          loading={loading}
          variant="primary"
          className="mt-2 bg-primary"
        />
      </View>

      {/* Languages Drawer Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setLangModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.65 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">Languages</Text>
              <Pressable
                onPress={() => setLangModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose the languages you can speak</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              <View className="gap-y-2.5 pb-4">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = watchLanguages.some(
                    (l) => l.toLowerCase() === lang.id.toLowerCase() || l.toLowerCase() === lang.name.toLowerCase(),
                  );
                  return (
                    <SelectionOption
                      key={lang.id}
                      onPress={() => handleLanguageToggle(lang.id)}
                      title={lang.name}
                      selected={isSelected}
                      indicatorType="checkbox"
                      gradientColors={['#eef0ff', '#f8fafc']}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text className="text-gray-900 text-xl font-sans-extrabold">Select Birthday</Text>
              <Pressable
                onPress={() => setDobModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            {/* Custom interactive scroll selectors for Day, Month, Year */}
            <View className="flex-row justify-between mb-6 gap-x-2">
              {/* Day Selector */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">Day</Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {daysList.map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => setTempDay(d)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempDay === d }}
                      className={`py-2 items-center ${tempDay === d ? 'bg-primary/10' : ''}`}
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
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">Month</Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {MONTHS.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setTempMonth(m)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempMonth === m }}
                      className={`py-2 items-center ${tempMonth === m ? 'bg-primary/10' : ''}`}
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
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">Year</Text>
                <ScrollView
                  style={{ height: 150 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {yearsList.map((y) => (
                    <Pressable
                      key={y}
                      onPress={() => setTempYear(y)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempYear === y }}
                      className={`py-2 items-center ${tempYear === y ? 'bg-primary/10' : ''}`}
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

            <Button title="Confirm Date" onPress={handleConfirmDate} variant="primary" className="w-full" />
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
