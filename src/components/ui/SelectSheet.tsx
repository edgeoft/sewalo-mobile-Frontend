import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
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

import SelectionOption from './SelectionOption';

export interface SelectOptionItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SelectSheetProps {
  options: SelectOptionItem[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  title?: string;
  description?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function SelectSheet({
  options,
  value,
  onSelect,
  placeholder,
  title,
  description,
  label,
  error,
  disabled = false,
}: SelectSheetProps) {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const resolvedPlaceholder = placeholder ?? t('common.selectOption');
  const resolvedTitle = title ?? t('common.select');

  const selectedOption = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onSelect(val);
    setModalVisible(false);
  };

  const triggerLabel = label ? `${label}: ${selectedOption ? selectedOption.label : resolvedPlaceholder}` : undefined;

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-xs font-sans-bold text-gray-950 mb-1.5 uppercase tracking-wide ml-0.5">{label}</Text>
      )}

      <Pressable
        onPress={() => !disabled && setModalVisible(true)}
        className={`form-input-container form-input-container-single ${error ? 'form-input-container-error' : ''} ${disabled ? 'opacity-60' : ''}`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.015,
          shadowRadius: 2,
          elevation: 0,
        }}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityState={{ disabled, expanded: modalVisible }}
        accessibilityHint={error}
      >
        <Text
          className={`form-input-text flex-1 ${selectedOption ? '' : 'text-[#898f8f]'}`}
          style={{ includeFontPadding: false, textAlignVertical: 'center' }}
        >
          {selectedOption ? selectedOption.label : resolvedPlaceholder}
        </Text>
        <View className="ml-3">
          <Feather name="chevron-down" size={16} color="#9ca3af" />
        </View>
      </Pressable>

      {error && <Text className="text-red-500 text-xs font-sans-medium mt-1.5 ml-0.5">{error}</Text>}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.drawerContainer, { maxHeight: height * 0.7 }]} className="bg-white px-5 pb-7 pt-4">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-gray-900 text-xl font-sans-extrabold">{resolvedTitle}</Text>
              <Pressable
                onPress={() => setModalVisible(false)}
                className="w-11 h-11 rounded-full items-center justify-center bg-gray-100 active:opacity-75"
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Feather name="x" size={16} color="#64748b" />
              </Pressable>
            </View>

            {description && <Text className="text-gray-500 text-sm font-sans-medium mb-4">{description}</Text>}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View className="gap-y-2.5 mt-2">
                {options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <SelectionOption
                      key={option.value}
                      onPress={() => handleSelect(option.value)}
                      title={option.label}
                      selected={isSelected}
                      icon={option.icon}
                      iconStyle={option.icon ? 'plain' : undefined}
                      indicatorType="radio"
                      gradientColors={['#eef0ff', '#f8fafc']}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
