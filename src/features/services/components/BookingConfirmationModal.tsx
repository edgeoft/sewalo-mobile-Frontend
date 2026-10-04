import React, { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { THEME_COLORS } from '@/constants/colors';
import { getBookingDetailsSchema, type BookingDetailsFormData, type BookingDetails } from '@/schemas/booking';

export type { BookingDetails };

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
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<BookingDetailsFormData>({
    resolver: zodResolver(getBookingDetailsSchema(t)),
    defaultValues: {
      serviceDate: '',
      startTime: '',
      location: '',
      locationLat: 27.700769,
      locationLng: 85.30014,
      locationCity: '',
      notes: '',
    },
    mode: 'onSubmit',
  });

  const serviceDate = useWatch({ control, name: 'serviceDate' }) || '';
  const startTime = useWatch({ control, name: 'startTime' }) || '';
  const location = useWatch({ control, name: 'location' }) || '';
  const locationLat = useWatch({ control, name: 'locationLat' });
  const locationLng = useWatch({ control, name: 'locationLng' });

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
      setError('serviceDate', { message: t('services.pastDateNotAllowed') });
      setDatePickerVisible(false);
      return;
    }
    setValue('serviceDate', formattedDate);
    clearErrors('serviceDate');
    setDatePickerVisible(false);
  };

  const handleConfirmTime = () => {
    const hour = parseInt(tempHour, 10);
    const hour24 = tempPeriod === 'PM' && hour !== 12 ? hour + 12 : tempPeriod === 'AM' && hour === 12 ? 0 : hour;
    const formattedTime = `${String(hour24).padStart(2, '0')}:${tempMinute}`;
    setValue('startTime', formattedTime);
    clearErrors('startTime');
    setTimePickerVisible(false);
  };

  const handleLocationChange = (data: LocationData) => {
    setValue('location', data.address);
    setValue('locationLat', data.lat);
    setValue('locationLng', data.lng);
    setValue('locationCity', data.city || '');
  };

  const onValid = (data: BookingDetailsFormData) => {
    // Provider-specific availability validation needs runtime context — checked after base schema.
    const availErrors = getProviderAvailabilityError(t, provider, data.serviceDate, data.startTime);
    if (availErrors.serviceDateError) {
      setError('serviceDate', { message: availErrors.serviceDateError });
      return;
    }
    if (availErrors.startTimeError) {
      setError('startTime', { message: availErrors.startTimeError });
      return;
    }

    onConfirm({
      serviceDate: data.serviceDate,
      startTime: data.startTime,
      location: data.location || 'Kathmandu Metropolitan City',
      city: data.locationCity || 'Kathmandu',
      lat: data.locationLat,
      lng: data.locationLng,
      notes: data.notes,
    });

    reset({
      serviceDate: '',
      startTime: '',
      location: '',
      locationLat: 27.700769,
      locationLng: 85.30014,
      locationCity: '',
      notes: '',
    });
  };

  const handleConfirm = handleSubmit(onValid);

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
          className="bg-card rounded-t-3xl overflow-hidden"
          style={{ maxHeight: '90%' }}
        >
          <View className="px-6 pt-6 pb-4 border-b border-border flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-sans-extrabold text-foreground">{t('services.confirmBookingService')}</Text>
              <Text className="text-xs font-sans-medium text-muted-foreground mt-0.5">
                {t('services.confirmBookingDesc')}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              className="h-11 w-11 bg-muted rounded-full items-center justify-center active:bg-muted/80"
            >
              <Feather name="x" size={18} color={THEME_COLORS.slate500} />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-3">
                <Text className="text-[10px] font-sans-bold text-muted-foreground uppercase tracking-wider mb-1">
                  {t('services.selectedServices')}
                </Text>
                <Text className="text-xs font-sans-extrabold text-foreground" numberOfLines={2}>
                  {servicesDisplay}
                </Text>
                <Text className="text-[10px] font-sans-medium text-muted-foreground mt-0.5">{durationDisplay}</Text>
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
                    error={errors.serviceDate?.message}
                    rightIcon={<Feather name="calendar" size={16} color={THEME_COLORS.slate400} />}
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
                      error={errors.startTime?.message}
                      rightIcon={<Feather name="clock" size={16} color={THEME_COLORS.slate400} />}
                    />
                  </View>
                </Pressable>
                {workingHours.startTime && workingHours.endTime && !errors.startTime ? (
                  <Text className="text-xs font-sans-medium text-muted-foreground mt-1 ml-0.5">
                    {t('services.providerWorkingHours', {
                      start: workingHours.startTime,
                      end: workingHours.endTime,
                    })}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-xs font-sans-semibold text-foreground mb-1.5 ml-0.5">
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

              <Controller
                control={control}
                name="notes"
                render={({ field: { value, onChange } }) => (
                  <Input
                    label={t('services.additionalNotes')}
                    placeholder={t('services.specialInstructions')}
                    value={value}
                    onChangeText={onChange}
                    multiline={true}
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                  />
                )}
              />
            </View>

            <View className="pt-2 pb-6 border-t border-border gap-y-2.5">
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
                className="border-primary bg-card active:bg-primary/5"
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

          <View className="bg-card rounded-t-3xl px-5 pb-7 pt-4" style={styles.drawerContainer}>
            <View className="w-10 h-1 bg-muted-foreground/30 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-xl font-sans-extrabold">{t('services.selectServiceDate')}</Text>
              <Pressable
                onPress={() => setDatePickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-11 h-11 rounded-full items-center justify-center bg-muted active:opacity-75"
              >
                <Feather name="x" size={16} color={THEME_COLORS.slate500} />
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
                    <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                      {t('services.year')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-border rounded-lg"
                    >
                      {YEARS.map((y) => (
                        <Pressable
                          key={y}
                          onPress={() => setTempYear(y)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: tempYear === y }}
                          className={`min-h-[40px] justify-center items-center ${tempYear === y ? 'bg-primary/10' : ''}`}
                        >
                          <Text
                            className={`font-sans-medium ${tempYear === y ? 'text-primary font-sans-bold' : 'text-foreground'}`}
                          >
                            {y}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <View className="flex-[1.5]">
                    <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                      {t('services.month')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-border rounded-lg"
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
                            className={`min-h-[40px] justify-center items-center ${tempMonth === m ? 'bg-primary/10' : ''} ${
                              isPastMonth ? 'opacity-30' : ''
                            }`}
                          >
                            <Text
                              className={`font-sans-medium ${
                                tempMonth === m
                                  ? 'text-primary font-sans-bold'
                                  : isPastMonth
                                    ? 'text-muted-foreground/50'
                                    : 'text-foreground'
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
                    <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                      {t('services.day')}
                    </Text>
                    <ScrollView
                      style={{ height: 150 }}
                      showsVerticalScrollIndicator={false}
                      className="border border-border rounded-lg"
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
                            className={`min-h-[40px] justify-center items-center ${tempDay === d ? 'bg-primary/10' : ''} ${
                              isPastDay ? 'opacity-30' : ''
                            }`}
                          >
                            <Text
                              className={`font-sans-medium ${
                                tempDay === d
                                  ? 'text-primary font-sans-bold'
                                  : isPastDay
                                    ? 'text-muted-foreground/50'
                                    : 'text-foreground'
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

          <View className="bg-card rounded-t-3xl px-5 pb-7 pt-4" style={styles.drawerContainer}>
            <View className="w-10 h-1 bg-muted-foreground/30 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground text-xl font-sans-extrabold">{t('services.selectStartTime')}</Text>
              <Pressable
                onPress={() => setTimePickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                hitSlop={8}
                className="w-11 h-11 rounded-full items-center justify-center bg-muted active:opacity-75"
              >
                <Feather name="x" size={16} color={THEME_COLORS.slate500} />
              </Pressable>
            </View>

            <View className="flex-row justify-center gap-x-4 mb-6">
              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                  {t('services.hour')}
                </Text>
                <ScrollView
                  style={{ height: 120 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-border rounded-lg"
                >
                  {HOURS.map((h) => (
                    <Pressable
                      key={h}
                      onPress={() => setTempHour(h)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempHour === h }}
                      className={`min-h-[40px] justify-center items-center ${tempHour === h ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempHour === h ? 'text-primary font-sans-bold' : 'text-foreground'}`}
                      >
                        {h}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                  {t('services.minute')}
                </Text>
                <ScrollView
                  style={{ height: 120 }}
                  showsVerticalScrollIndicator={false}
                  className="border border-border rounded-lg"
                >
                  {MINUTES.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setTempMinute(m)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempMinute === m }}
                      className={`min-h-[40px] justify-center items-center ${tempMinute === m ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempMinute === m ? 'text-primary font-sans-bold' : 'text-foreground'}`}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-xs font-sans-semibold text-muted-foreground mb-1 text-center">
                  {t('services.period')}
                </Text>
                <View className="border border-border rounded-lg">
                  {PERIODS.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setTempPeriod(p)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: tempPeriod === p }}
                      className={`min-h-[40px] justify-center items-center ${tempPeriod === p ? 'bg-primary/10' : ''}`}
                    >
                      <Text
                        className={`font-sans-medium ${tempPeriod === p ? 'text-primary font-sans-bold' : 'text-foreground'}`}
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
