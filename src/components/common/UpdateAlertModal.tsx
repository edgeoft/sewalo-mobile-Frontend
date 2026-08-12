import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '@/components/ui/Button';

interface UpdateAlertModalProps {
  visible: boolean;
  latestVersion?: string;
  releaseNotes?: string;
  isMandatory?: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UpdateAlertModal({
  visible,
  latestVersion,
  releaseNotes,
  isMandatory = false,
  onClose,
  onUpdate,
}: UpdateAlertModalProps) {
  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center p-5">
        <View className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          {/* Icon Badge */}
          <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center self-center mb-4">
            <Feather name="download-cloud" size={28} color="#485aff" />
          </View>

          {/* Title */}
          <Text className="text-xl font-sans-extrabold text-gray-900 text-center mb-1">New Update Available!</Text>

          {/* Version tag */}
          {latestVersion ? (
            <Text className="text-xs font-sans-semibold text-primary text-center mb-3">Version {latestVersion}</Text>
          ) : null}

          {/* Release Notes */}
          {releaseNotes ? (
            <View className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
              <Text className="text-xs font-sans-semibold text-gray-700 mb-1">What&apos;s New:</Text>
              <Text className="text-xs font-sans-regular text-gray-600 leading-5">{releaseNotes}</Text>
            </View>
          ) : (
            <Text className="text-xs font-sans-regular text-gray-500 text-center mb-5 leading-5">
              A new build is ready with performance updates and improvements.
            </Text>
          )}

          {/* Actions */}
          <View className="gap-y-2">
            <Button title="Update Now" onPress={onUpdate} className="w-full h-12" />

            {!isMandatory && (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                className="py-2.5 items-center justify-center active:opacity-60"
              >
                <Text className="text-xs font-sans-semibold text-gray-400">Later</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
