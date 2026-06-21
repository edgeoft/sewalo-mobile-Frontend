import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface EducationItem {
  id?: number;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
}

export interface ExperienceItem {
  id?: number;
  title: string;
  company: string;
  startYear: string;
  endYear: string;
}

interface SkillsExperienceSectionProps {
  educationList: EducationItem[];
  experienceList: ExperienceItem[];
  onAddEducation: (item: EducationItem) => void;
  onRemoveEducation: (index: number) => void;
  onAddExperience: (item: ExperienceItem) => void;
  onRemoveExperience: (index: number) => void;
  onSave: () => void;
  loading?: boolean;
}

export default function SkillsExperienceSection({
  educationList = [],
  experienceList = [],
  onAddEducation,
  onRemoveEducation,
  onAddExperience,
  onRemoveExperience,
  onSave,
  loading = false,
}: SkillsExperienceSectionProps) {
  const [eduModalVisible, setEduModalVisible] = useState(false);
  const [expModalVisible, setExpModalVisible] = useState(false);

  // Temp form states for adding Education
  const [degree, setDegree] = useState('');
  const [institution, setInstitution] = useState('');
  const [eduStartYear, setEduStartYear] = useState('');
  const [eduEndYear, setEduEndYear] = useState('');

  // Temp form states for adding Experience
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [expStartYear, setExpStartYear] = useState('');
  const [expEndYear, setExpEndYear] = useState('');

  const handleAddEduSubmit = () => {
    if (!degree || !institution) {
      alert('Degree and Institution are required.');
      return;
    }
    onAddEducation({
      id: Date.now(),
      degree,
      institution,
      startYear: eduStartYear,
      endYear: eduEndYear || 'Present',
    });
    // Reset fields
    setDegree('');
    setInstitution('');
    setEduStartYear('');
    setEduEndYear('');
    setEduModalVisible(false);
  };

  const handleAddExpSubmit = () => {
    if (!jobTitle || !company) {
      alert('Job Title and Company are required.');
      return;
    }
    onAddExperience({
      id: Date.now(),
      title: jobTitle,
      company,
      startYear: expStartYear,
      endYear: expEndYear || 'Present',
    });
    // Reset fields
    setJobTitle('');
    setCompany('');
    setExpStartYear('');
    setExpEndYear('');
    setExpModalVisible(false);
  };

  return (
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
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Skills And Experience</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          Add your education details and work history to build trust with customers.
        </Text>
      </View>

      <View className="gap-y-5">
        {/* Education Section */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">Education (Optional)</Text>

          {/* Education List */}
          {educationList.length > 0 ? (
            <View className="mb-3 gap-y-2">
              {educationList.map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-sans-bold text-gray-900">{item.degree}</Text>
                    <Text className="text-xs font-sans-medium text-gray-500">{item.institution}</Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">
                      {item.startYear} - {item.endYear}
                    </Text>
                  </View>
                  <Pressable onPress={() => onRemoveEducation(idx)} className="p-1 active:opacity-75">
                    <Feather name="trash-2" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            title="+ Add Education"
            onPress={() => setEduModalVisible(true)}
            variant="outline"
            size="sm"
            className="border-dashed border-gray-300"
            textClassName="text-gray-700 font-sans-semibold"
          />
        </View>

        {/* Experience Section */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">Experience (Optional)</Text>

          {/* Experience List */}
          {experienceList.length > 0 ? (
            <View className="mb-3 gap-y-2">
              {experienceList.map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-sans-bold text-gray-900">{item.title}</Text>
                    <Text className="text-xs font-sans-medium text-gray-500">{item.company}</Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">
                      {item.startYear} - {item.endYear}
                    </Text>
                  </View>
                  <Pressable onPress={() => onRemoveExperience(idx)} className="p-1 active:opacity-75">
                    <Feather name="trash-2" size={16} color="#ef4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            title="+ Add Experience"
            onPress={() => setExpModalVisible(true)}
            variant="outline"
            size="sm"
            className="border-dashed border-gray-300"
            textClassName="text-gray-700 font-sans-semibold"
          />
        </View>

        {/* Save Education & Experience Button */}
        <Button
          title="Save Education & Experience"
          onPress={onSave}
          loading={loading}
          variant="primary"
          className="mt-2 bg-primary"
        />
      </View>

      {/* Add Education Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eduModalVisible}
        onRequestClose={() => setEduModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setEduModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">Add Education</Text>
              <Pressable
                onPress={() => setEduModalVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px] mb-4">
              <View className="gap-y-4">
                <Input
                  label="Degree / Certification *"
                  placeholder="e.g. Bachelor in Civil Engineering"
                  value={degree}
                  onChangeText={setDegree}
                  inputStyle={{ padding: 0 }}
                />

                <Input
                  label="School / Institution *"
                  placeholder="e.g. Tribhuvan University"
                  value={institution}
                  onChangeText={setInstitution}
                  inputStyle={{ padding: 0 }}
                />

                <View className="flex-row justify-between gap-x-2 items-end">
                  <View className="flex-1">
                    <Input
                      label="Start Year"
                      placeholder="e.g. 2018"
                      value={eduStartYear}
                      onChangeText={setEduStartYear}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="End Year (Leave blank if present)"
                      placeholder="e.g. 2022"
                      value={eduEndYear}
                      onChangeText={setEduEndYear}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <Button title="Add Education" onPress={handleAddEduSubmit} variant="primary" className="w-full" />
          </View>
        </View>
      </Modal>

      {/* Add Experience Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={expModalVisible}
        onRequestClose={() => setExpModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setExpModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">Add Experience</Text>
              <Pressable
                onPress={() => setExpModalVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px] mb-4">
              <View className="gap-y-4">
                <Input
                  label="Job Title *"
                  placeholder="e.g. Senior Home Decorator"
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  inputStyle={{ padding: 0 }}
                />

                <Input
                  label="Company / Employer *"
                  placeholder="e.g. Kathmandu Cleaners & Decor"
                  value={company}
                  onChangeText={setCompany}
                  inputStyle={{ padding: 0 }}
                />

                <View className="flex-row justify-between gap-x-2 items-end">
                  <View className="flex-1">
                    <Input
                      label="Start Year"
                      placeholder="e.g. 2020"
                      value={expStartYear}
                      onChangeText={setExpStartYear}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="End Year (Leave blank if present)"
                      placeholder="e.g. 2024"
                      value={expEndYear}
                      onChangeText={setExpEndYear}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <Button title="Add Experience" onPress={handleAddExpSubmit} variant="primary" className="w-full" />
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
