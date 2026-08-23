import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import SheetContainer from '@/components/ui/SheetContainer';
import { MONTHS } from '@/constants/calendar';

export interface DateOfBirthPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateString: string) => void;
  initialDate?: string;
}

export default function DateOfBirthPickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
}: DateOfBirthPickerModalProps) {
  const { t } = useTranslation();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  let initDay = 15;
  let initMonth = 'January';
  let initYear = currentYear - 25;

  if (initialDate) {
    const parts = initialDate.split('-');
    if (parts.length === 3) {
      initYear = parseInt(parts[0], 10) || initYear;
      const monthIdx = (parseInt(parts[1], 10) || 1) - 1;
      initMonth = MONTHS[monthIdx] || initMonth;
      initDay = parseInt(parts[2], 10) || initDay;
    }
  }

  const [selectedDay, setSelectedDay] = useState(initDay);
  const [selectedMonth, setSelectedMonth] = useState(initMonth);
  const [selectedYear, setSelectedYear] = useState(initYear);

  const handleConfirm = () => {
    const monthIdx = MONTHS.indexOf(selectedMonth) + 1;
    const formattedMonth = String(monthIdx).padStart(2, '0');
    const formattedDay = String(selectedDay).padStart(2, '0');
    onConfirm(`${selectedYear}-${formattedMonth}-${formattedDay}`);
    onClose();
  };

  return (
    <SheetContainer visible={visible} onClose={onClose} title={t('common.selectDateOfBirth')} maxHeightRatio={0.65}>
      <View className="flex-row justify-between mb-4 px-2">
        {/* Day Column */}
        <View className="flex-1 items-center">
          <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('common.day')}</Text>
          <ScrollView className="h-44 w-full" showsVerticalScrollIndicator={false}>
            {days.map((d) => (
              <Pressable
                key={d}
                onPress={() => setSelectedDay(d)}
                className={`py-2 items-center rounded-lg my-0.5 ${
                  selectedDay === d ? 'bg-primary/10' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedDay === d ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                  }`}
                >
                  {d}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Month Column */}
        <View className="flex-1 items-center px-1">
          <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('common.month')}</Text>
          <ScrollView className="h-44 w-full" showsVerticalScrollIndicator={false}>
            {MONTHS.map((m) => (
              <Pressable
                key={m}
                onPress={() => setSelectedMonth(m)}
                className={`py-2 items-center rounded-lg my-0.5 ${
                  selectedMonth === m ? 'bg-primary/10' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-xs ${
                    selectedMonth === m ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                  }`}
                >
                  {m.substring(0, 3)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Year Column */}
        <View className="flex-1 items-center">
          <Text className="text-xs font-sans-semibold text-gray-400 mb-2 uppercase">{t('common.year')}</Text>
          <ScrollView className="h-44 w-full" showsVerticalScrollIndicator={false}>
            {years.map((y) => (
              <Pressable
                key={y}
                onPress={() => setSelectedYear(y)}
                className={`py-2 items-center rounded-lg my-0.5 ${
                  selectedYear === y ? 'bg-primary/10' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-base ${
                    selectedYear === y ? 'font-sans-bold text-primary' : 'font-sans-medium text-gray-600'
                  }`}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      <Button title={t('common.confirm')} variant="primary" onPress={handleConfirm} className="w-full mt-2" />
    </SheetContainer>
  );
}
