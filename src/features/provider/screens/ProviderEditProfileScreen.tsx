import React, { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

import BasicInfoSection, { BasicInfoFormData } from '@/features/customer/components/BasicInfoSection';
import SkillsExperienceSection, { EducationItem, ExperienceItem } from '../components/SkillsExperienceSection';
import AvailabilitySection from '../components/AvailabilitySection';

import { useAuth } from '@/providers/AuthProvider';
import { getImageUrl } from '../../auth/utils/image';
import { useUpdateProfile, Availability } from '@/api/user';
import { useUploadFile } from '@/api/files/hooks';

export default function ProviderEditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  const locationStr = [user?.address, user?.city, user?.state, user?.country].filter(Boolean).join(', ');

  // 1. Basic Info Form State
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      fullName: user?.name || '',
      mobileNumber: user?.phone || '',
      location: locationStr,
      dateOfBirth: user?.dob || '',
      languages: user?.language || [],
      bio: user?.description || '',
      avatar: getImageUrl(user?.avatar) || null,
    },
    mode: 'onBlur',
  });

  const watchLanguages = watch('languages') || [];
  const watchDateOfBirth = watch('dateOfBirth') || '';
  const watchAvatar = watch('avatar') || '';

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
    const saveProfileData = (avatarPath: string | null) => {
      const payload: any = {
        name: data.fullName,
        phone: data.mobileNumber,
        address: data.location,
        dob: data.dateOfBirth,
        language: data.languages,
        description: data.bio,
      };
      if (avatarPath) {
        payload.avatar = avatarPath;
      }
      updateProfile(payload, {
        onSuccess: () => {
          Alert.alert('Success', 'Basic information saved successfully!');
        },
      });
    };

    if (data.avatar && data.avatar !== getImageUrl(user?.avatar)) {
      uploadFile(
        { uri: data.avatar, folder: 'profile' },
        {
          onSuccess: (uploadRes) => {
            saveProfileData(uploadRes.path);
          },
        },
      );
    } else {
      saveProfileData(user?.avatar || null);
    }
  };

  // 2. Skills & Experience State
  const [educationList, setEducationList] = useState<EducationItem[]>(
    user?.education && user.education.length > 0
      ? user.education.map((edu: any) => ({
          id: edu.id,
          degree: edu.degree || '',
          institution: edu.institute || '',
          startYear: edu.start_date ? edu.start_date.split('-')[0] : '',
          endYear: edu.end_date ? edu.end_date.split('-')[0] : 'Present',
        }))
      : [],
  );

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(
    user?.experience && user.experience.length > 0
      ? user.experience.map((exp: any) => ({
          id: exp.id,
          title: exp.title || '',
          company: exp.company_name || '',
          startYear: exp.start_date ? exp.start_date.split('-')[0] : '',
          endYear: exp.end_date ? exp.end_date.split('-')[0] : 'Present',
        }))
      : [],
  );

  const handleAddEducation = (item: EducationItem) => {
    setEducationList((prev) => [...prev, item]);
  };

  const handleRemoveEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExperience = (item: ExperienceItem) => {
    setExperienceList((prev) => [...prev, item]);
  };

  const handleRemoveExperience = (index: number) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSkills = () => {
    updateProfile(
      {
        education: educationList.map((edu) => ({
          id: edu.id,
          degree: edu.degree,
          institute: edu.institution,
          start_date: edu.startYear ? `${edu.startYear}-01-01` : '',
          end_date: edu.endYear && edu.endYear !== 'Present' ? `${edu.endYear}-12-31` : null,
        })),
        experience: experienceList.map((exp) => ({
          id: exp.id,
          title: exp.title,
          company_name: exp.company,
          start_date: exp.startYear ? `${exp.startYear}-01-01` : '',
          end_date: exp.endYear && exp.endYear !== 'Present' ? `${exp.endYear}-12-31` : null,
        })),
      },
      {
        onSuccess: () => Alert.alert('Success', 'Skills and experience saved successfully!'),
      },
    );
  };

  // 3. Availability State
  const [workingDays, setWorkingDays] = useState<Availability>((user?.availability as Availability) || 'weekdays');
  const [workingHoursStart, setWorkingHoursStart] = useState(user?.start_time || '10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(user?.end_time || '06:00 PM');

  const handleSaveAvailability = () => {
    updateProfile(
      {
        availability: workingDays,
        start_time: workingHoursStart,
        end_time: workingHoursEnd,
      },
      {
        onSuccess: () => Alert.alert('Success', 'Availability schedule saved successfully!'),
      },
    );
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#485aff" />
        </View>
      ) : (
        <ContentLayout
          scrollable
          className="flex-1"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          <SectionHeader
            title="Edit Partner Profile"
            description="Manage your business profile information, experience details, and availability."
            className="mb-6"
            titleClassName="text-2xl text-gray-950 font-sans-extrabold"
          />

          {/* Basic Info Block */}
          <BasicInfoSection
            control={control}
            errors={errors}
            setValue={setValue}
            watchLanguages={watchLanguages}
            watchDateOfBirth={watchDateOfBirth}
            watchAvatar={watchAvatar}
            onSave={handleSubmit(handleSaveBasicInfo)}
            loading={isUpdating || isUploading}
          />

          {/* Skills & Experience Block */}
          <SkillsExperienceSection
            educationList={educationList}
            experienceList={experienceList}
            onAddEducation={handleAddEducation}
            onRemoveEducation={handleRemoveEducation}
            onAddExperience={handleAddExperience}
            onRemoveExperience={handleRemoveExperience}
            onSave={handleSaveSkills}
            loading={isUpdating}
          />

          {/* Availability Block */}
          <AvailabilitySection
            workingDays={workingDays}
            onChangeWorkingDays={setWorkingDays}
            workingHoursStart={workingHoursStart}
            workingHoursEnd={workingHoursEnd}
            onChangeHours={(start, end) => {
              setWorkingHoursStart(start);
              setWorkingHoursEnd(end);
            }}
            onSave={handleSaveAvailability}
            loading={isUpdating}
          />
        </ContentLayout>
      )}
    </View>
  );
}
