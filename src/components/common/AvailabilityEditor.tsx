import React, { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import SheetContainer from '@/components/ui/SheetContainer';
import { AVAILABILITY_TYPES, type AvailabilityType } from '@/constants/availability';

export interface AvailabilityEditorProps {
  workingDays: AvailabilityType | string;
  onChangeWorkingDays: (days: AvailabilityType) => void;
  workingHoursStart: string;
  workingHoursEnd: string;
  onChangeHours: (start: string, end: string) => void;
  title?: string;
  subtitle?: string;
  onSave?: () => void;
  saveButtonTitle?: string;
  loading?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

export default function AvailabilityEditor({
  workingDays,
  onChangeWorkingDays,
  workingHoursStart,
  workingHoursEnd,
  onChangeHours,
  title,
  subtitle,
  onSave,
  saveButtonTitle,
  loading = false,
}: AvailabilityEditorProps) {
  const { t } = useTranslation();
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end'>('start');

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

  const dayOptions = [
    {
      id: AVAILABILITY_TYPES.Always,
      title: t('provider.workingDaysEveryday'),
      sub: t('provider.workingDaysEverydaySub'),
      days: t('provider.everyday'),
    },
    {
      id: AVAILABILITY_TYPES.Weekdays,
      title: t('provider.workingDaysSundayFriday'),
      sub: t('provider.workingDaysSundayFridaySub'),
      days: t('provider.sundayFriday'),
    },
    {
      id: AVAILABILITY_TYPES.Weekends,
      title: t('provider.workingDaysWeekendOnly'),
      sub: t('provider.workingDaysWeekendOnlySub'),
      days: t('provider.saturdayOnly'),
    },
  ];

  return (
    <View className="flex-1">
      {title && (
        <View className="mb-6">
          <Text className="text-2xl font-sans-extrabold text-gray-900 tracking-tight">{title}</Text>
          {subtitle && <Text className="text-sm font-sans-medium text-gray-500 mt-1 leading-5">{subtitle}</Text>}
        </View>
      )}

      {/* Working Days */}
      <View className="mb-6">
        <Text className="text-xs font-sans-bold text-gray-950 mb-3 uppercase tracking-wide">
          {t('provider.workingDays')}
        </Text>
        <View className="gap-y-3">
          {dayOptions.map((opt) => {
            const isSelected =
              workingDays === opt.id ||
              (workingDays === 'everyday' && opt.id === AVAILABILITY_TYPES.Always) ||
              (workingDays === 'sunday_friday' && opt.id === AVAILABILITY_TYPES.Weekdays) ||
              (workingDays === 'weekend' && opt.id === AVAILABILITY_TYPES.Weekends);
            return (
              <Pressable
                key={opt.id}
                onPress={() => onChangeWorkingDays(opt.id)}
                className={`p-4 rounded-2xl border flex-row items-center justify-between ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className={`text-base font-sans-bold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                    {opt.title}
                  </Text>
                  <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{opt.sub}</Text>
                  <View className="mt-2 flex-row items-center">
                    <Feather name="calendar" size={12} color="#64748b" />
                    <Text className="text-[11px] font-sans-semibold text-gray-500 ml-1">{opt.days}</Text>
                  </View>
                </View>
                <View
                  className={`w-5 h-5 rounded-full border items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-white" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Working Hours */}
      <View className="mb-6">
        <Text className="text-xs font-sans-bold text-gray-950 mb-3 uppercase tracking-wide">
          {t('provider.workingHours')}
        </Text>
        <View className="flex-row items-center gap-x-3">
          <Pressable
            onPress={() => openTimePicker('start')}
            className="flex-1 p-4 rounded-2xl border border-gray-200 bg-white flex-row items-center justify-between active:bg-gray-50"
          >
            <View>
              <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('provider.startTime')}
              </Text>
              <Text className="text-base font-sans-bold text-gray-900">{workingHoursStart}</Text>
            </View>
            <Feather name="clock" size={18} color="#64748b" />
          </Pressable>

          <Text className="text-sm font-sans-semibold text-gray-400">{t('common.to')}</Text>

          <Pressable
            onPress={() => openTimePicker('end')}
            className="flex-1 p-4 rounded-2xl border border-gray-200 bg-white flex-row items-center justify-between active:bg-gray-50"
          >
            <View>
              <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('provider.endTime')}
              </Text>
              <Text className="text-base font-sans-bold text-gray-900">{workingHoursEnd}</Text>
            </View>
            <Feather name="clock" size={18} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {onSave && (
        <Button
          title={saveButtonTitle || t('common.save')}
          variant="primary"
          onPress={onSave}
          loading={loading}
          className="w-full mt-4"
        />
      )}

      {/* Time Picker Modal */}
      <SheetContainer
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        title={pickerTarget === 'start' ? t('provider.selectStartTime') : t('provider.selectEndTime')}
        maxHeightRatio={0.6}
      >
        <View className="flex-row justify-between mb-4 px-2">
          {/* Hours column */}
          <View className="flex-1 items-center">
            <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('provider.hour')}</Text>
            <ScrollView className="h-40 w-full" showsVerticalScrollIndicator={false}>
              {HOURS.map((h) => (
                <Pressable
                  key={h}
                  onPress={() => setTempHour(h)}
                  className={`py-2 items-center rounded-lg my-0.5 ${
                    tempHour === h ? 'bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-lg ${
                      tempHour === h ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                    }`}
                  >
                    {h}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Minutes column */}
          <View className="flex-1 items-center">
            <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('provider.minute')}</Text>
            <ScrollView className="h-40 w-full" showsVerticalScrollIndicator={false}>
              {MINUTES.map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setTempMinute(m)}
                  className={`py-2 items-center rounded-lg my-0.5 ${
                    tempMinute === m ? 'bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-lg ${
                      tempMinute === m ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                    }`}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Period column */}
          <View className="flex-1 items-center">
            <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('provider.period')}</Text>
            <ScrollView className="h-40 w-full" showsVerticalScrollIndicator={false}>
              {PERIODS.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setTempPeriod(p)}
                  className={`py-2 items-center rounded-lg my-0.5 ${
                    tempPeriod === p ? 'bg-primary/10' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-lg ${
                      tempPeriod === p ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                    }`}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <Button title={t('common.confirm')} variant="primary" onPress={handleConfirmTime} className="w-full mt-2" />
      </SheetContainer>
    </View>
  );
}
