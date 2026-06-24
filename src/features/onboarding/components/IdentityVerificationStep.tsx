import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '@/components/ui/Button';
import ContentLayout from '@/components/layout/ContentLayout';
import { useSnackbar } from '@/components/ui/Snackbar';

interface IdentityVerificationStepProps {
  documentImage: string | null;
  setDocumentImage: (uri: string | null) => void;
  onNext: () => void;
  onSkip: () => void;
  role: 'customer' | 'provider';
  stepper?: React.ReactNode;
}

export default function IdentityVerificationStep({
  documentImage,
  setDocumentImage,
  onNext,
  onSkip,
  role,
  stepper,
}: IdentityVerificationStepProps) {
  const { showSnackbar } = useSnackbar();
  const [previewVisible, setPreviewVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const isProvider = role === 'provider';

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar({
          message: 'We need access to your photo library to select a verification document.',
          type: 'error',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocumentImage(result.assets[0].uri);
      }
    } catch {
      showSnackbar({ message: 'Something went wrong while selecting the image.', type: 'error' });
    }
  };

  const handleRemoveImage = () => {
    setDocumentImage(null);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
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
        {/* Info Text */}
        <View style={cardShadow} className="mb-4 p-4 bg-gray-50 rounded-xl">
          <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
            {isProvider
              ? 'Uploading a government-issued ID is optional but highly recommended to verify your account and build trust with customers.'
              : 'Verifying your identity is optional but helps increase trust, secure bookings faster, and unlock special account privileges.'}
          </Text>
        </View>

        {/* Upload Card */}
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
          <Text className="text-sm font-sans-bold text-gray-950 mb-3">Identity Document (Optional)</Text>

          <View className="gap-y-4">
            {documentImage ? (
              <View className="relative h-52 w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <Image source={{ uri: documentImage }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  onPress={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 h-8 w-8 bg-black/60 rounded-full items-center justify-center active:opacity-75"
                >
                  <Feather name="trash-2" size={16} color="#ffffff" />
                </TouchableOpacity>
                <Pressable
                  onPress={() => setPreviewVisible(true)}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 rounded-lg flex-row items-center active:opacity-75"
                >
                  <Feather name="eye" size={12} color="#ffffff" />
                  <Text className="text-[10px] font-sans-bold text-white ml-1">View Image</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                className="h-52 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center active:bg-gray-100"
              >
                <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Feather name="camera" size={20} color="#485aff" />
                </View>
                <Text className="text-sm font-sans-semibold text-gray-800">Upload ID Image</Text>
                <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">JPEG or PNG up to 5MB</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ContentLayout>

      {/* Sticky Bottom Actions Container */}
      <View
        className="bg-white border-t border-gray-100 px-5 pt-2.5 gap-y-1.5"
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
          title="Save"
          onPress={onNext}
          disabled={!documentImage}
          variant="primary"
          size="sm"
          className="w-full bg-primary"
        />
        <Button
          title="Skip this step"
          onPress={onSkip}
          variant="ghost"
          size="sm"
          className="w-full border border-gray-200 active:bg-gray-50"
          textClassName="text-gray-600 font-sans-bold"
        />
      </View>

      {/* Full screen modal preview */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Pressable onPress={() => setPreviewVisible(false)} style={StyleSheet.absoluteFill} />
          <View className="relative w-full max-w-[90%] aspect-[4/3] rounded-2xl bg-white overflow-hidden shadow-2xl">
            {documentImage && <Image source={{ uri: documentImage }} className="w-full h-full" resizeMode="contain" />}
            <Pressable
              onPress={() => setPreviewVisible(false)}
              className="absolute top-4 right-4 h-10 w-10 bg-black/60 rounded-full items-center justify-center active:opacity-75"
            >
              <Feather name="x" size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(7, 17, 31, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
