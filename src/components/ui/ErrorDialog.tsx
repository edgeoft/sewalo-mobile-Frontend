import React, { createContext, useCallback, useContext, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
  const [config, setConfig] = useState<ErrorDialogConfig | null>(null);

  const hideError = useCallback(() => setConfig(null), []);

  const showError = useCallback((c: ErrorDialogConfig) => {
    setConfig(c);
  }, []);

  return (
    <ErrorDialogContext.Provider value={{ showError, hideError }}>
      {children}
      <Modal visible={!!config} transparent animationType="fade" onRequestClose={hideError}>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="w-full max-w-sm bg-white rounded-2xl p-6">
            <View className="items-center mb-4">
              <View className="h-14 w-14 rounded-full bg-red-50 items-center justify-center mb-3">
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
                        hideError();
                        action.onPress?.();
                      }}
                      className={`py-3 rounded-xl items-center ${
                        isCancel ? 'bg-gray-100' : isDestructive ? 'bg-red-600' : 'bg-primary'
                      }`}
                    >
                      <Text className={`font-sans-bold text-sm ${isCancel ? 'text-gray-700' : 'text-white'}`}>
                        {action.text}
                      </Text>
                    </Pressable>
                  );
                })
              ) : (
                <Pressable onPress={hideError} className="py-3 rounded-xl bg-primary items-center">
                  <Text className="font-sans-bold text-sm text-white">OK</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ErrorDialogContext.Provider>
  );
}
