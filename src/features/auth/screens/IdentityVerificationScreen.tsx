import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';

import { useAuth } from '@/providers/AuthProvider';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { useUploadFile, useUpdateProfile } from '@/api';
import { getImageUrl } from '@/features/auth/utils/image';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';
import { useTranslation } from 'react-i18next';

interface IdentityVerificationScreenProps {
  role: 'customer' | 'provider';
}

export default function IdentityVerificationScreen({ role }: IdentityVerificationScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const isProvider = role === 'provider';
  const pageTitle = isProvider ? t('components.verificationDocuments') : t('components.identityVerification');
  const pageDescription = isProvider ? t('components.verificationDocsDesc') : t('components.identityVerificationDesc');

  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const { status, isRejected, isVerified, isCompleted, hasMissingId, getMessage } = useVerificationStatus();

  const [documentImage, setDocumentImage] = useState<string | null>(getImageUrl(user?.document) || null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const loading = isUploading || isUpdatingProfile;

  // The UI renders 'empty' mode if the user doesn't have a document or their status is 'pending'
  const isFormEmptyMode = hasMissingId || status === 'pending' || status === null;

  const handlePickImage = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted') {
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

  const handleSubmit = async () => {
    if (!documentImage) {
      showSnackbar({ message: 'Please upload your ID document image.', type: 'error' });
      return;
    }

    try {
      const uploadRes = await uploadFile({ uri: documentImage, folder: 'documents' });
      await updateProfile({ document: uploadRes.url });

      showSnackbar({ message: 'Your document has been submitted for verification review.', type: 'success' });
      router.back();
    } catch (error: any) {
      showSnackbar({ message: error.message || 'Failed to submit document', type: 'error' });
    }
  };

  const handleRequestChange = () => {
    const confirmMessage =
      status === 'verified'
        ? 'Changing your verification document will temporarily revoke your Verified Badge until the new document is reviewed and approved. Do you want to proceed?'
        : 'Are you sure you want to cancel this verification request and upload a new document?';

    showError({
      title: 'Request Document Change',
      message: confirmMessage,
      actions: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () => {
            setDocumentImage(null);
          },
        },
      ],
    });
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 0,
  };

  // Status helper text mapping (borderless, with soft backgrounds and a subtle shadow)
  const renderStatusInfoText = () => {
    if (isFormEmptyMode) {
      if (isProvider) {
        return (
          <View style={cardShadow} className="mb-6 p-4 bg-blue-50 rounded-xl">
            <Text className="text-xs font-sans-medium text-blue-800 leading-normal">
              To receive customer bookings, please complete your partner registration by uploading your verification
              document. Verification helps keep our marketplace safe.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={cardShadow} className="mb-6 p-4 bg-gray-50 rounded-xl">
            <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
              Verifying your identity is optional but highly recommended to build trust with providers and secure
              bookings faster.
            </Text>
          </View>
        );
      }
    }

    if (isCompleted) {
      return (
        <View style={cardShadow} className="mb-6 p-4 bg-amber-50 rounded-xl flex-row items-start">
          <Feather name="clock" size={16} color="#d97706" style={{ marginTop: 2, marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-amber-900">{t('components.awaitingApproval')}</Text>
            <Text className="text-[11px] font-sans-medium text-amber-700 mt-0.5 leading-normal">{getMessage()}</Text>
          </View>
        </View>
      );
    }

    if (isVerified) {
      return (
        <View style={cardShadow} className="mb-6 p-4 bg-emerald-50 rounded-xl flex-row items-start">
          <Feather name="check-circle" size={16} color="#059669" style={{ marginTop: 2, marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-emerald-900">{t('components.verified')}</Text>
            <Text className="text-[11px] font-sans-medium text-emerald-700 mt-0.5 leading-normal">{getMessage()}</Text>
          </View>
        </View>
      );
    }

    if (isRejected) {
      return (
        <View style={cardShadow} className="mb-6 p-4 bg-rose-50 rounded-xl flex-row items-start">
          <Feather name="alert-triangle" size={16} color="#dc2626" style={{ marginTop: 2, marginRight: 8 }} />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-rose-900">{t('components.verificationRejected')}</Text>
            <Text className="text-[11px] font-sans-semibold text-rose-700 mt-0.5 leading-normal">
              {t('common.reason')}: {getMessage()}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={pageTitle}
          description={pageDescription}
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* 1. STATUS INFORMATION CONTAINER (RENDERED INDEPENDENTLY AT THE TOP) */}
        {renderStatusInfoText()}

        {/* 2. MAIN DOCUMENT CARD SECTION */}
        <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-4 mb-6">
          <Text className="text-sm font-sans-bold text-gray-950 mb-3.5">{t('services.identityDocument')}</Text>

          <View className="gap-y-4">
            <View>
              {documentImage ? (
                <View className="relative h-56 w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <Image
                    source={{
                      uri: documentImage,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {(isFormEmptyMode || isRejected) && (
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      className="absolute top-2.5 right-2.5 h-8 w-8 bg-black/60 rounded-full items-center justify-center active:opacity-75"
                    >
                      <Feather name="trash-2" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                  <Pressable
                    onPress={() => setPreviewImage(documentImage)}
                    className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 rounded-lg flex-row items-center active:opacity-75"
                  >
                    <Feather name="eye" size={12} color="#ffffff" />
                    <Text className="text-[10px] font-sans-bold text-white ml-1">{t('services.viewImage')}</Text>
                  </Pressable>
                  {isVerified && (
                    <View className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-emerald-500 rounded-full flex-row items-center">
                      <Feather name="check" size={12} color="#ffffff" />
                      <Text className="text-[9px] font-sans-extrabold text-white ml-0.5 uppercase">
                        {t('components.approved')}
                      </Text>
                    </View>
                  )}
                  {isRejected && (
                    <View className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-rose-500 rounded-full flex-row items-center">
                      <Feather name="x" size={12} color="#ffffff" />
                      <Text className="text-[9px] font-sans-extrabold text-white ml-0.5 uppercase">
                        {t('components.rejected')}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Pressable
                  onPress={handlePickImage}
                  className="h-56 w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center active:bg-gray-100"
                >
                  <View className="h-12 w-12 rounded-full bg-primary/10 items-center justify-center mb-2">
                    <Feather name="camera" size={20} color="#485aff" />
                  </View>
                  <Text className="text-sm font-sans-semibold text-gray-800">{t('services.uploadIdImage')}</Text>
                  <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">
                    {t('services.imageUploadFormat')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* 3. ACTION BUTTONS */}
        {isFormEmptyMode || isRejected ? (
          <Button
            title={isRejected ? t('components.reSubmitVerification') : t('components.submitVerification')}
            loading={loading}
            disabled={!documentImage || loading}
            onPress={handleSubmit}
            className="w-full bg-primary"
          />
        ) : (
          <View className="gap-y-3">
            <Button
              title="Request Change"
              variant="primary"
              className="w-full bg-primary"
              onPress={handleRequestChange}
            />
          </View>
        )}
      </ContentLayout>

      {/* FULL SCREEN MODAL IMAGE VIEWER */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalBackground}>
          <Pressable onPress={() => setPreviewImage(null)} style={StyleSheet.absoluteFill} />
          <View className="relative w-full max-w-[90%] aspect-[4/3] rounded-2xl bg-white overflow-hidden shadow-2xl">
            {previewImage && <Image source={{ uri: previewImage }} className="w-full h-full" resizeMode="contain" />}
            <Pressable
              onPress={() => setPreviewImage(null)}
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
