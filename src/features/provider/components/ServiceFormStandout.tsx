import React, { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import Input from '@/components/ui/Input';
import { ServiceFormData } from '@/types';

interface ServiceFormStandoutProps {
  control: Control<ServiceFormData>;
  errors: FieldErrors<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  watchWorkSamples: ServiceFormData['workSamples'];
  watchHashtags: string[];
}

export default function ServiceFormStandout({
  control,
  errors,
  setValue,
  watchWorkSamples = [],
  watchHashtags = [],
}: ServiceFormStandoutProps) {
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isTagFocused, setIsTagFocused] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 1. Photo Grid Handlers
  const handlePickImage = async () => {
    if (watchWorkSamples.length >= 5) {
      Alert.alert('Limit Reached', 'You can upload up to 5 work samples.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your photo library to select work samples.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        const newIndex = watchWorkSamples.length;

        // Add to work samples as uploading
        const updatedSamples = [...watchWorkSamples, { uri: pickedUri, uploaded: false }];
        setValue('workSamples', updatedSamples, { shouldValidate: true });

        // Start simulated upload progress
        setUploadingIndex(newIndex);
        setUploadProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setUploadingIndex(null);

            // Mark as uploaded: true
            const finalSamples = [...updatedSamples];
            finalSamples[newIndex] = { uri: pickedUri, uploaded: true };
            setValue('workSamples', finalSamples, { shouldValidate: true });
          }
        }, 300);
      }
    } catch {
      Alert.alert('Error', 'Something went wrong while picking the image.');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = watchWorkSamples.filter((_, i) => i !== index);
    setValue('workSamples', updated, { shouldValidate: true });
    if (uploadingIndex === index) {
      setUploadingIndex(null);
    }
  };

  // 2. Tag Input Handlers
  const handleAddTag = () => {
    const cleaned = tagInput.trim().replace(/#/g, '').replace(/,/g, '');
    if (cleaned && !watchHashtags.includes(cleaned)) {
      setValue('hashtags', [...watchHashtags, cleaned], { shouldValidate: true });
    }
    setTagInput('');
    setShowTagInput(false);
    setIsTagFocused(false);
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      'hashtags',
      watchHashtags.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  };

  return (
    <View
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
      }}
      className="rounded-xl border border-gray-200 bg-white p-3.5 mb-6"
    >
      <View className="mb-4">
        <Text className="text-base font-sans-bold text-gray-950 mb-1">Make It Stand Out</Text>
        <Text className="text-xs font-sans-medium text-gray-500 leading-normal">
          Add high-quality work samples, search tags, and a link to your portfolio website.
        </Text>
      </View>

      {/* Work Samples Horizontal Scroll */}
      <View className="mb-5">
        <Text className="text-xs font-sans-bold text-gray-800 mb-2.5 ml-0.5">Work Samples (Max 5)</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 4, paddingHorizontal: 2 }}
        >
          {watchWorkSamples.map((sample, index) => {
            const isUploading = uploadingIndex === index;
            return (
              <View key={index} className="w-32 h-24 rounded-lg overflow-hidden bg-gray-50 relative">
                <Image source={{ uri: sample.uri }} className="w-full h-full" resizeMode="cover" />

                {/* Uploading progress overlay */}
                {isUploading && (
                  <View className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Text className="text-[10px] font-sans-bold text-white mb-1">Uploading {uploadProgress}%</Text>
                    <View className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
                      <View style={{ width: `${uploadProgress}%` }} className="h-full bg-primary" />
                    </View>
                  </View>
                )}

                {/* Remove button */}
                <Pressable
                  onPress={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center active:bg-black/75"
                >
                  <Feather name="trash-2" size={11} color="white" />
                </Pressable>
              </View>
            );
          })}

          {/* Add slot */}
          {watchWorkSamples.length < 5 && (
            <Pressable
              onPress={handlePickImage}
              className="w-32 h-24 rounded-lg border border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center active:bg-gray-50"
            >
              <View className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                <Feather name="plus" size={15} color="#485aff" />
              </View>
              <Text className="text-[10px] font-sans-semibold text-gray-400">Add Photo</Text>
            </Pressable>
          )}
        </ScrollView>
      </View>

      {/* Tag/Chip Input */}
      <View className="mb-5">
        <Text className="text-xs font-sans-semibold text-gray-700 mb-2 ml-0.5">Hashtags</Text>

        <View className="flex-row flex-wrap gap-2 items-center">
          {/* Tag input chips container */}
          {watchHashtags.map((tag) => (
            <View
              key={tag}
              className="bg-indigo-50/80 border border-indigo-100 rounded-full px-2.5 py-1 flex-row items-center"
            >
              <Text className="text-xs font-sans-semibold text-primary mr-1">#{tag}</Text>
              <Pressable hitSlop={6} onPress={() => handleRemoveTag(tag)}>
                <Feather name="x" size={10} color="#485aff" />
              </Pressable>
            </View>
          ))}

          {/* Add Tag Trigger or Inline Input */}
          {showTagInput ? (
            <View
              className={`form-input-container form-input-container-single w-full ${isTagFocused ? 'form-input-container-focus' : ''}`}
              style={{
                shadowColor: isTagFocused ? '#485aff' : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isTagFocused ? 0.08 : 0.015,
                shadowRadius: isTagFocused ? 4 : 2,
                elevation: isTagFocused ? 2 : 0,
              }}
            >
              <TextInput
                placeholder="e.g. Sanitization"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                autoFocus={true}
                onFocus={() => setIsTagFocused(true)}
                onBlur={() => {
                  setIsTagFocused(false);
                  // Optionally hide tag input if empty when blurred
                  if (!tagInput.trim()) {
                    setShowTagInput(false);
                  }
                }}
                placeholderTextColor="#898f8f"
                className="form-input-text"
                style={{
                  includeFontPadding: false,
                  textAlignVertical: 'center',
                  lineHeight: undefined,
                }}
              />
              <Pressable onPress={handleAddTag} className="pl-3 active:opacity-70">
                <Feather name="plus" size={16} color="#485aff" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowTagInput(true)}
              className="border border-dashed border-gray-300 bg-gray-50/50 rounded-full px-3 py-1 flex-row items-center active:bg-gray-100"
            >
              <Feather name="plus" size={11} color="#485aff" className="mr-1" />
              <Text className="text-xs font-sans-semibold text-primary">Add Tag</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Portfolio Website URL */}
      <Controller
        control={control}
        name="portfolioUrl"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Portfolio Website URL (Optional)"
            placeholder="e.g. www.myportfolio.com"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            inputStyle={{ padding: 0 }}
            error={errors.portfolioUrl?.message}
            leftIcon={<Feather name="link" size={16} color="#898f8f" />}
          />
        )}
      />
    </View>
  );
}
