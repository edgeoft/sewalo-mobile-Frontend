import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { WORKING_DAYS_OPTIONS, WorkingDaysOption } from '@/constants/availability';

interface AvailabilityStepProps {
  workingDays: WorkingDaysOption;
  setWorkingDays: (days: WorkingDaysOption) => void;
  workingHoursStart: string;
  workingHoursEnd: string;
  onChangeHours: (start: string, end: string) => void;
  onNext: () => void;
  stepper?: React.ReactNode;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

export default function AvailabilityStep({
  workingDays,
  setWorkingDays,
  workingHoursStart,
  workingHoursEnd,
  onChangeHours,
  onNext,
  stepper,
}: AvailabilityStepProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');

  // Temp hours selection states
  const [tempHour, setTempHour] = useState('10');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempPeriod, setTempPeriod] = useState('AM');

  const openTimePicker = (target: 'start' | 'end') => {
    setPickerTarget(target);
    const currentTime = target === 'start' ? workingHoursStart : workingHoursEnd;
    const match = currentTime.match(/(\d+):(\d+) (AM|PM)/);
    if (match) {
      setTempHour(match[1]);
      setTempMinute(match[2]);
      setTempPeriod(match[3]);
    }
    setTimePickerVisible(true);
  };

  const handleConfirmTime = () => {
    const formattedTime = `${tempHour}:${tempMinute} ${tempPeriod}`;
    if (pickerTarget === 'start') {
      onChangeHours(formattedTime, workingHoursEnd);
    } else {
      onChangeHours(workingHoursStart, formattedTime);
    }
    setTimePickerVisible(false);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 0,
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
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
          <View className="mb-4">
            <Text className="text-base font-sans-bold text-gray-950 mb-1">{t('onboarding.setWorkingHours')}</Text>
            <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
              {t('onboarding.setWorkingHoursDesc')}
            </Text>
          </View>

          <View className="gap-y-5">
            {/* Working Days */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">
                {t('onboarding.selectWorkingDays')}
              </Text>
              <View className="gap-y-2">
                {[
                  {
                    id: WORKING_DAYS_OPTIONS.Everyday,
                    label: t('onboarding.everyday'),
                    description: t('onboarding.everydayDesc'),
                  },
                  {
                    id: WORKING_DAYS_OPTIONS.SundayFriday,
                    label: t('onboarding.sundayFriday'),
                    description: t('onboarding.sundayFridayDesc'),
                  },
                  {
                    id: WORKING_DAYS_OPTIONS.Weekend,
                    label: t('onboarding.weekend'),
                    description: t('onboarding.weekendDesc'),
                  },
                ].map((day) => {
                  const isSelected = workingDays === day.id;
                  return (
                    <Pressable
                      key={day.id}
                      onPress={() => setWorkingDays(day.id)}
                      className={`form-input-container justify-between py-2.5 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
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
                      <View className="flex-row items-center gap-x-3 bg-transparent">
                        <Feather name="calendar" size={16} color={isSelected ? '#485aff' : '#898f8f'} />
                        <View>
                          <Text
                            className={`text-sm font-sans-semibold ${
                              isSelected ? 'text-primary font-sans-bold' : 'text-gray-800'
                            }`}
                          >
                            {day.label}
                          </Text>
                          <Text className="text-[11px] text-gray-400 font-sans-medium mt-0.5">{day.description}</Text>
                        </View>
                      </View>
                      <View
                        className={`w-4.5 h-4.5 rounded-full border items-center justify-center ${
                          isSelected ? 'border-primary bg-primary/10' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Working Hours */}
            <View>
              <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">
                {t('onboarding.selectWorkingHours')}
              </Text>
              <View className="flex-row items-center justify-between gap-x-3">
                {/* Start Time button */}
                <Pressable
                  onPress={() => openTimePicker('start')}
                  className="flex-1 flex-row items-center justify-between form-input-container form-input-container-single border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.015,
                    shadowRadius: 2,
                    elevation: 0,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text className="text-sm font-sans-medium text-gray-800">{workingHoursStart}</Text>
                  <Feather name="clock" size={14} color="#898f8f" />
                </Pressable>

                <Text className="text-gray-400 font-sans-medium">—</Text>

                {/* End Time button */}
                <Pressable
                  onPress={() => openTimePicker('end')}
                  className="flex-1 flex-row items-center justify-between form-input-container form-input-container-single border-gray-200"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.015,
                    shadowRadius: 2,
                    elevation: 0,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text className="text-sm font-sans-medium text-gray-800">{workingHoursEnd}</Text>
                  <Feather name="clock" size={14} color="#898f8f" />
                </Pressable>
              </View>
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
          title={t('onboarding.save')}
          onPress={onNext}
          variant="primary"
          size="sm"
          className="w-full bg-primary"
        />
      </View>

      {/* Time Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={timePickerVisible}
        onRequestClose={() => setTimePickerVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setTimePickerVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.drawerContainer} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">
                {pickerTarget === 'start' ? t('onboarding.selectStartTime') : t('onboarding.selectEndTime')}
              </Text>
              <Pressable
                onPress={() => setTimePickerVisible(false)}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <View className="flex-row justify-center gap-x-4 mb-6">
              {/* Hours */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">{t('services.hour')}</Text>
                <ScrollView
                  style={{ height: 120 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {HOURS.map((h) => (
                    <Pressable
                      key={h}
                      onPress={() => setTempHour(h)}
                      className={`py-2 items-center ${tempHour === h ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempHour === h ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {h}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Minutes */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                  {t('services.minute')}
                </Text>
                <ScrollView
                  style={{ height: 120 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-gray-100 rounded-lg"
                >
                  {MINUTES.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setTempMinute(m)}
                      className={`py-2 items-center ${tempMinute === m ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempMinute === m ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* AM/PM */}
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                  {t('services.period')}
                </Text>
                <View className="border border-gray-100 rounded-lg">
                  {PERIODS.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setTempPeriod(p)}
                      className={`py-3 items-center ${tempPeriod === p ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempPeriod === p ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                      >
                        {p}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Button
              title={t('onboarding.confirmTime')}
              onPress={handleConfirmTime}
              variant="primary"
              className="w-full"
            />
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
