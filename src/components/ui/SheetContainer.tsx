import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';

export interface SheetContainerProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxHeightRatio?: number;
}

export default function SheetContainer({
  visible,
  onClose,
  title,
  description,
  children,
  maxHeightRatio = 0.85,
}: SheetContainerProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[styles.drawerContainer, { maxHeight: height * maxHeightRatio }]}
          className="bg-white px-5 pb-7 pt-4"
        >
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

          {title && (
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{title}</Text>
              <Pressable
                onPress={onClose}
                className="w-11 h-11 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>
          )}

          {description && <Text className="text-gray-500 text-sm font-sans-medium mb-4">{description}</Text>}

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {children}
          </ScrollView>
        </View>
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
