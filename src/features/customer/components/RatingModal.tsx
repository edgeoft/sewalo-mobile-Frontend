import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useCreateRating, useUpdateRating } from '@/api';
import type { Rating } from '@/types';
import { useSnackbar } from '@/components/ui/Snackbar';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  existingRating?: Rating | null;
}

export default function RatingModal({
  visible,
  onClose,
  bookingId,
  providerId,
  providerName,
  serviceName,
  existingRating,
}: RatingModalProps) {
  const [rating, setRating] = useState(existingRating?.rate || 0);
  const [review, setReview] = useState(existingRating?.review || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const { height } = useWindowDimensions();
  const { showSnackbar } = useSnackbar();
  const createRating = useCreateRating();
  const updateRating = useUpdateRating();

  const isEditing = !!existingRating;
  const isPending = createRating.isPending || updateRating.isPending;
  const modalKey = existingRating?.id || 'new';

  const handleSubmit = () => {
    if (rating === 0) {
      showSnackbar({ message: 'Please select a star rating.', type: 'info' });
      return;
    }
    if (review.trim().length < 10) {
      showSnackbar({ message: 'Please write at least 10 characters.', type: 'info' });
      return;
    }

    if (isEditing) {
      updateRating.mutate(
        { id: existingRating!.id, rate: rating, review: review.trim(), provider_id: providerId, booking_id: bookingId },
        {
          onSuccess: () => {
            showSnackbar({ message: 'Your review has been updated successfully.', type: 'success' });
            onClose();
          },
          onError: (error) => showSnackbar({ message: error.message || 'Failed to update review.', type: 'error' }),
        },
      );
    } else {
      createRating.mutate(
        { rate: rating, review: review.trim(), provider_id: providerId, booking_id: bookingId },
        {
          onSuccess: () => {
            showSnackbar({ message: 'Your review has been submitted successfully.', type: 'success' });
            onClose();
          },
          onError: (error) => showSnackbar({ message: error.message || 'Failed to submit review.', type: 'error' }),
        },
      );
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal key={modalKey} animationType="slide" transparent visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.drawerContainer, { maxHeight: height * 0.8 }]} className="bg-white px-5 pb-8 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">
                {isEditing ? 'Edit Review' : 'Write a Review'}
              </Text>
              <Pressable
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
              >
                <Feather name="x" size={20} color="#64748b" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-sm font-sans-medium mb-5">
              Share your experience with {providerName}&apos;s service
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              <View className="bg-gray-50 rounded-lg border border-gray-200 p-3 mb-5">
                <Text className="text-xs font-sans-medium text-gray-500 mb-0.5">Service</Text>
                <Text className="text-sm font-sans-bold text-gray-900">{serviceName}</Text>
                <Text className="text-xs font-sans-medium text-gray-600">{providerName}</Text>
              </View>

              <Text className="text-sm font-sans-bold text-gray-900 mb-3">
                Rating <Text className="text-red-500">*</Text>
              </Text>
              <View className="flex-row items-center gap-1 mb-5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    onPressIn={() => setHoveredRating(star)}
                    onPressOut={() => setHoveredRating(0)}
                    className="p-1"
                  >
                    <Feather name="star" size={32} color={(hoveredRating || rating) >= star ? '#f59e0b' : '#d1d5db'} />
                  </Pressable>
                ))}
                {rating > 0 && (
                  <Text className="ml-2 text-sm font-sans-medium text-gray-700">
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </Text>
                )}
              </View>

              <Text className="text-sm font-sans-bold text-gray-900 mb-2">
                Your Review <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="Share details of your experience..."
                placeholderTextColor="#9ca3af"
                multiline
                value={review}
                onChangeText={setReview}
                className="border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 font-sans-medium min-h-[120px]"
                textAlignVertical="top"
                style={{ includeFontPadding: false }}
              />
              <Text className="text-xs font-sans-medium text-gray-500 mt-1.5 ml-1">
                {review.length} characters (minimum 10)
              </Text>

              <View className="flex-row gap-3 mt-6">
                <Pressable
                  onPress={handleClose}
                  className="flex-1 py-3.5 rounded-lg border border-gray-300 items-center active:opacity-70"
                >
                  <Text className="text-sm font-sans-semibold text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={isPending || rating === 0 || review.trim().length < 10}
                  className="flex-1 py-3.5 rounded-lg bg-primary items-center active:opacity-90 disabled:opacity-50"
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className="text-sm font-sans-bold text-white">
                      {isEditing ? 'Update Review' : 'Submit Review'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    elevation: 24,
  },
});
