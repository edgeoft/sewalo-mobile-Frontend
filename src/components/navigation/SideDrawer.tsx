import { ReactNode, useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAppReducedMotion } from '@/utils/accessibility';

export type SideDrawerActionItem = {
  type: 'action';
  id: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onPress: () => void;
  destructive?: boolean;
  trailing?: ReactNode;
};

export type SideDrawerLanguageToggleItem = {
  type: 'language-toggle';
  id: string;
  title: string;
  value: string;
  onChange: (code: string) => void;
};

export type SideDrawerItem = SideDrawerActionItem | SideDrawerLanguageToggleItem;

export interface SideDrawerSection {
  title: string;
  items: SideDrawerItem[];
}

export interface SideDrawerFooterAction {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  destructive?: boolean;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  sections: SideDrawerSection[];
  footerAction?: SideDrawerFooterAction;
}

export default function SideDrawer({ visible, onClose, title, sections, footerAction }: SideDrawerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.86, 370);

  const [translateX] = useState(() => new Animated.Value(drawerWidth));
  const [backdropOpacity] = useState(() => new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(visible);
  const reducesMotion = useAppReducedMotion();

  const animateIn = useCallback(() => {
    translateX.setValue(drawerWidth);
    backdropOpacity.setValue(0);

    if (reducesMotion) {
      translateX.setValue(0);
      backdropOpacity.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, drawerWidth, translateX, reducesMotion]);

  const animateOut = useCallback(() => {
    const duration = reducesMotion ? 0 : 180;
    const backdropDuration = reducesMotion ? 0 : 140;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: drawerWidth,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: backdropDuration,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
      }
    });
  }, [backdropOpacity, drawerWidth, translateX, reducesMotion]);

  useEffect(() => {
    if (visible) {
      if (!modalVisible) {
        const frame = requestAnimationFrame(() => setModalVisible(true));

        return () => cancelAnimationFrame(frame);
      }
    } else if (modalVisible) {
      animateOut();
    }
  }, [visible, modalVisible, animateOut]);

  const handleModalShow = useCallback(() => {
    animateIn();
  }, [animateIn]);

  if (!modalVisible) return null;

  return (
    <Modal
      animationType="none"
      transparent
      visible={modalVisible}
      onShow={handleModalShow}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <StatusBar hidden animated />
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} accessibilityRole="button">
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: drawerWidth,
              paddingTop: Math.max(insets.top + 8, 20),
              transform: [{ translateX }],
            },
          ]}
          className="bg-[#f7f9ff]"
          accessibilityViewIsModal
        >
          <View className="mx-4 mb-4 rounded-xl bg-white px-5 pb-4 pt-4 flex-row items-start justify-between border border-gray-100/80">
            <View className="flex-1 pr-3">
              <Text className="text-[22px] font-sans-extrabold text-gray-900">{title}</Text>
              <Text className="text-xs font-sans-medium text-gray-500 mt-1">{t('navigation.drawerSubtitle')}</Text>
            </View>

            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-lg items-center justify-center bg-[#f7f9ff] active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text className="text-xl leading-5 text-gray-700">×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-4 py-1 pb-6">
            <View className="gap-y-5">
              {sections.map((section) => (
                <View key={section.title} className="gap-y-3">
                  <Text className="px-1 text-[11px] font-sans-bold text-gray-400 uppercase tracking-[0.18em]">
                    {section.title}
                  </Text>

                  <View className="gap-y-2.5">
                    {section.items.map((item) =>
                      item.type === 'action' ? (
                        <Pressable
                          key={item.id}
                          onPress={() => {
                            item.onPress();
                            onClose();
                          }}
                          className="rounded-xl bg-white px-4 py-3.5 active:opacity-80 border border-gray-100/80"
                          accessibilityRole="button"
                          accessibilityLabel={`${item.title}${item.subtitle ? `, ${item.subtitle}` : ''}`}
                        >
                          <View className="flex-row items-center">
                            <View className="w-10 h-10 rounded-lg bg-[#eef0ff] items-center justify-center mr-3 border border-primary/10">
                              {item.icon}
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-sm font-sans-semibold ${item.destructive ? 'text-red-600' : 'text-gray-900'}`}
                              >
                                {item.title}
                              </Text>
                              {item.subtitle ? (
                                <Text className="text-xs font-sans-medium text-gray-500 mt-0.5">{item.subtitle}</Text>
                              ) : null}
                            </View>
                            {item.trailing ? <View className="ml-3">{item.trailing}</View> : null}
                          </View>
                        </Pressable>
                      ) : (
                        <View key={item.id} className="rounded-xl bg-white px-4 py-3.5 border border-gray-100/80">
                          <View className="flex-row items-center justify-between gap-x-4">
                            <Text className="text-sm font-sans-semibold text-gray-900">{item.title}</Text>
                            <Pressable
                              onPress={() => item.onChange(item.value.startsWith('en') ? 'ne' : 'en')}
                              className="flex-row items-center rounded-lg bg-white px-3 py-1.5 border border-gray-100 active:opacity-80"
                              accessibilityRole="button"
                              accessibilityLabel="Toggle language"
                            >
                              <Text className="text-base mr-1">{item.value.startsWith('en') ? '🇺🇸' : '🇳🇵'}</Text>
                              <Text className="text-xs font-sans-bold text-gray-700">
                                {item.value.startsWith('en') ? t('common.english') : t('common.nepali')}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {footerAction ? (
            <View className="px-4 pb-5 pt-2">
              <Pressable
                onPress={() => {
                  footerAction.onPress();
                  onClose();
                }}
                className={`flex-row items-center justify-center rounded-xl px-4 py-3.5 active:opacity-80 border ${
                  footerAction.destructive ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100/80'
                }`}
                accessibilityRole="button"
                accessibilityLabel={footerAction.label}
              >
                {footerAction.icon ? <View className="mr-2">{footerAction.icon}</View> : null}
                <Text
                  className={`text-sm font-sans-bold ${footerAction.destructive ? 'text-red-600' : 'text-gray-900'}`}
                >
                  {footerAction.label}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7, 17, 31, 0.34)',
  },
  drawerContainer: {
    height: '100%',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 18,

    elevation: 26,
  },
});
