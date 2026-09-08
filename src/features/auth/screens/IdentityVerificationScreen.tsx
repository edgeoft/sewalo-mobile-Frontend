import React, { useState } from 'react';
import { Image, Modal, Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import DocumentGuidelinesVisual from '@/components/illustrations/DocumentGuidelinesVisual';

import { THEME_COLORS } from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { useUploadFile, useUpdateProfile } from '@/api';
import { extractErrorMessage } from '@/api/client/query/errorHandler';
import { USER_ROLES } from '@/types';
import { getImageUrl } from '@/utils/image';
import { useSnackbar } from '@/components/ui/Snackbar';

interface IdentityVerificationScreenProps {
  role: 'customer' | 'provider';
}

export default function IdentityVerificationScreen({ role }: IdentityVerificationScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const isProvider = role === USER_ROLES.Provider;
  const pageTitle = isProvider ? t('components.verificationDocuments') : t('components.identityVerification');
  const pageDescription = isProvider ? t('components.verificationDocsDesc') : t('components.identityVerificationDesc');

  const { showSnackbar } = useSnackbar();

  const { isRejected, isVerified, isCompleted, getMessage } = useVerificationStatus();

  const serverDocumentUrl = getImageUrl(user?.document) || null;
  const [documentImage, setDocumentImage] = useState<string | null>(serverDocumentUrl);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();

  const loading = isUploading || isUpdatingProfile;
  const isDirty = documentImage !== serverDocumentUrl;

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
        mediaTypes: 'images',
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
      showSnackbar({ message: t('components.documentRequired'), type: 'error' });
      return;
    }

    try {
      let finalDocUrl = documentImage;

      // Only upload if it's a new local image asset
      if (!documentImage.startsWith('http')) {
        const uploadRes = await uploadFile({ uri: documentImage, folder: 'documents' });
        finalDocUrl = uploadRes.url;
      }

      await updateProfile({ document: finalDocUrl });

      showSnackbar({ message: t('components.documentSubmitted'), type: 'success' });
      router.back();
    } catch (error: unknown) {
      showSnackbar({ message: extractErrorMessage(error) || 'Failed to submit document', type: 'error' });
    }
  };

  const cardShadow = {
    shadowColor: THEME_COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
    borderRadius: 10,
  };

  const renderStatusInfoBanner = () => {
    if (isCompleted) {
      const msg =
        getMessage() ||
        t('components.awaitingApprovalDesc') ||
        'Your document is under review. Please wait for approval.';
      return (
        <View
          style={cardShadow}
          className="mb-5 p-4 bg-amber-50 border border-amber-200/80 rounded-lg flex-row items-start"
        >
          <Feather name="clock" size={16} color={THEME_COLORS.amberStar} style={{ marginTop: 2, marginRight: 10 }} />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-amber-950">{t('components.awaitingApproval')}</Text>
            {!!msg && <Text className="text-[11px] font-sans-medium text-amber-900/90 mt-0.5 leading-snug">{msg}</Text>}
          </View>
        </View>
      );
    }

    if (isVerified) {
      const msg = getMessage() || t('components.verifiedDesc') || 'Your identity has been verified.';
      return (
        <View
          style={cardShadow}
          className="mb-5 p-4 bg-emerald-50 border border-emerald-200/80 rounded-lg flex-row items-start"
        >
          <Feather
            name="check-circle"
            size={16}
            color={THEME_COLORS.emeraldSuccess}
            style={{ marginTop: 2, marginRight: 10 }}
          />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-emerald-950">{t('components.verified')}</Text>
            {!!msg && (
              <Text className="text-[11px] font-sans-medium text-emerald-900/90 mt-0.5 leading-snug">{msg}</Text>
            )}
          </View>
        </View>
      );
    }

    if (isRejected) {
      const msg = getMessage() || t('components.rejectedDesc') || 'Your verification was rejected.';
      return (
        <View
          style={cardShadow}
          className="mb-5 p-4 bg-rose-50 border border-rose-200/80 rounded-lg flex-row items-start"
        >
          <Feather
            name="alert-triangle"
            size={16}
            color={THEME_COLORS.dangerRed}
            style={{ marginTop: 2, marginRight: 10 }}
          />
          <View className="flex-1">
            <Text className="text-xs font-sans-bold text-rose-950">{t('components.verificationRejected')}</Text>
            <Text className="text-[11px] font-sans-semibold text-rose-900/90 mt-0.5 leading-snug">
              {t('common.reason')}: {msg}
            </Text>
          </View>
        </View>
      );
    }

    // Empty or pending initial state
    return (
      <View
        style={cardShadow}
        className="mb-5 p-4 bg-surface-indigo-subtle border border-indigo-100/80 rounded-lg flex-row items-start"
      >
        <Feather name="shield" size={16} color={THEME_COLORS.primary} style={{ marginTop: 2, marginRight: 10 }} />
        <View className="flex-1">
          <Text className="text-xs font-sans-bold text-gray-900">
            {isProvider ? t('components.verificationDocuments') : t('components.identityVerification')}
          </Text>
          <Text className="text-[11px] font-sans-medium text-gray-600 mt-0.5 leading-snug">
            {isProvider
              ? 'To receive customer bookings, please upload your verification document. Verification helps keep our marketplace safe.'
              : 'Verifying your identity builds trust with service providers, unlocks referral rewards, and secures your bookings faster.'}
          </Text>
        </View>
      </View>
    );
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
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* 1. Status Banner */}
        {renderStatusInfoBanner()}

        {/* 2. Document Card */}
        <View style={cardShadow} className="rounded-lg border border-gray-200 bg-white p-4 mb-5">
          <View className="flex-row items-center mb-3.5">
            <Feather name="credit-card" size={15} color={THEME_COLORS.primary} />
            <Text className="text-sm font-sans-bold text-gray-950 ml-2">{t('services.identityDocument')}</Text>
          </View>

          {documentImage ? (
            <View>
              <View
                style={{ borderRadius: 10 }}
                className="relative h-56 w-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden"
              >
                <Image source={{ uri: documentImage }} className="w-full h-full" resizeMode="cover" />

                {/* Full screen view action */}
                <Pressable
                  onPress={() => setPreviewImage(documentImage)}
                  style={{ borderRadius: 8 }}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 rounded-lg flex-row items-center active:opacity-75"
                  accessibilityRole="button"
                  accessibilityLabel={t('services.viewImage')}
                >
                  <Feather name="eye" size={12} color={THEME_COLORS.primaryForeground} accessible={false} />
                  <Text className="text-[10px] font-sans-bold text-white ml-1">{t('services.viewImage')}</Text>
                </Pressable>
              </View>

              {/* Quick actions beneath preview */}
              <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <Pressable
                  onPress={handlePickImage}
                  accessibilityRole="button"
                  accessibilityLabel={t('components.changeDocument')}
                  style={{ borderRadius: 10 }}
                  className="flex-1 h-10 flex-row items-center justify-center px-3 rounded-lg border border-gray-200 bg-gray-50 active:bg-gray-100"
                >
                  <Feather name="refresh-cw" size={13} color={THEME_COLORS.primary} style={{ marginRight: 6 }} />
                  <Text className="text-xs font-sans-bold text-gray-800">{t('components.changeDocument')}</Text>
                </Pressable>

                <Pressable
                  onPress={handleRemoveImage}
                  accessibilityRole="button"
                  accessibilityLabel={t('components.removeDocument')}
                  style={{ borderRadius: 10 }}
                  className="h-10 px-3.5 flex-row items-center justify-center rounded-lg border border-rose-200 bg-rose-50/70 active:bg-rose-100/70"
                >
                  <Feather name="trash-2" size={13} color={THEME_COLORS.dangerRed} style={{ marginRight: 6 }} />
                  <Text className="text-xs font-sans-bold text-rose-700">{t('components.removeDocument')}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handlePickImage}
              style={{ borderRadius: 10 }}
              className="h-56 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 items-center justify-center active:bg-gray-100 p-4"
              accessibilityRole="button"
            >
              <View
                style={{ borderRadius: 10 }}
                className="h-12 w-12 rounded-lg bg-surface-indigo-subtle items-center justify-center mb-2.5"
                importantForAccessibility="no"
                accessibilityElementsHidden
              >
                <Feather name="camera" size={20} color={THEME_COLORS.primary} />
              </View>
              <Text className="text-sm font-sans-bold text-gray-900">{t('services.uploadIdImage')}</Text>
              <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">
                Tap here to select photo from gallery
              </Text>
              <Text className="text-[10px] font-sans-medium text-gray-400 mt-1">{t('services.imageUploadFormat')}</Text>
            </Pressable>
          )}
        </View>

        {/* 3. Document Guidelines & Requirements Section */}
        <DocumentGuidelinesVisual />

        {/* 4. Bottom Action Button */}
        {documentImage && isDirty ? (
          <Button
            title={isRejected ? t('components.reSubmitVerification') : t('components.submitVerification')}
            loading={loading}
            disabled={loading}
            onPress={handleSubmit}
            variant="primary"
            className="w-full"
            leftIcon={<Feather name="check" size={14} color={THEME_COLORS.primaryForeground} />}
          />
        ) : !documentImage ? (
          <Button
            title={t('services.uploadIdImage')}
            onPress={handlePickImage}
            variant="primary"
            className="w-full"
            leftIcon={<Feather name="camera" size={14} color={THEME_COLORS.primaryForeground} />}
          />
        ) : null}
      </ContentLayout>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.modalBackground}>
          <Pressable
            onPress={() => setPreviewImage(null)}
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
          />
          <View
            style={{ borderRadius: 10 }}
            className="relative w-full max-w-[92%] aspect-[4/3] rounded-lg bg-white overflow-hidden shadow-2xl"
          >
            {previewImage && <Image source={{ uri: previewImage }} className="w-full h-full" resizeMode="contain" />}
            <Pressable
              onPress={() => setPreviewImage(null)}
              style={{ borderRadius: 8 }}
              className="absolute top-3.5 right-3.5 h-9 w-9 bg-black/60 rounded-lg items-center justify-center active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Feather name="x" size={18} color={THEME_COLORS.primaryForeground} accessible={false} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
