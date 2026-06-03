import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import BasicInfoSection, { BasicInfoFormData } from '../components/BasicInfoSection';

const initialCustomerData: BasicInfoFormData = {
  fullName: 'Aayush Shrestha',
  mobileNumber: '9801234567',
  location: 'Kathmandu, Bagmati Province, Nepal',
  dateOfBirth: '1998-05-15',
  languages: ['English', 'Nepali'],
  bio: 'Hi, I am Aayush. I love using Sewalo for quick home services!',
  avatar: 'https://i.pravatar.cc/300?img=11',
};

export default function CustomerEditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: initialCustomerData,
    mode: 'onBlur',
  });

  const watchLanguages = watch('languages') || [];
  const watchDateOfBirth = watch('dateOfBirth') || '';
  const watchAvatar = watch('avatar') || '';

  const handleSaveProfile = (data: BasicInfoFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }, 1200);
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="Edit Profile"
          description="Manage your account profile information."
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <BasicInfoSection
          control={control}
          errors={errors}
          setValue={setValue}
          watchLanguages={watchLanguages}
          watchDateOfBirth={watchDateOfBirth}
          watchAvatar={watchAvatar}
          onSave={handleSubmit(handleSaveProfile)}
          loading={loading}
        />
      </ContentLayout>
    </View>
  );
}
