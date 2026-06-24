import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSnackbar } from '@/components/ui/Snackbar';
import { useErrorDialog } from '@/components/ui/ErrorDialog';

export default function RateAppScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showSnackbar } = useSnackbar();
  const { showError } = useErrorDialog();

  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = () => {
    if (rating === 0) {
      showSnackbar({ message: 'Please choose a star rating (1 to 5 stars) before submitting.', type: 'error' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showError({
        title: 'Feedback Submitted',
        message: 'Thank you for your rating! Your review helps us refine the Sewalo booking experience.',
        actions: [
          {
            text: 'Return',
            onPress: () => {
              setRating(0);
              setFeedbackText('');
              router.back();
            },
          },
        ],
      });
    }, 1200);
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title="Rate the App"
          description="Love using Sewalo? Share your thoughts and help us improve!"
          className="mb-6"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        <View style={cardShadow} className="bg-white border border-gray-200 rounded-xl p-6 mb-4 items-center">
          <View className="h-14 w-14 bg-amber-50 rounded-full items-center justify-center mb-3 border border-amber-100">
            <Feather name="award" size={24} color="#f59e0b" />
          </View>

          <Text className="text-sm font-sans-bold text-gray-900 text-center mb-1">
            How is your experience with Sewalo?
          </Text>
          <Text className="text-xs font-sans-medium text-gray-400 text-center leading-4 mb-5">
            Your review will be shared with our product development team.
          </Text>

          {/* Star Selection Row */}
          <View className="flex-row items-center gap-x-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} className="p-1 active:scale-110">
                <Feather
                  name="star"
                  size={32}
                  color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                  fill={star <= rating ? '#f59e0b' : 'transparent'}
                />
              </Pressable>
            ))}
          </View>

          {/* Custom Text feedback */}
          <Input
            label="Write a Review (Optional)"
            placeholder="Tell us what you like or how we can improve the app..."
            multiline
            numberOfLines={4}
            value={feedbackText}
            onChangeText={setFeedbackText}
            className="mb-5"
            inputClassName="h-24 text-sm py-2"
          />

          <Button
            title="Submit Feedback"
            variant="primary"
            loading={loading}
            onPress={handleSubmitRating}
            className="w-full h-12"
          />
        </View>
      </ContentLayout>
    </View>
  );
}
