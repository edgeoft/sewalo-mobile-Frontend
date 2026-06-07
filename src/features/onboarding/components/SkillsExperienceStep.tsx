import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';

export interface EducationItem {
  id: string;
  degree: string;
  institute: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  companyName: string;
  startDate: string;
  endDate: string;
}

interface SkillsExperienceStepProps {
  education: EducationItem[];
  setEducation: (items: EducationItem[]) => void;
  experience: ExperienceItem[];
  setExperience: (items: ExperienceItem[]) => void;
  onNext: () => void;
  onSkip: () => void;
  stepper?: React.ReactNode;
}

export default function SkillsExperienceStep({
  education,
  setEducation,
  experience,
  setExperience,
  onNext,
  onSkip,
  stepper,
}: SkillsExperienceStepProps) {
  const insets = useSafeAreaInsets();

  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: Math.random().toString(),
      degree: '',
      institute: '',
      startDate: '',
      endDate: '',
    };
    setEducation([...education, newItem]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((item) => item.id !== id));
  };

  const handleEducationChange = (id: string, field: keyof EducationItem, value: string) => {
    const updated = education.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setEducation(updated);
  };

  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: Math.random().toString(),
      title: '',
      companyName: '',
      startDate: '',
      endDate: '',
    };
    setExperience([...experience, newItem]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((item) => item.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof ExperienceItem, value: string) => {
    const updated = experience.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setExperience(updated);
  };

  const shadowStyle = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  };

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
        {/* Education Section */}
        <View style={shadowStyle} className="rounded-xl border border-gray-200 bg-white p-4 mb-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-base font-sans-bold text-gray-950">Education (Optional)</Text>
              <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-normal">
                Enter details about your academic degree and background.
              </Text>
            </View>
            <Pressable
              onPress={handleAddEducation}
              className="flex-row items-center bg-primary/10 px-2.5 py-1.5 rounded-lg active:opacity-75"
            >
              <Feather name="plus" size={14} color="#485aff" />
              <Text className="text-xs font-sans-bold text-primary ml-1">Add More</Text>
            </Pressable>
          </View>

          {education.length === 0 ? (
            <View className="py-6 items-center justify-center border border-dashed border-gray-200 rounded-lg">
              <Feather name="book-open" size={24} color="#94a3b8" />
              <Text className="text-xs font-sans-medium text-gray-400 mt-2">No education details added yet</Text>
            </View>
          ) : (
            <View className="gap-y-4">
              {education.map((item, idx) => (
                <View key={item.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 relative">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-sans-bold text-gray-800">Education #{idx + 1}</Text>
                    <Pressable onPress={() => handleRemoveEducation(item.id)} className="p-1 active:opacity-60">
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </Pressable>
                  </View>

                  <View className="gap-y-3">
                    <Input
                      label="Degree / Course"
                      placeholder="e.g. Bachelor in Computer Science"
                      value={item.degree}
                      onChangeText={(val) => handleEducationChange(item.id, 'degree', val)}
                      inputStyle={{ padding: 0 }}
                      className="bg-white"
                    />
                    <Input
                      label="School / Institute"
                      placeholder="e.g. Tribhuvan University"
                      value={item.institute}
                      onChangeText={(val) => handleEducationChange(item.id, 'institute', val)}
                      inputStyle={{ padding: 0 }}
                      className="bg-white"
                    />
                    <View className="flex-row gap-x-2">
                      <View className="flex-1">
                        <Input
                          label="Start Year"
                          placeholder="e.g. 2018"
                          value={item.startDate}
                          onChangeText={(val) => handleEducationChange(item.id, 'startDate', val)}
                          keyboardType="numeric"
                          maxLength={4}
                          inputStyle={{ padding: 0 }}
                          className="bg-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Input
                          label="End Year (or Present)"
                          placeholder="e.g. 2022"
                          value={item.endDate}
                          onChangeText={(val) => handleEducationChange(item.id, 'endDate', val)}
                          inputStyle={{ padding: 0 }}
                          className="bg-white"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Experience Section */}
        <View style={shadowStyle} className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-base font-sans-bold text-gray-950">Work Experience (Optional)</Text>
              <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-normal">
                Enter details about past jobs or client projects.
              </Text>
            </View>
            <Pressable
              onPress={handleAddExperience}
              className="flex-row items-center bg-primary/10 px-2.5 py-1.5 rounded-lg active:opacity-75"
            >
              <Feather name="plus" size={14} color="#485aff" />
              <Text className="text-xs font-sans-bold text-primary ml-1">Add More</Text>
            </Pressable>
          </View>

          {experience.length === 0 ? (
            <View className="py-6 items-center justify-center border border-dashed border-gray-200 rounded-lg">
              <Feather name="briefcase" size={24} color="#94a3b8" />
              <Text className="text-xs font-sans-medium text-gray-400 mt-2">No experience details added yet</Text>
            </View>
          ) : (
            <View className="gap-y-4">
              {experience.map((item, idx) => (
                <View key={item.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 relative">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-sans-bold text-gray-800">Experience #{idx + 1}</Text>
                    <Pressable onPress={() => handleRemoveExperience(item.id)} className="p-1 active:opacity-60">
                      <Feather name="trash-2" size={14} color="#ef4444" />
                    </Pressable>
                  </View>

                  <View className="gap-y-3">
                    <Input
                      label="Job Title / Role"
                      placeholder="e.g. Senior Electrician"
                      value={item.title}
                      onChangeText={(val) => handleExperienceChange(item.id, 'title', val)}
                      inputStyle={{ padding: 0 }}
                      className="bg-white"
                    />
                    <Input
                      label="Company / Employer"
                      placeholder="e.g. Kathmandu Home Services"
                      value={item.companyName}
                      onChangeText={(val) => handleExperienceChange(item.id, 'companyName', val)}
                      inputStyle={{ padding: 0 }}
                      className="bg-white"
                    />
                    <View className="flex-row gap-x-2">
                      <View className="flex-1">
                        <Input
                          label="Start Year"
                          placeholder="e.g. 2020"
                          value={item.startDate}
                          onChangeText={(val) => handleExperienceChange(item.id, 'startDate', val)}
                          keyboardType="numeric"
                          maxLength={4}
                          inputStyle={{ padding: 0 }}
                          className="bg-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Input
                          label="End Year (or Present)"
                          placeholder="e.g. Present"
                          value={item.endDate}
                          onChangeText={(val) => handleExperienceChange(item.id, 'endDate', val)}
                          inputStyle={{ padding: 0 }}
                          className="bg-white"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5 pt-2.5 gap-y-1.5"
        style={{
          paddingBottom: insets.bottom > 0 ? insets.bottom + 6 : 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 10,
        }}
      >
        <Button title="Save" onPress={onNext} variant="primary" size="sm" className="w-full bg-primary" />
        <Button
          title="Skip this step"
          onPress={onSkip}
          variant="ghost"
          size="sm"
          className="w-full border border-gray-200 active:bg-gray-50"
          textClassName="text-gray-600 font-sans-bold"
        />
      </View>
    </View>
  );
}
