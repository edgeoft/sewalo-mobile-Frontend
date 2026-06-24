import React from 'react';
import { View, Text, Alert, Linking, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PhoneNumberField from '@/features/auth/components/PhoneNumberField';

import { useSubmitContact } from '@/api';

interface SupportTicketFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutate: submitContact, isPending } = useSubmitContact();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      subject: '',
      message: '',
    },
  });

  const watchSubject = useWatch({ control, name: 'subject' }) || '';
  const watchMessage = useWatch({ control, name: 'message' }) || '';

  const handleCallSupport = () => {
    Alert.alert(
      'Call Support',
      'Select a support number to call:',
      [
        {
          text: 'NTC (9744985161)',
          onPress: () => {
            Linking.openURL('tel:+9779744985161').catch(() => {
              Alert.alert('Error', 'Call function is not supported on this device.');
            });
          },
        },
        {
          text: 'Ncell (9713969243)',
          onPress: () => {
            Linking.openURL('tel:+9779713969243').catch(() => {
              Alert.alert('Error', 'Call function is not supported on this device.');
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Connecting you to a Sewalo support agent...', [
      { text: 'Wait', style: 'default' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleTicketSubmit = (data: SupportTicketFormData) => {
    submitContact(
      {
        name: data.fullName,
        email: data.email,
        phone_no: data.phoneNumber,
        subject: data.subject,
        message: data.message,
      },
      {
        onSuccess: (res) => {
          Alert.alert(
            'Message Sent',
            'Thank you, ' +
              data.fullName +
              '! Your message has been received. Ticket ID: #SWL-' +
              (res.data?.id || Math.floor(100000 + Math.random() * 900000)) +
              '.\n\nOur support team will respond to you via email at ' +
              data.email +
              ' within 2-4 hours.',
            [
              {
                text: 'OK',
                onPress: () => {
                  reset();
                  router.back();
                },
              },
            ],
          );
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to submit contact request. Please try again.');
        },
      },
    );
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
          title="Contact Support"
          description="Have questions or issues? Get in touch with our customer service team."
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {/* Support channels dashboard */}
        <View className="flex-row gap-x-3 mb-6">
          {/* Live Chat */}
          <Pressable
            onPress={handleLiveChat}
            style={cardShadow}
            className="flex-1 bg-white rounded-xl p-4 items-center justify-center active:bg-gray-50/50"
          >
            <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mb-2">
              <Feather name="message-circle" size={20} color="#485aff" />
            </View>
            <Text className="text-xs font-sans-bold text-gray-900 text-center">Live Chat</Text>
            <Text className="text-[10px] font-sans-medium text-emerald-500 text-center mt-1">Online (5m wait)</Text>
          </Pressable>

          {/* Hotline */}
          <Pressable
            onPress={handleCallSupport}
            style={cardShadow}
            className="flex-1 bg-white rounded-xl p-4 items-center justify-center active:bg-gray-50/50"
          >
            <View className="h-10 w-10 bg-primary/10 rounded-full items-center justify-center mb-2">
              <Feather name="phone-call" size={18} color="#485aff" />
            </View>
            <Text className="text-xs font-sans-bold text-gray-900 text-center">Call Support</Text>
            <Text className="text-[10px] font-sans-medium text-gray-400 text-center mt-1">9744985161 / 9713969243</Text>
          </Pressable>
        </View>

        {/* Contact Form Container */}
        <View style={cardShadow} className="bg-white rounded-xl p-5 mb-5">
          {/* Full Name Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Full Name <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="fullName"
              rules={{ required: 'Full name is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Your name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.fullName?.message}
                />
              )}
            />
          </View>

          {/* Email Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Email <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  inputStyle={{ padding: 0 }}
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          {/* Phone Number Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Phone Number <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <PhoneNumberField
              control={control}
              name="phoneNumber"
              label=""
              placeholder="98XXXXXXXX"
              error={errors.phoneNumber?.message}
            />
          </View>

          {/* Subject Field */}
          <View className="mb-4">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Subject <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="subject"
              rules={{
                required: 'Subject is required',
                maxLength: { value: 120, message: 'Subject cannot exceed 120 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="What's this about?"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={120}
                  inputStyle={{ padding: 0 }}
                  error={errors.subject?.message}
                />
              )}
            />
            <Text className="text-[10px] font-sans-medium text-gray-400 mt-1 ml-1">{watchSubject.length}/120</Text>
          </View>

          {/* Message Field */}
          <View className="mb-5">
            <Text className="text-xs font-sans-bold text-gray-700 mb-1.5 ml-0.5">
              Message <Text className="text-destructive font-sans-bold">*</Text>
            </Text>
            <Controller
              control={control}
              name="message"
              rules={{
                required: 'Message is required',
                maxLength: { value: 2000, message: 'Message cannot exceed 2000 characters' },
                minLength: { value: 10, message: 'Message must be at least 10 characters' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Type your message here..."
                  multiline
                  numberOfLines={6}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  maxLength={2000}
                  inputStyle={{ textAlignVertical: 'top', height: 140, padding: 0 }}
                  error={errors.message?.message}
                />
              )}
            />
            <Text className="text-[10px] font-sans-medium text-gray-400 mt-1 ml-1">{watchMessage.length}/2000</Text>
          </View>

          {/* Send Message Button */}
          <Button
            title="Send Message"
            variant="primary"
            loading={isPending}
            onPress={handleSubmit(handleTicketSubmit)}
            className="w-full h-12 bg-primary border-primary rounded-xl"
            leftIcon={<Feather name="send" size={16} color="#ffffff" />}
          />
        </View>

        {/* Support hours notice */}
        <View className="mt-1 items-center justify-center">
          <Text className="text-[10px] font-sans-medium text-gray-400 text-center">
            Standard support hours: Sunday - Friday, 9:00 AM - 6:00 PM (NPT)
          </Text>
        </View>
      </ContentLayout>
    </View>
  );
}
