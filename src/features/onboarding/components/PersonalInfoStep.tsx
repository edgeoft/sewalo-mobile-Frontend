import React, { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Input from '@/components/ui/Input';
import SelectionOption from '@/components/ui/SelectionOption';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

export interface PersonalInfoData {
  fullName: string;
  email: string;
  mobileNumber: string;
  location: string;
  dateOfBirth?: string;
  languages?: string[];
  avatar?: string;
}

interface PersonalInfoStepProps {
  control: Control<PersonalInfoData>;
  errors: FieldErrors<PersonalInfoData>;
  setValue: UseFormSetValue<PersonalInfoData>;
  watchLanguages: string[];
  watchDateOfBirth: string;
  watchAvatar: string;
  onNext: () => void;
  loading?: boolean;
  stepper?: React.ReactNode;
}

const AVAILABLE_LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ne', name: 'Nepali' },
  { id: 'new', name: 'Newari' },
  { id: 'mai', name: 'Maithili' },
  { id: 'bho', name: 'Bhojpuri' },
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

export default function PersonalInfoStep({
  control,
  errors,
  setValue,
  watchLanguages = [],
  watchDateOfBirth = '',
  watchAvatar = '',
  onNext,
  loading = false,
  stepper,
}: PersonalInfoStepProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [dobModalVisible, setDobModalVisible] = useState(false);

  // Date picker state helper
  const [tempDay, setTempDay] = useState('01');
  const [tempMonth, setTempMonth] = useState('January');
  const [tempYear, setTempYear] = useState('2000');

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        setValue('avatar', pickedUri, { shouldValidate: true });
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while picking the avatar.');
    }
  };

  const handleLanguageToggle = (langName: string) => {
    const currentSelected = [...watchLanguages];
    const index = currentSelected.indexOf(langName);
    if (index > -1) {
      currentSelected.splice(index, 1);
    } else {
      currentSelected.push(langName);
    }
    setValue('languages', currentSelected, { shouldValidate: true });
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
            elevation: 1,
          }}
          className="rounded-xl border border-gray-200 bg-white p-4 mb-6"
        >
          <View className="mb-4">
            <Text className="text-base font-sans-bold text-gray-950 mb-1">Personal Details</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
              Please finalize your basic details below to get started.
            </Text>
          </View>

          <View className="gap-y-4">
            {/* Profile Avatar Selection Section */}
            <View className="items-center mb-2">
              <Pressable onPress={handlePickAvatar} className="relative active:opacity-90">
                {watchAvatar ? (
                  <Image
                    source={{ uri: watchAvatar }}
                    className="h-24 w-24 rounded-full border-2 border-gray-100 bg-gray-50"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-24 w-24 rounded-full border-2 border-gray-200 bg-gray-50 items-center justify-center">
                    <Feather name="user" size={40} color="#898f8f" />
                  </View>
                )}
                <View className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary border-2 border-white items-center justify-center shadow-sm">
                  <Feather name="camera" size={14} color="#ffffff" />
                </View>
              </Pressable>
            </View>

            {/* Email Address */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address *"
                  placeholder="Enter your email address"
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
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Location (City/Address) *"
                  placeholder="e.g. Kathmandu, Nepal"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.location?.message as string}
                />
              )}
            />

            {/* Date of Birth */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Date of Birth *</Text>
              <Pressable
                onPress={openDatePicker}
                className={`form-input-container form-input-container-single justify-between ${
                  errors.dateOfBirth ? 'border-destructive' : 'border-gray-200'
                }`}
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
                  {watchDateOfBirth ? watchDateOfBirth : 'Select your birthday'}
                </Text>
                <Feather name="calendar" size={16} color="#898f8f" />
              </Pressable>
              {errors.dateOfBirth && (
                <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
                  {errors.dateOfBirth.message as string}
                </Text>
              )}
            </View>

            {/* Languages */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">Languages *</Text>
              <Pressable
                onPress={() => setLangModalVisible(true)}
                className={`form-input-container form-input-container-single justify-between ${
                  errors.languages ? 'border-destructive' : 'border-gray-200'
                }`}
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
                  {watchLanguages.length > 0 ? watchLanguages.join(', ') : 'Select languages you speak'}
                </Text>
                <Feather name="chevron-down" size={16} color="#898f8f" />
              </Pressable>
              {errors.languages && (
                <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">
                  {errors.languages.message as string}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5 pt-2.5"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 10,
        }}
      >
        <Button
          title="Save"
          onPress={onNext}
          loading={loading}
          variant="primary"
          size="sm"
          className="w-full bg-primary"
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
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-4">Choose the languages you can speak</Text>

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
              <View className="gap-y-2.5 pb-4">
                {AVAILABLE_LANGUAGES.map((lang) => {
                  const isSelected = watchLanguages.includes(lang.name);
                  return (
                    <SelectionOption
                      key={lang.id}
                      onPress={() => handleLanguageToggle(lang.name)}
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
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

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
