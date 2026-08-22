import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LocationSelector from '@/components/ui/LocationSelector';
import { MONTHS, HOURS_12 as HOURS, MINUTES_15 as MINUTES, PERIODS } from '@/constants/calendar';
import { ServiceItem } from '@/types';
import {
  getProviderAvailabilityError,
  getProviderWorkingHours,
  isPastDate,
  type ProviderAvailabilityInfo,
} from '../utils/providerAvailability';
import type { LocationData } from '@/types';

export interface BookingDetails {
  serviceDate: string;
  startTime: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  notes: string;
}

interface BookingConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedServices: ServiceItem[];
  totalPrice: number;
  provider?: ProviderAvailabilityInfo | null;
  isLoading?: boolean;
  onConfirm: (details: BookingDetails) => void;
}

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear + i));
export default function BookingConfirmationModal({
  visible,
  onClose,
  selectedServices,
  totalPrice,
  provider,
  isLoading = false,
  onConfirm,
}: BookingConfirmationModalProps) {
  const { t } = useTranslation();
  const [serviceDate, setServiceDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState(27.700769);
  const [locationLng, setLocationLng] = useState(85.30014);
  const [locationCity, setLocationCity] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const [tempYear, setTempYear] = useState(String(currentYear));
  const [tempMonth, setTempMonth] = useState(MONTHS[new Date().getMonth()]);
  const [tempDay, setTempDay] = useState(String(new Date().getDate()).padStart(2, '0'));
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempPeriod, setTempPeriod] = useState('AM');

  const workingHours = getProviderWorkingHours(provider);

  const handleConfirmDate = () => {
    const monthIndex = String(MONTHS.indexOf(tempMonth) + 1).padStart(2, '0');
    const formattedDate = `${tempYear}-${monthIndex}-${tempDay}`;
    if (isPastDate(formattedDate)) {
      setErrors((prev) => ({ ...prev, serviceDate: t('services.pastDateNotAllowed') }));
      setDatePickerVisible(false);
      return;
    }
    setServiceDate(formattedDate);
    setErrors((prev) => ({ ...prev, serviceDate: '' }));
    setDatePickerVisible(false);
  };

  const handleConfirmTime = () => {
    const hour = parseInt(tempHour, 10);
    const hour24 = tempPeriod === 'PM' && hour !== 12 ? hour + 12 : tempPeriod === 'AM' && hour === 12 ? 0 : hour;
    const formattedTime = `${String(hour24).padStart(2, '0')}:${tempMinute}`;
    setStartTime(formattedTime);
    setErrors((prev) => ({ ...prev, startTime: '' }));
    setTimePickerVisible(false);
  };

  const handleLocationChange = (data: LocationData) => {
    setLocation(data.address);
    setLocationLat(data.lat);
    setLocationLng(data.lng);
    setLocationCity(data.city || '');
  };

  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};

    if (!serviceDate.trim()) {
      newErrors.serviceDate = t('services.serviceDateRequired');
    }
    if (!startTime.trim()) {
      newErrors.startTime = t('services.startTimeRequired');
    }

    if (serviceDate.trim() && startTime.trim()) {
      const availErrors = getProviderAvailabilityError(t, provider, serviceDate, startTime);
      if (availErrors.serviceDateError) {
        newErrors.serviceDate = availErrors.serviceDateError;
      }
      if (availErrors.startTimeError) {
        newErrors.startTime = availErrors.startTimeError;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onConfirm({
      serviceDate,
      startTime,
      location: location || 'Kathmandu Metropolitan City',
      city: locationCity || 'Kathmandu',
      lat: locationLat,
      lng: locationLng,
      notes,
    });

    setServiceDate('');
    setStartTime('');
    setLocation('');
    setLocationLat(27.700769);
    setLocationLng(85.30014);
    setLocationCity('');
    setNotes('');
  };

  const servicesDisplay = selectedServices.map((s) => s.title).join(', ');
  const durationDisplay = selectedServices.length > 0 ? selectedServices[0].durationLabel : '1 Day';

  const openDatePicker = () => {
    const today = new Date();
    if (serviceDate) {
      const parts = serviceDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dateObj = new Date(y, m, d);
        if (!isNaN(dateObj.getTime()) && !isPastDate(serviceDate)) {
          setTempYear(parts[0]);
          if (m >= 0 && m < 12) setTempMonth(MONTHS[m]);
          setTempDay(String(d).padStart(2, '0'));
          setDatePickerVisible(true);
          return;
        }
      }
    }
    setTempYear(String(today.getFullYear()));
    setTempMonth(MONTHS[today.getMonth()]);
    setTempDay(String(today.getDate()).padStart(2, '0'));
    setDatePickerVisible(true);
  };

  const openTimePicker = () => {
    if (startTime) {
      const match = startTime.match(/^(\d{2}):(\d{2})$/);
      if (match) {
        const h = parseInt(match[1], 10);
        setTempMinute(match[2]);
        if (h === 0) {
          setTempHour('12');
          setTempPeriod('AM');
        } else if (h < 12) {
          setTempHour(String(h).padStart(2, '0'));
          setTempPeriod('AM');
        } else if (h === 12) {
          setTempHour('12');
          setTempPeriod('PM');
        } else {
          setTempHour(String(h - 12).padStart(2, '0'));
          setTempPeriod('PM');
        }
      }
    }
    setTimePickerVisible(true);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '90%' }}
        >
          <View className="px-6 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-sans-extrabold text-gray-950">{t('services.confirmBookingService')}</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">{t('services.confirmBookingDesc')}</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              className="h-8 w-8 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
            >
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="bg-blue-50/30 border border-blue-200 rounded-lg p-4 flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-3">
                <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-1">
                  {t('services.selectedServices')}
                </Text>
                <Text className="text-xs font-sans-extrabold text-gray-800" numberOfLines={2}>
                  {servicesDisplay}
                </Text>
                <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">{durationDisplay}</Text>
              </View>
              <Text className="text-base font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
            </View>

            <View className="gap-y-4 mb-8">
              <Pressable onPress={openDatePicker} accessibilityRole="button">
                <View pointerEvents="none">
                  <Input
                    label={t('services.serviceDate')}
                    placeholder={t('services.selectServiceDatePlaceholder')}
                    value={serviceDate}
                    onChangeText={() => {}}
                    error={errors.serviceDate}
                    rightIcon={<Feather name="calendar" size={16} color="#898f8f" />}
                  />
                </View>
              </Pressable>

              <View>
                <Pressable onPress={openTimePicker} accessibilityRole="button">
                  <View pointerEvents="none">
                    <Input
                      label={t('services.startTimeLabel')}
                      placeholder={t('services.selectStartTimePlaceholder')}
                      value={startTime}
                      onChangeText={() => {}}
                      error={errors.startTime}
                      rightIcon={<Feather name="clock" size={16} color="#898f8f" />}
                    />
                  </View>
                </Pressable>
                {workingHours.startTime && workingHours.endTime && !errors.startTime ? (
                  <Text className="text-xs font-sans-medium text-gray-500 mt-1 ml-0.5">
                    {t('services.providerWorkingHours', {
                      start: workingHours.startTime,
                      end: workingHours.endTime,
                    })}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">
                  {t('services.locationLabel')}
                </Text>
                <LocationSelector
                  value={location}
                  lat={locationLat}
                  lng={locationLng}
                  onChange={handleLocationChange}
                  placeholder={t('services.selectServiceLocation')}
                />
              </View>

              <Input
                label={t('services.additionalNotes')}
                placeholder={t('services.specialInstructions')}
                value={notes}
                onChangeText={setNotes}
                multiline={true}
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            </View>

            <View className="pt-2 pb-6 border-t border-gray-100 gap-y-2.5">
              <Button
                title={t('services.confirmBooking')}
                variant="primary"
                size="md"
                loading={isLoading}
                disabled={isLoading}
                onPress={handleConfirm}
              />

              <Button
                title={t('common.cancel')}
                variant="outline"
                size="md"
                onPress={onClose}
                className="border-primary bg-white active:bg-blue-50/30"
                textClassName="text-primary font-sans-semibold"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={datePickerVisible}
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setDatePickerVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View className="bg-white rounded-t-3xl px-5 pb-7 pt-4" style={styles.drawerContainer}>
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('services.selectServiceDate')}</Text>
              <Pressable
                onPress={() => setDatePickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            {(() => {
              const selectedYearNum = parseInt(tempYear, 10) || currentYear;
              const selectedMonthIdx = MONTHS.indexOf(tempMonth);
              const now = new Date();
              const currentMonthIdx = now.getMonth();
              const currentDayNum = now.getDate();

              const maxDaysInMonth = new Date(selectedYearNum, selectedMonthIdx + 1, 0).getDate();
              const daysList = Array.from({ length: maxDaysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

              return (
                <View className="flex-row justify-between mb-6 gap-x-2">
                  <View className="flex-1">
                    <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                      {t('services.year')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-gray-100 rounded-lg"
                    >
                      {YEARS.map((y) => (
                        <Pressable
                          key={y}
                          onPress={() => setTempYear(y)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: tempYear === y }}
                          className={`py-2 items-center ${tempYear === y ? 'bg-primary/10' : ''}`}
                        >
                          <Text
                            className={`font-sans-medium ${tempYear === y ? 'text-primary font-sans-bold' : 'text-gray-700'}`}
                          >
                            {y}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="flex-[1.5]">
                    <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                      {t('services.month')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-gray-100 rounded-lg"
                    >
                      {MONTHS.map((m, idx) => {
                        const isPastMonth = selectedYearNum === currentYear && idx < currentMonthIdx;
                        return (
                          <Pressable
                            key={m}
                            disabled={isPastMonth}
                            onPress={() => {
                              setTempMonth(m);
                              const newMaxDays = new Date(selectedYearNum, idx + 1, 0).getDate();
                              if (parseInt(tempDay, 10) > newMaxDays) {
                                setTempDay(String(newMaxDays).padStart(2, '0'));
                              }
                            }}
                            accessibilityRole="button"
                            accessibilityState={{ selected: tempMonth === m, disabled: isPastMonth }}
                            className={`py-2 items-center ${tempMonth === m ? 'bg-primary/10' : ''} ${
                              isPastMonth ? 'opacity-30' : ''
                            }`}
                          >
                            <Text
                              className={`font-sans-medium ${
                                tempMonth === m
                                  ? 'text-primary font-sans-bold'
                                  : isPastMonth
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                              }`}
                            >
                              {m}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                      {t('services.day')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-gray-100 rounded-lg"
                    >
                      {daysList.map((d) => {
                        const dNum = parseInt(d, 10);
                        const isPastDay =
                          selectedYearNum === currentYear &&
                          selectedMonthIdx === currentMonthIdx &&
                          dNum < currentDayNum;
                        return (
                          <Pressable
                            key={d}
                            disabled={isPastDay}
                            onPress={() => setTempDay(d)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: tempDay === d, disabled: isPastDay }}
                            className={`py-2 items-center ${tempDay === d ? 'bg-primary/10' : ''} ${
                              isPastDay ? 'opacity-30' : ''
                            }`}
                          >
                            <Text
                              className={`font-sans-medium ${
                                tempDay === d
                                  ? 'text-primary font-sans-bold'
                                  : isPastDay
                                    ? 'text-gray-300'
                                    : 'text-gray-700'
                              }`}
                            >
                              {d}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              );
            })()}

            <Button
              title={t('services.confirmDate')}
              onPress={handleConfirmDate}
              variant="primary"
              className="w-full"
            />
          </View>
        </View>
      </Modal>

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

          <View className="bg-white rounded-t-3xl px-5 pb-7 pt-4" style={styles.drawerContainer}>
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{t('services.selectStartTime')}</Text>
              <Pressable
                onPress={() => setTimePickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            <View className="flex-row justify-center gap-x-4 mb-6">
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempHour === h }}
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempMinute === m }}
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

              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-1 text-center">
                  {t('services.period')}
                </Text>
                <View className="border border-gray-100 rounded-lg">
                  {PERIODS.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setTempPeriod(p)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempPeriod === p }}
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
              title={t('services.confirmTime')}
              onPress={handleConfirmTime}
              variant="primary"
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
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
    elevation: 10,
  },
});
