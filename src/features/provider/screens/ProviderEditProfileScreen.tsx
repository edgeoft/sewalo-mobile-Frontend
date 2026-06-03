import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';

import BasicInfoSection, { BasicInfoFormData } from '@/features/customer/components/BasicInfoSection';
import SkillsExperienceSection, { EducationItem, ExperienceItem } from '../components/SkillsExperienceSection';
import AvailabilitySection from '../components/AvailabilitySection';

export default function ProviderEditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Loading states per section
  const [basicLoading, setBasicLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // 1. Basic Info Form State
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BasicInfoFormData>({
    defaultValues: {
      fullName: 'Pepper Potts',
      mobileNumber: '9802117361',
      location: 'Kathmandu, Bagmati Province, Nepal',
      dateOfBirth: '1995-10-12',
      languages: ['English', 'Nepali'],
      bio: 'Professional designer with 5+ years of experience in interior and web design.',
      avatar: 'https://i.pravatar.cc/300?img=47',
    },
    mode: 'onBlur',
  });

  const watchLanguages = watch('languages') || [];
  const watchDateOfBirth = watch('dateOfBirth') || '';
  const watchAvatar = watch('avatar') || '';

  const handleSaveBasicInfo = (data: BasicInfoFormData) => {
    setBasicLoading(true);
    setTimeout(() => {
      setBasicLoading(false);
      Alert.alert('Success', 'Basic information saved successfully!');
    }, 1000);
  };

  // 2. Skills & Experience State
  const [educationList, setEducationList] = useState<EducationItem[]>([
    {
      degree: 'Bachelor in Interior Design',
      institution: 'Kathmandu University',
      startYear: '2013',
      endYear: '2017',
    },
  ]);

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    {
      title: 'Lead Decorator',
      company: 'Decor Sewa',
      startYear: '2018',
      endYear: 'Present',
    },
  ]);

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
    setSkillsLoading(true);
    setTimeout(() => {
      setSkillsLoading(false);
      Alert.alert('Success', 'Skills and experience saved successfully!');
    }, 1000);
  };

  // 3. Availability State
  const [workingDays, setWorkingDays] = useState<'everyday' | 'sunday_friday' | 'weekend'>('sunday_friday');
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('06:00 PM');

  const handleSaveAvailability = () => {
    setAvailabilityLoading(true);
    setTimeout(() => {
      setAvailabilityLoading(false);
      Alert.alert('Success', 'Availability schedule saved successfully!');
    }, 1000);
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
          loading={basicLoading}
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
          loading={skillsLoading}
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
          loading={availabilityLoading}
        />
      </ContentLayout>
    </View>
  );
}
