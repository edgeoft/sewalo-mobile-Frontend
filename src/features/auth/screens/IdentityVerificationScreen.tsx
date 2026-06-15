import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';

interface IdentityVerificationScreenProps {
  role: 'customer' | 'provider';
}

export default function IdentityVerificationScreen({ role }: IdentityVerificationScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isProvider = role === 'provider';
  const pageTitle = isProvider ? 'Verification Documents' : 'Identity Verification';
  const pageDescription = isProvider
    ? 'Upload government ID to get verified partner status and build trust with clients.'
    : 'Verify your identity to increase trust, secure bookings, and unlock account features.';

  // Local mock state for demonstration
  const [status, setStatus] = useState<'empty' | 'pending' | 'verified' | 'rejected'>('empty');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>(
    'The uploaded image was too blurry. Please ensure all text on your ID card is clearly readable.',
  );

  const handlePickImage = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select a verification document.');
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
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while selecting the image.');
    }
  };

  const handleRemoveImage = () => {
    setDocumentImage(null);
  };

  const handleSubmit = () => {
    if (!documentImage) {
      Alert.alert('Incomplete Upload', 'Please upload your ID document image.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('pending');
      Alert.alert('Submitted', 'Your document has been submitted for verification review.');
    }, 1200);
  };

  const handleRequestChange = () => {
    const confirmMessage =
      status === 'verified'
        ? 'Changing your verification document will temporarily revoke your Verified Badge until the new document is reviewed and approved. Do you want to proceed?'
        : 'Are you sure you want to cancel this verification request and upload a new document?';

    Alert.alert('Request Document Change', confirmMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Proceed',
        style: 'destructive',
        onPress: () => {
          setStatus('empty');
        },
      },
    ]);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  };

  // Status helper text mapping (borderless, with soft backgrounds and a subtle shadow)
  const renderStatusInfoText = () => {
    switch (status) {
      case 'empty':
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
      case 'pending':
        return (
          <View style={cardShadow} className="mb-6 p-4 bg-amber-50 rounded-xl flex-row items-start">
            <Feather name="clock" size={16} color="#d97706" style={{ marginTop: 2, marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-amber-900">Awaiting Approval</Text>
              <Text className="text-[11px] font-sans-medium text-amber-700 mt-0.5 leading-normal">
                We are currently reviewing your document. This process usually takes 1-2 business days. We will notify
                you once approved.
              </Text>
            </View>
          </View>
        );
      case 'verified':
        return (
          <View style={cardShadow} className="mb-6 p-4 bg-emerald-50 rounded-xl flex-row items-start">
            <Feather name="check-circle" size={16} color="#059669" style={{ marginTop: 2, marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-emerald-900">Verified</Text>
              <Text className="text-[11px] font-sans-medium text-emerald-700 mt-0.5 leading-normal">
                Your document has been approved and your profile is now verified.
              </Text>
            </View>
          </View>
        );
      case 'rejected':
        return (
          <View style={cardShadow} className="mb-6 p-4 bg-rose-50 rounded-xl flex-row items-start">
            <Feather name="alert-triangle" size={16} color="#dc2626" style={{ marginTop: 2, marginRight: 8 }} />
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-rose-900">Verification Rejected</Text>
              <Text className="text-[11px] font-sans-semibold text-rose-700 mt-0.5 leading-normal">
                Reason: {rejectionReason}
              </Text>
            </View>
          </View>
        );
      default:
        return null;
    }
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
          <Text className="text-sm font-sans-bold text-gray-950 mb-3.5">Identity Document</Text>

          <View className="gap-y-4">
            <View>
              {documentImage || status !== 'empty' ? (
                <View className="relative h-56 w-full rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                  <Image
                    source={{
                      uri: documentImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=600',
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {(status === 'empty' || status === 'rejected') && (
                    <TouchableOpacity
                      onPress={handleRemoveImage}
                      className="absolute top-2.5 right-2.5 h-8 w-8 bg-black/60 rounded-full items-center justify-center active:opacity-75"
                    >
                      <Feather name="trash-2" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  )}
                  <Pressable
                    onPress={() =>
                      setPreviewImage(
                        documentImage || 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?q=80&w=600',
                      )
                    }
                    className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-black/60 rounded-lg flex-row items-center active:opacity-75"
                  >
                    <Feather name="eye" size={12} color="#ffffff" />
                    <Text className="text-[10px] font-sans-bold text-white ml-1">View Image</Text>
                  </Pressable>
                  {status === 'verified' && (
                    <View className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-emerald-500 rounded-full flex-row items-center">
                      <Feather name="check" size={12} color="#ffffff" />
                      <Text className="text-[9px] font-sans-extrabold text-white ml-0.5 uppercase">Approved</Text>
                    </View>
                  )}
                  {status === 'rejected' && (
                    <View className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-rose-500 rounded-full flex-row items-center">
                      <Feather name="x" size={12} color="#ffffff" />
                      <Text className="text-[9px] font-sans-extrabold text-white ml-0.5 uppercase">Rejected</Text>
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
                  <Text className="text-sm font-sans-semibold text-gray-800">Upload ID Image</Text>
                  <Text className="text-xs font-sans-medium text-gray-400 mt-0.5">JPEG or PNG up to 5MB</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* 3. ACTION BUTTONS */}
        {status === 'empty' || status === 'rejected' ? (
          <Button
            title={status === 'rejected' ? 'Re-submit for Verification' : 'Submit for Verification'}
            loading={loading}
            disabled={!documentImage}
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
