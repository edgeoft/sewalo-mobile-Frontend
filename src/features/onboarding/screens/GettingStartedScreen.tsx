import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import TopBar from '@/components/navigation/TopBar';
import LanguageSelector from '@/components/ui/LanguageSelector';
import RadialStepper from '@/components/common/RadialStepper';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/providers/AuthProvider';
import { UserRole } from '@/types';
import ContentLayout from '@/components/layout/ContentLayout';
import Animated, { FadeIn } from 'react-native-reanimated';

// Step components
import OnboardingIllustration from '../components/OnboardingIllustration';
import PersonalInfoStep, { PersonalInfoData } from '../components/PersonalInfoStep';
import SkillsExperienceStep, { EducationItem, ExperienceItem } from '../components/SkillsExperienceStep';
import AvailabilityStep from '../components/AvailabilityStep';
import FinancialDetailsStep, { FinancialData } from '../components/FinancialDetailsStep';
import IdentityVerificationStep from '../components/IdentityVerificationStep';
import FinishOnboardingStep from '../components/FinishOnboardingStep';

interface StepInfo {
  key: string;
  label: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
}

export default function GettingStartedScreen() {
  const router = useRouter();
  const { setRole } = useAuth();
  const { role: rawRole, phone } = useLocalSearchParams<{ role?: string; phone?: string }>();

  // Determine user role
  const role: 'customer' | 'provider' = rawRole === 'provider' ? 'provider' : 'customer';

  // Active Screen Index
  // 0 = Welcome screen
  // 1+ = Dynamic Form Steps
  // Last = Finish Setup screen
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // --- Step 1: Personal Info Form State ---
  const {
    control: personalInfoControl,
    handleSubmit: handlePersonalInfoSubmit,
    setValue: setPersonalInfoValue,
    watch: watchPersonalInfo,
    formState: { errors: personalInfoErrors },
  } = useForm<PersonalInfoData>({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: phone || '',
      location: '',
      languages: [],
      avatar: '',
      dateOfBirth: '',
    },
    mode: 'onBlur',
  });

  const watchLanguages = watchPersonalInfo('languages') || [];
  const watchDateOfBirth = watchPersonalInfo('dateOfBirth') || '';
  const watchAvatar = watchPersonalInfo('avatar') || '';

  // --- Step 2: Skills & Experience Form State (Provider Only) ---
  const [education, setEducation] = useState<EducationItem[]>([
    { id: '1', degree: '', institute: '', startDate: '', endDate: '' },
  ]);
  const [experience, setExperience] = useState<ExperienceItem[]>([
    { id: '1', title: '', companyName: '', startDate: '', endDate: '' },
  ]);

  // --- Step 3: Availability Form State (Provider Only) ---
  const [workingDays, setWorkingDays] = useState<'everyday' | 'sunday_friday' | 'weekend'>('sunday_friday');
  const [workingHoursStart, setWorkingHoursStart] = useState('10:00 AM');
  const [workingHoursEnd, setWorkingHoursEnd] = useState('06:00 PM');

  const handleHoursChange = (start: string, end: string) => {
    setWorkingHoursStart(start);
    setWorkingHoursEnd(end);
  };

  // --- Step 4: Financial Details Form State (Provider Only) ---
  const {
    control: financialControl,
    handleSubmit: handleFinancialSubmit,
    formState: { errors: financialErrors },
  } = useForm<FinancialData>({
    defaultValues: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      branchName: '',
    },
    mode: 'onBlur',
  });

  // --- Step 5: Identity Verification Form State ---
  const [documentImage, setDocumentImage] = useState<string | null>(null);

  // --- Configuration of form steps based on Role ---
  // Step 0 = Welcome, last step = Finish.
  const steps: StepInfo[] =
    role === 'provider'
      ? [
          { key: 'welcome', label: 'Welcome' },
          { key: 'personal_info', label: 'Personal Details', subtitle: 'Step 1 of 5: Personal Details', icon: 'user' },
          {
            key: 'skills_experience',
            label: 'Skills & Experience',
            subtitle: 'Step 2 of 5: Skills & Experience',
            icon: 'briefcase',
          },
          { key: 'availability', label: 'Availability', subtitle: 'Step 3 of 5: Weekly Schedule', icon: 'calendar' },
          {
            key: 'financial_details',
            label: 'Financial Details',
            subtitle: 'Step 4 of 5: Bank Details',
            icon: 'dollar-sign',
          },
          {
            key: 'identity_verification',
            label: 'Identity Verification',
            subtitle: 'Step 5 of 5: ID Document',
            icon: 'shield',
          },
          { key: 'finish', label: 'Finish' },
        ]
      : [
          { key: 'welcome', label: 'Welcome' },
          { key: 'personal_info', label: 'Personal Details', subtitle: 'Step 1 of 2: Personal Details', icon: 'user' },
          {
            key: 'identity_verification',
            label: 'Identity Verification',
            subtitle: 'Step 2 of 2: ID Document',
            icon: 'shield',
          },
          { key: 'finish', label: 'Finish' },
        ];

  const totalFormSteps = steps.length - 2; // Subtracting Welcome & Finish screens

  const handleNext = () => {
    const currentStepKey = steps[activeIndex].key;

    if (currentStepKey === 'welcome') {
      setActiveIndex(1);
      return;
    }

    if (currentStepKey === 'personal_info') {
      handlePersonalInfoSubmit(() => {
        setActiveIndex(activeIndex + 1);
      })();
      return;
    }

    if (currentStepKey === 'financial_details') {
      handleFinancialSubmit(() => {
        setActiveIndex(activeIndex + 1);
      })();
      return;
    }

    // Default increment
    setActiveIndex(activeIndex + 1);
  };

  const handleSkip = () => {
    setActiveIndex(activeIndex + 1);
  };

  const handleBack = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else {
      router.back();
    }
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Determine display role
      setRole(role as UserRole);

      if (role === 'provider') {
        router.replace(ROUTES.provider.home as any);
      } else {
        router.replace(ROUTES.customer.home as any);
      }
    }, 1500);
  };

  const currentStep = steps[activeIndex];
  const isFormStep = currentStep.key !== 'welcome' && currentStep.key !== 'finish';

  const stepper = isFormStep ? (
    <RadialStepper
      currentStep={activeIndex}
      totalSteps={totalFormSteps}
      label={currentStep.label}
      subtitle={currentStep.subtitle}
      iconName={currentStep.icon || 'user'}
      progressColor="#485aff"
      bgColor="#ffffff"
    />
  ) : undefined;

  // Helper to render active step view
  const renderStepContent = () => {
    switch (currentStep.key) {
      case 'welcome':
        return (
          <ContentLayout scrollable={false} className="flex-1 justify-between pt-5 pb-6">
            <View className="flex-1 justify-between px-2">
              {/* Header and Welcome */}
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1 mr-4">
                  <Text className="text-2xl font-sans-extrabold text-gray-950 leading-tight">Hi Ash Bud,</Text>
                  <Text className="text-sm font-sans-semibold text-gray-500 mt-1">
                    {role === 'provider'
                      ? 'Ready to showcase your skills and connect with customers in your area?'
                      : 'Ready to search for verified home service providers in your local area?'}
                  </Text>
                </View>

                {/* Estimate time pill */}
                <View className="bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-full flex-row items-center flex-shrink-0">
                  <Feather name="clock" size={12} color="#485aff" />
                  <Text className="text-[10px] font-sans-bold text-primary ml-1">
                    {role === 'provider' ? 'Takes 4-5 mins' : 'Takes 2-3 mins'}
                  </Text>
                </View>
              </View>

              {/* Pure SVG banner Illustration - Flex container to center it my-4 */}
              <View className="flex-1 justify-center items-center my-4">
                <OnboardingIllustration role={role} />
              </View>

              {/* Title & Description instructions */}
              <View className="items-center px-2 mb-4">
                <Text className="text-base font-sans-extrabold text-gray-900 text-center leading-snug">
                  Start creating your profile by following easy steps
                </Text>
                <Text className="text-xs font-sans-medium text-gray-400 text-center mt-1.5 leading-relaxed">
                  We&apos;ll guide you through each step to make sure your profile stands out and helps you get the most
                  out of Sewalo.
                </Text>
              </View>

              {/* Bottom Button */}
              <Button
                title="Get Started Now"
                rightIcon={<Feather name="arrow-right" size={16} color="white" />}
                onPress={handleNext}
                variant="primary"
                size="sm"
                className="w-full bg-primary"
              />
            </View>
          </ContentLayout>
        );

      case 'personal_info':
        return (
          <PersonalInfoStep
            control={personalInfoControl}
            errors={personalInfoErrors}
            setValue={setPersonalInfoValue}
            watchLanguages={watchLanguages}
            watchDateOfBirth={watchDateOfBirth}
            watchAvatar={watchAvatar}
            onNext={handleNext}
            loading={loading}
            stepper={stepper}
          />
        );

      case 'skills_experience':
        return (
          <SkillsExperienceStep
            education={education}
            setEducation={setEducation}
            experience={experience}
            setExperience={setExperience}
            onNext={handleNext}
            onSkip={handleSkip}
            stepper={stepper}
          />
        );

      case 'availability':
        return (
          <AvailabilityStep
            workingDays={workingDays}
            setWorkingDays={setWorkingDays}
            workingHoursStart={workingHoursStart}
            workingHoursEnd={workingHoursEnd}
            onChangeHours={handleHoursChange}
            onNext={handleNext}
            stepper={stepper}
          />
        );

      case 'financial_details':
        return (
          <FinancialDetailsStep
            control={financialControl}
            errors={financialErrors}
            onNext={handleNext}
            onSkip={handleSkip}
            stepper={stepper}
          />
        );

      case 'identity_verification':
        return (
          <IdentityVerificationStep
            documentImage={documentImage}
            setDocumentImage={setDocumentImage}
            onNext={handleNext}
            onSkip={handleSkip}
            role={role}
            stepper={stepper}
          />
        );

      case 'finish':
        return <FinishOnboardingStep onFinish={handleFinish} />;

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary">
      {/* Top Bar for Screen Navigation */}
      <TopBar
        showBackButton={activeIndex > 0}
        onBackPress={handleBack}
        rightContent={<LanguageSelector />}
        includeBottomBorder={true}
        containerClassName="bg-white border-b border-gray-100"
      />

      <Animated.View key={currentStep.key} entering={FadeIn.duration(250)} className="flex-1 bg-transparent">
        {renderStepContent()}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
