import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ErrorDialogAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ErrorDialogConfig {
  title: string;
  message: string;
  actions?: ErrorDialogAction[];
}

interface ErrorDialogContextValue {
  showError: (config: ErrorDialogConfig) => void;
  hideError: () => void;
}

const ErrorDialogContext = createContext<ErrorDialogContextValue | null>(null);

export function useErrorDialog(): ErrorDialogContextValue {
  const ctx = useContext(ErrorDialogContext);
  if (!ctx) throw new Error('useErrorDialog must be used within ErrorDialogProvider');
  return ctx;
}

export function ErrorDialogProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [config, setConfig] = useState<ErrorDialogConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const scale = useMemo(() => new Animated.Value(0.9), []);

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 100, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  const animateOut = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 120, useNativeDriver: true }),
      ]).start(onDone);
    },
    [opacity, scale],
  );

  const hideError = useCallback(() => {
    animateOut(() => {
      setConfig(null);
      setVisible(false);
    });
  }, [animateOut]);

  const showError = useCallback(
    (c: ErrorDialogConfig) => {
      setConfig(c);
      setVisible(true);
      requestAnimationFrame(animateIn);
    },
    [animateIn],
  );

  return (
    <ErrorDialogContext.Provider value={{ showError, hideError }}>
      {children}
      <Modal visible={visible} transparent animationType="none" onRequestClose={hideError}>
        <Animated.View className="flex-1 bg-black/50 justify-center items-center px-6" style={{ opacity }}>
          <Animated.View
            className="w-full max-w-sm bg-white rounded-lg p-6"
            style={{ opacity, transform: [{ scale }] }}
          >
            <View className="items-center mb-4">
              <View className="h-14 w-14 rounded-full bg-destructive/10 items-center justify-center mb-3">
                <Feather name="alert-triangle" size={28} color="#dc2626" />
              </View>
              <Text className="text-lg font-sans-bold text-gray-900 text-center">{config?.title ?? ''}</Text>
            </View>
            <Text className="text-sm font-sans-medium text-gray-600 text-center leading-relaxed mb-6">
              {config?.message ?? ''}
            </Text>
            <View className="gap-y-2.5">
              {(config?.actions?.length ?? 0) > 0 ? (
                config!.actions!.map((action, idx) => {
                  const isDestructive = action.style === 'destructive';
                  const isCancel = action.style === 'cancel';
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => {
                        action.onPress?.();
                        hideError();
                      }}
                      accessibilityRole="button"
                      className={`py-3 rounded-lg items-center ${
                        isCancel ? 'bg-muted' : isDestructive ? 'bg-destructive' : 'bg-primary'
                      }`}
                    >
                      <Text className={`font-sans-bold text-sm ${isCancel ? 'text-gray-700' : 'text-white'}`}>
                        {action.text}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <Pressable
                  onPress={hideError}
                  accessibilityRole="button"
                  className="py-3 rounded-lg bg-primary items-center"
                >
                  <Text className="font-sans-bold text-sm text-white">{t('common.ok')}</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </ErrorDialogContext.Provider>
  );
}
