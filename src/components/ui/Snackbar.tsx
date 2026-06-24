import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarConfig {
  message: string;
  type?: SnackbarType;
  duration?: number;
  action?: { label: string; onPress: () => void };
  position?: 'top' | 'bottom';
}

interface SnackbarContextValue {
  showSnackbar: (config: SnackbarConfig) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}

const ICON_MAP: Record<SnackbarType, keyof typeof Feather.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'info',
};

const BG_MAP: Record<SnackbarType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SnackbarConfig | null>(null);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const hideSnackbar = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setConfig(null));
  }, [opacity]);

  const showSnackbar = useCallback(
    (c: SnackbarConfig) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setConfig({ type: 'info', duration: 3000, ...c });
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(hideSnackbar, c.duration ?? 3000);
    },
    [opacity, hideSnackbar],
  );

  const type = config?.type ?? 'info';
  const position = config?.position ?? 'top';

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      {config ? (
        <Animated.View
          className={`absolute ${position === 'top' ? 'top-12' : 'bottom-8'} left-4 right-4 z-50`}
          style={{ opacity }}
        >
          <Pressable
            onPress={hideSnackbar}
            className={`flex-row items-center px-4 py-3 rounded-lg ${BG_MAP[type]} shadow-lg`}
          >
            <Feather name={ICON_MAP[type]} size={18} color="#fff" />
            <Text className="flex-1 text-white font-sans-medium text-sm ml-2.5">{config.message}</Text>
            {config.action ? (
              <Pressable onPress={config.action.onPress} className="ml-2">
                <Text className="text-white font-sans-bold text-sm underline">{config.action.label}</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}
