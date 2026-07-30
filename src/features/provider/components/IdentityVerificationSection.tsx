import React, { useState } from 'react';
import { View, Text, Pressable, Image, Modal, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useAuth } from '@/providers/AuthProvider';
import { useUpdateProfile, useUploadFile } from '@/api';
import { getImageUrl } from '@/features/auth/utils/image';

interface IdentityVerificationSectionProps {
  onSaved?: () => void;
}

export default function IdentityVerificationSection({ onSaved }: IdentityVerificationSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const [documentUri, setDocumentUri] = useState<string | null>(getImageUrl(user?.document) || null);
  const [newLocalUri, setNewLocalUri] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();
  const isLoading = isUpdating || isUploading;

  const currentDisplayUri = newLocalUri || documentUri;
  const isVerified = Boolean(user?.profile_verified_at || user?.status === 'verified');
  const isDocumentUploaded = Boolean(user?.document);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showSnackbar({ message: t('onboarding.verificationPermissionError'), type: 'error' });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewLocalUri(result.assets[0].uri);
      }
    } catch {
      showSnackbar({ message: t('onboarding.verificationPickerError'), type: 'error' });
    }
  };

  const handleSave = () => {
    if (!newLocalUri) return;

    uploadFile(
      { uri: newLocalUri, folder: 'document' },
      {
        onSuccess: (uploadRes) => {
          updateProfile(
            { document: uploadRes.path },
            {
              onSuccess: () => {
                setDocumentUri(getImageUrl(uploadRes.path) || null);
                setNewLocalUri(null);
                showSnackbar({ message: 'Identity document uploaded successfully', type: 'success' });
                onSaved?.();
              },
              onError: (err) => {
                showSnackbar({
                  message: err instanceof Error ? err.message : 'Failed to update document profile',
                  type: 'error',
                });
              },
            },
          );
        },
        onError: (err) => {
          showSnackbar({
            message: err instanceof Error ? err.message : 'Failed to upload document',
            type: 'error',
          });
        },
      },
    );
  };

  const handleRemove = () => {
    if (newLocalUri) {
      setNewLocalUri(null);
    } else if (documentUri) {
      updateProfile(
        { document: null },
        {
          onSuccess: () => {
            setDocumentUri(null);
            showSnackbar({ message: 'Identity document removed', type: 'info' });
            onSaved?.();
          },
        },
      );
    }
  };

  return (
    <View
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 0,
      }}
      className="rounded-xl border border-gray-200 bg-white p-4 mb-6"
    >
      {/* Header with Status Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1 mr-2">
          <Text className="text-base font-sans-bold text-gray-950">Identity Verification</Text>
          <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">
            Government-issued ID for account verification and trusted badge.
          </Text>
        </View>

        {isVerified ? (
          <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-row items-center">
            <Feather name="shield" size={12} color="#10b981" />
            <Text className="text-[10px] font-sans-bold text-emerald-700 ml-1">Verified</Text>
          </View>
        ) : isDocumentUploaded ? (
          <View className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex-row items-center">
            <Feather name="clock" size={12} color="#f59e0b" />
            <Text className="text-[10px] font-sans-bold text-amber-700 ml-1">Pending Review</Text>
          </View>
        ) : (
          <View className="bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full flex-row items-center">
            <Feather name="alert-circle" size={12} color="#64748b" />
            <Text className="text-[10px] font-sans-bold text-gray-600 ml-1">Unverified</Text>
          </View>
        )}
      </View>

      {/* Document Image Container / Upload trigger */}
      {currentDisplayUri ? (
        <View className="relative h-48 w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden mb-3">
          <Image source={{ uri: currentDisplayUri }} className="w-full h-full" resizeMode="cover" />

          {/* Remove / Replace Button */}
          {!isVerified && (
            <TouchableOpacity
              onPress={handleRemove}
              disabled={isLoading}
              className="absolute top-2.5 right-2.5 h-8 w-8 bg-black/60 rounded-full items-center justify-center active:opacity-75"
            >
              <Feather name="trash-2" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}

          {/* Preview Button */}
          <Pressable
            onPress={() => setPreviewVisible(true)}
            className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 rounded-lg flex-row items-center active:opacity-75"
          >
            <Feather name="eye" size={12} color="#ffffff" />
            <Text className="text-[10px] font-sans-bold text-white ml-1">View Document</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={handlePickImage}
          disabled={isLoading}
          className="h-44 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center mb-3 active:bg-gray-100"
        >
          <View className="h-10 w-10 rounded-full bg-primary/10 items-center justify-center mb-2">
            <Feather name="camera" size={18} color="#485aff" />
          </View>
          <Text className="text-xs font-sans-semibold text-gray-800">Upload Government ID Image</Text>
          <Text className="text-[10px] font-sans-medium text-gray-400 mt-0.5">Citizenship, Passport, or License</Text>
        </Pressable>
      )}

      {/* Save Button for new local image */}
      {newLocalUri && (
        <Button title="Save Identity Document" onPress={handleSave} loading={isLoading} className="bg-primary" />
      )}

      {/* Modal Preview */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Pressable onPress={() => setPreviewVisible(false)} style={StyleSheet.absoluteFill} />
          <View className="relative w-full max-w-[90%] aspect-[4/3] rounded-2xl bg-white overflow-hidden shadow-2xl">
            {currentDisplayUri && (
              <Image source={{ uri: currentDisplayUri }} className="w-full h-full" resizeMode="contain" />
            )}
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
