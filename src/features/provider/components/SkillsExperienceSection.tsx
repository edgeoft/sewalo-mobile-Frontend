import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS } from '@/constants/colors';

import { useSnackbar } from '@/components/ui/Snackbar';
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
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [eduModalVisible, setEduModalVisible] = useState(false);
  const [expModalVisible, setExpModalVisible] = useState(false);

  // Grouped form states for adding Education and Experience
  const [eduForm, setEduForm] = useState({
    degree: '',
    institution: '',
    startYear: '',
    endYear: '',
  });

  const [expForm, setExpForm] = useState({
    title: '',
    company: '',
    startYear: '',
    endYear: '',
  });

  const handleAddEduSubmit = () => {
    if (!eduForm.degree || !eduForm.institution) {
      showSnackbar({ message: 'Degree and Institution are required.', type: 'error' });
      return;
    }
    onAddEducation({
      id: Date.now(),
      degree: eduForm.degree,
      institution: eduForm.institution,
      startYear: eduForm.startYear,
      endYear: eduForm.endYear || 'Present',
    });
    setEduForm({ degree: '', institution: '', startYear: '', endYear: '' });
    setEduModalVisible(false);
  };

  const handleAddExpSubmit = () => {
    if (!expForm.title || !expForm.company) {
      showSnackbar({ message: 'Job Title and Company are required.', type: 'error' });
      return;
    }
    onAddExperience({
      id: Date.now(),
      title: expForm.title,
      company: expForm.company,
      startYear: expForm.startYear,
      endYear: expForm.endYear || 'Present',
    });
    setExpForm({ title: '', company: '', startYear: '', endYear: '' });
    setExpModalVisible(false);
  };

  return (
    <View className="rounded-2xl border border-gray-200 bg-white p-5 mb-6 shadow-sm">
      <View className="mb-3 flex-row items-center gap-x-2.5">
        <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center">
          <Feather name="award" size={16} color={THEME_COLORS.purple600} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-gray-950">{t('provider.skillsAndExperience')}</Text>
          <Text className="text-xs font-sans-medium text-gray-500 mt-0.5 leading-tight">
            {t('provider.skillsAndExperienceDesc')}
          </Text>
        </View>
      </View>

      <View className="border-b border-gray-100 mb-4" />

      <View className="gap-y-5">
        {/* Education Section */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">{t('provider.education')}</Text>

          {/* Education List */}
          {educationList.length > 0 ? (
            <View className="mb-3 gap-y-2">
              {educationList.map((item, idx) => (
                <View
                  key={item.id ?? `edu-${idx}`}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-sans-bold text-gray-900">{item.degree}</Text>
                    <Text className="text-xs font-sans-medium text-gray-500">{item.institution}</Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">
                      {item.startYear} - {item.endYear}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onRemoveEducation(idx)}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.remove')}
                    hitSlop={8}
                    className="p-1 active:opacity-75"
                  >
                    <Feather name="trash-2" size={16} color={THEME_COLORS.dangerRed} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            title={t('provider.addEducation')}
            onPress={() => setEduModalVisible(true)}
            variant="outline"
            size="sm"
            className="border-dashed border-gray-300"
            textClassName="text-gray-700 font-sans-semibold"
          />
        </View>

        {/* Experience Section */}
        <View>
          <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">{t('provider.experience')}</Text>

          {/* Experience List */}
          {experienceList.length > 0 ? (
            <View className="mb-3 gap-y-2">
              {experienceList.map((item, idx) => (
                <View
                  key={item.id ?? `exp-${idx}`}
                  className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <View className="flex-1 pr-2">
                    <Text className="text-sm font-sans-bold text-gray-900">{item.title}</Text>
                    <Text className="text-xs font-sans-medium text-gray-500">{item.company}</Text>
                    <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">
                      {item.startYear} - {item.endYear}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onRemoveExperience(idx)}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.remove')}
                    hitSlop={8}
                    className="p-1 active:opacity-75"
                  >
                    <Feather name="trash-2" size={16} color={THEME_COLORS.dangerRed} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <Button
            title={t('provider.addExperience')}
            onPress={() => setExpModalVisible(true)}
            variant="outline"
            size="sm"
            className="border-dashed border-gray-300"
            textClassName="text-gray-700 font-sans-semibold"
          />
        </View>

        <Button
          title={t('common.save')}
          onPress={onSave}
          loading={loading}
          variant="primary"
          size="md"
          className="mt-4 w-full bg-primary"
        />
      </View>

      {/* Add Education Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eduModalVisible}
        onRequestClose={() => setEduModalVisible(false)}
        accessibilityViewIsModal={true}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setEduModalVisible(false)} accessible={false}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('provider.addEducation')}</Text>
              <Pressable
                onPress={() => setEduModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color={THEME_COLORS.slate500} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px] mb-4">
              <View className="gap-y-4">
                <Input
                  label="Degree / Certification *"
                  placeholder="e.g. Bachelor in Civil Engineering"
                  value={eduForm.degree}
                  onChangeText={(degree) => setEduForm((prev) => ({ ...prev, degree }))}
                  inputStyle={{ padding: 0 }}
                />

                <Input
                  label="School / Institution *"
                  placeholder="e.g. Tribhuvan University"
                  value={eduForm.institution}
                  onChangeText={(institution) => setEduForm((prev) => ({ ...prev, institution }))}
                  inputStyle={{ padding: 0 }}
                />

                <View className="flex-row justify-between gap-x-2 items-end">
                  <View className="flex-1">
                    <Input
                      label="Start Year"
                      placeholder="e.g. 2018"
                      value={eduForm.startYear}
                      onChangeText={(startYear) => setEduForm((prev) => ({ ...prev, startYear }))}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="End Year (Leave blank if present)"
                      placeholder="e.g. 2022"
                      value={eduForm.endYear}
                      onChangeText={(endYear) => setEduForm((prev) => ({ ...prev, endYear }))}
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
        accessibilityViewIsModal={true}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setExpModalVisible(false)} accessible={false}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('provider.addExperience')}</Text>
              <Pressable
                onPress={() => setExpModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color={THEME_COLORS.slate500} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px] mb-4">
              <View className="gap-y-4">
                <Input
                  label="Job Title *"
                  placeholder="e.g. Senior Home Decorator"
                  value={expForm.title}
                  onChangeText={(title) => setExpForm((prev) => ({ ...prev, title }))}
                  inputStyle={{ padding: 0 }}
                />

                <Input
                  label="Company / Employer *"
                  placeholder="e.g. Kathmandu Cleaners & Decor"
                  value={expForm.company}
                  onChangeText={(company) => setExpForm((prev) => ({ ...prev, company }))}
                  inputStyle={{ padding: 0 }}
                />

                <View className="flex-row justify-between gap-x-2 items-end">
                  <View className="flex-1">
                    <Input
                      label="Start Year"
                      placeholder="e.g. 2020"
                      value={expForm.startYear}
                      onChangeText={(startYear) => setExpForm((prev) => ({ ...prev, startYear }))}
                      keyboardType="number-pad"
                      inputStyle={{ padding: 0 }}
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="End Year (Leave blank if present)"
                      placeholder="e.g. 2024"
                      value={expForm.endYear}
                      onChangeText={(endYear) => setExpForm((prev) => ({ ...prev, endYear }))}
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
    shadowColor: THEME_COLORS.slate900,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
});
