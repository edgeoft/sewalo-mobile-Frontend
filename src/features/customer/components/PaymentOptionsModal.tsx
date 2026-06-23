import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { PAYMENT_METHODS, type PaymentMethod } from '@/types';

interface PaymentOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (option: PaymentMethod) => void;
  totalAmount: number;
}

export default function PaymentOptionsModal({ visible, onClose, onConfirm, totalAmount }: PaymentOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<PaymentMethod | null>(null);

  const handleConfirm = () => {
    if (selectedOption) {
      onConfirm(selectedOption);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay} className="flex-1 bg-black/50 justify-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-3xl overflow-hidden pb-8"
        >
          <View className="px-6 pt-6 pb-4 border-b border-gray-100 flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-lg font-sans-extrabold text-gray-950">Payment Method</Text>
              <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                Select how you&apos;d like to pay Rs. {totalAmount.toLocaleString()}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-8 w-8 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
            >
              <Feather name="x" size={18} color="#64748b" />
            </Pressable>
          </View>

          <View className="px-6 py-6 gap-y-4">
            <Pressable
              onPress={() => setSelectedOption(PAYMENT_METHODS.Cash)}
              className={`flex-row items-center p-4 border rounded-xl ${
                selectedOption === PAYMENT_METHODS.Cash ? 'border-primary bg-blue-50/30' : 'border-gray-200 bg-white'
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full border items-center justify-center mr-3 ${
                  selectedOption === PAYMENT_METHODS.Cash ? 'border-primary' : 'border-gray-300'
                }`}
              >
                {selectedOption === PAYMENT_METHODS.Cash && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Feather
                name="dollar-sign"
                size={20}
                color={selectedOption === PAYMENT_METHODS.Cash ? '#0f172a' : '#64748b'}
                className="mr-3"
              />
              <Text
                className={`text-base font-sans-semibold ${selectedOption === PAYMENT_METHODS.Cash ? 'text-gray-950' : 'text-gray-600'}`}
              >
                Pay By Cash
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setSelectedOption(PAYMENT_METHODS.Esewa)}
              className={`flex-row items-center p-4 border rounded-xl ${
                selectedOption === PAYMENT_METHODS.Esewa ? 'border-primary bg-blue-50/30' : 'border-gray-200 bg-white'
              }`}
            >
              <View
                className={`h-5 w-5 rounded-full border items-center justify-center mr-3 ${
                  selectedOption === PAYMENT_METHODS.Esewa ? 'border-primary' : 'border-gray-300'
                }`}
              >
                {selectedOption === PAYMENT_METHODS.Esewa && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
              <Feather
                name="smartphone"
                size={20}
                color={selectedOption === PAYMENT_METHODS.Esewa ? '#0f172a' : '#64748b'}
                className="mr-3"
              />
              <Text
                className={`text-base font-sans-semibold ${selectedOption === PAYMENT_METHODS.Esewa ? 'text-gray-950' : 'text-gray-600'}`}
              >
                Pay By Esewa
              </Text>
            </Pressable>
          </View>

          <View className="px-6 pt-2 pb-6 gap-y-2.5">
            <Button title="Proceed" variant="primary" size="md" onPress={handleConfirm} disabled={!selectedOption} />
            <Button
              title="Cancel"
              variant="outline"
              size="md"
              onPress={onClose}
              className="border-primary bg-white active:bg-blue-50/30"
              textClassName="text-primary font-sans-semibold"
            />
          </View>
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
