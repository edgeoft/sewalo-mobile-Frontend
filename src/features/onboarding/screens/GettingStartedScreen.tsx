import React from 'react';
import { KeyboardAvoidingView, Platform, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TopBar from '@/components/navigation/TopBar';
import LanguageSelector from '@/components/ui/LanguageSelector';
import RadialStepper from '@/components/common/RadialStepper';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

// Step components
import OnboardingIllustration from '../components/OnboardingIllustration';
import PersonalInfoStep from '../components/PersonalInfoStep';
import SkillsExperienceStep from '../components/SkillsExperienceStep';
import AvailabilityStep from '../components/AvailabilityStep';
import FinancialDetailsStep from '../components/FinancialDetailsStep';
import IdentityVerificationStep from '../components/IdentityVerificationStep';
import FinishOnboardingStep from '../components/FinishOnboardingStep';

// Hook
import { useOnboarding } from '../hooks/useOnboarding';

export default function GettingStartedScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeIndex,
    loading,
    role,
    totalFormSteps,
    isFormStep,
    currentStep,
    personalInfoControl,
    personalInfoErrors,
    setPersonalInfoValue,
    watchLanguages,
    watchDateOfBirth,
    watchAvatar,
    education,
    setEducation,
    experience,
    setExperience,
    workingDays,
    setWorkingDays,
    workingHoursStart,
    workingHoursEnd,
    handleHoursChange,
    documentImage,
    setDocumentImage,
    handleNext,
    handleSkip,
    handleBack,
    handleFinish,
    user,
  } = useOnboarding();

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
          <View className="flex-1 justify-between bg-transparent">
            <ContentLayout scrollable={false} className="flex-1">
              <View className="flex-1 justify-between pt-5 px-2">
                {/* Header and Welcome */}
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-2xl font-sans-extrabold text-gray-950 leading-tight">
                      Hi {user?.name || 'User'},
                    </Text>
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

                {/* Pure SVG banner Illustration */}
                <View className="flex-1 justify-center items-center my-4">
                  <OnboardingIllustration role={role} />
                </View>

                {/* Title & Description instructions */}
                <View className="items-center px-2 mb-4">
                  <Text className="text-base font-sans-extrabold text-gray-900 text-center leading-snug">
                    Start creating your profile by following easy steps
                  </Text>
                  <Text className="text-xs font-sans-medium text-gray-400 text-center mt-1.5 leading-relaxed">
                    We&apos;ll guide you through each step to make sure your profile stands out and helps you get the
                    most out of Sewalo.
                  </Text>
                </View>
              </View>
            </ContentLayout>

            {/* Sticky Bottom Button */}
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
                title="Get Started Now"
                rightIcon={<Feather name="arrow-right" size={16} color="white" />}
                onPress={handleNext}
                variant="primary"
                size="sm"
                className="w-full bg-primary"
              />
            </View>
          </View>
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
        return <FinancialDetailsStep onNext={handleNext} onSkip={handleSkip} stepper={stepper} />;

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

      {/* Loading overlay for step updates & final complete profile requests */}
      {loading && (
        <View style={StyleSheet.absoluteFill} className="bg-black/25 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-2xl shadow-xl items-center">
            <ActivityIndicator size="large" color="#485aff" />
            <Text className="text-sm font-sans-semibold text-gray-800 mt-3">Saving progress...</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
