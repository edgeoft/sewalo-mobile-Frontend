import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ServiceItem } from '../types';

interface BookingDetails {
  serviceDate: string;
  startTime: string;
  location: string;
  notes: string;
}

interface BookingConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedServices: ServiceItem[];
  totalPrice: number;
  onConfirm: (details: BookingDetails) => void;
}

export default function BookingConfirmationModal({
  visible,
  onClose,
  selectedServices,
  totalPrice,
  onConfirm,
}: BookingConfirmationModalProps) {
  const [serviceDate, setServiceDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleConfirm = () => {
    const newErrors: Record<string, string> = {};

    if (!serviceDate.trim()) {
      newErrors.serviceDate = 'Service date is required';
    }
    if (!startTime.trim()) {
      newErrors.startTime = 'Start time is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onConfirm({
      serviceDate,
      startTime,
      location,
      notes,
    });

    setServiceDate('');
    setStartTime('');
    setLocation('');
    setNotes('');
  };

  const servicesDisplay = selectedServices.map((s) => s.title).join(', ');
  const durationDisplay = selectedServices.length > 0 ? selectedServices[0].durationLabel : '1 Day';

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
              <Text className="text-lg font-sans-extrabold text-gray-950">Confirm Booking Service</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                Please fill the details below to book the service.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
            >
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View className="bg-blue-50/30 border border-blue-200 rounded-lg p-4 flex-row justify-between items-center mb-6">
              <View className="flex-1 mr-3">
                <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-1">
                  selected service(s)
                </Text>
                <Text className="text-xs font-sans-extrabold text-gray-800" numberOfLines={2}>
                  {servicesDisplay || 'Custom Service Package'}
                </Text>
                <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">{durationDisplay}</Text>
              </View>
              <Text className="text-base font-sans-extrabold text-primary">Rs. {totalPrice.toLocaleString()}</Text>
            </View>

            <View className="gap-y-4 mb-8">
              <Input
                label="Service Date *"
                placeholder="Pick A Date (e.g. YYYY-MM-DD)"
                value={serviceDate}
                onChangeText={setServiceDate}
                error={errors.serviceDate}
                rightIcon={<Feather name="calendar" size={16} color="#898f8f" />}
              />

              <Input
                label="Start Time *"
                placeholder="--:-- (e.g. 10:00 AM)"
                value={startTime}
                onChangeText={setStartTime}
                error={errors.startTime}
                rightIcon={<Feather name="clock" size={16} color="#898f8f" />}
              />

              <Input
                label="Location"
                placeholder="Select Location"
                value={location}
                onChangeText={setLocation}
                rightIcon={<Feather name="map-pin" size={16} color="#898f8f" />}
              />

              <Input
                label="Additional Notes"
                placeholder="Any Special Instructions..."
                value={notes}
                onChangeText={setNotes}
                multiline={true}
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            </View>

            <View className="pt-2 pb-6 border-t border-gray-100 gap-y-2.5">
              <Button title="Confirm Booking" variant="primary" size="md" onPress={handleConfirm} />

              <Button
                title="Cancel"
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});
