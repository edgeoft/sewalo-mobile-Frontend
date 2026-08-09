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
      {title ? (
        <>
          <View className="mb-3 flex-row items-center gap-x-2.5">
            <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center">
              <Feather name="clock" size={16} color="#059669" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-sans-bold text-gray-950">{title}</Text>
              {subtitle && (
                <Text className="text-xs font-sans-medium text-gray-500 mt-0.5 leading-tight">{subtitle}</Text>
              )}
            </View>
          </View>
          <View className="border-b border-gray-100 mb-4" />
        </>
      ) : null}

      {/* Working Days */}
      <View className="mb-5">
        <Text className="text-xs font-sans-bold text-gray-900 mb-2.5 uppercase tracking-wide">
          {t('provider.workingDays')}
        </Text>
        <View className="gap-y-2.5">
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
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                className={`p-3.5 rounded-xl border flex-row items-center justify-between ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-1 pr-3">
                  <View className="flex-row items-center justify-between gap-x-2 mb-1">
                    <Text
                      className={`text-sm font-sans-bold ${isSelected ? 'text-primary' : 'text-gray-900'}`}
                      numberOfLines={1}
                    >
                      {opt.title}
                    </Text>
                    <View className="bg-gray-100 px-2 py-0.5 rounded-md">
                      <Text className="text-[10px] font-sans-semibold text-gray-600">{opt.days}</Text>
                    </View>
                  </View>
                  <Text className="text-xs font-sans-medium text-gray-500">{opt.sub}</Text>
                </View>
                <View
                  className={`w-4 h-4 rounded-full border items-center justify-center ${
                    isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <View className="w-1.5 h-1.5 rounded-full bg-white" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Working Hours */}
      <View className="mb-5">
        <Text className="text-xs font-sans-bold text-gray-900 mb-2.5 uppercase tracking-wide">
          {t('provider.workingHours')}
        </Text>
        <View className="flex-row items-center gap-x-2.5">
          <Pressable
            onPress={() => openTimePicker('start')}
            accessibilityRole="button"
            accessibilityLabel={`${t('provider.startTime')}: ${workingHoursStart}`}
            className="flex-1 p-3 rounded-xl border border-gray-200 bg-white flex-row items-center justify-between active:bg-gray-50"
          >
            <View className="flex-1 pr-1">
              <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('provider.startTime')}
              </Text>
              <Text className="text-sm font-sans-bold text-gray-900">{workingHoursStart}</Text>
            </View>
            <Feather name="clock" size={16} color="#64748b" />
          </Pressable>

          <Text className="text-xs font-sans-semibold text-gray-400">{t('common.to')}</Text>

          <Pressable
            onPress={() => openTimePicker('end')}
            accessibilityRole="button"
            accessibilityLabel={`${t('provider.endTime')}: ${workingHoursEnd}`}
            className="flex-1 p-3 rounded-xl border border-gray-200 bg-white flex-row items-center justify-between active:bg-gray-50"
          >
            <View className="flex-1 pr-1">
              <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                {t('provider.endTime')}
              </Text>
              <Text className="text-sm font-sans-bold text-gray-900">{workingHoursEnd}</Text>
            </View>
            <Feather name="clock" size={16} color="#64748b" />
          </Pressable>
        </View>
      </View>

      {onSave && (
        <Button
          title={saveButtonTitle || t('common.save')}
          variant="primary"
          size="md"
          onPress={onSave}
          loading={loading}
          className="w-full mt-4 bg-primary"
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
