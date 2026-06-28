import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { BOTTOM_TAB_CONFIGS, TabConfig } from '@/constants/navigation';

export interface BottomTabBarProps {
  state: {
    routes: any[];
    index: number;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (options: any) => any;
    navigate: (name: string, params?: any) => void;
  };
}

const TAB_TRANSLATION_KEYS: Record<string, string> = {
  home: 'navigation.tabHome',
  'find-services': 'navigation.tabFindServices',
  'be-provider': 'navigation.tabBeProvider',
  'get-started': 'navigation.tabGetStarted',
  bookings: 'navigation.tabBookings',
  favourites: 'navigation.tabFavourites',
  account: 'navigation.tabAccount',
  services: 'navigation.tabServices',
  earnings: 'navigation.tabEarnings',
};

export default function BottomNavigationBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const bottomPadding = insets.bottom > 0 ? insets.bottom - 12 : 0;
  const barHeight = 56 + bottomPadding;

  return (
    <View
      style={{
        paddingBottom: bottomPadding,
        height: barHeight,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 0,
      }}
      className="flex-row bg-white border-t border-gray-100/50 w-full"
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config: TabConfig = BOTTOM_TAB_CONFIGS[route.name] || {
          label: TAB_TRANSLATION_KEYS[route.name] || route.name,
          icon: (color) => <Feather name="help-circle" size={22} color={color} />,
        };
        const translationKey = TAB_TRANSLATION_KEYS[route.name];
        const translatedLabel = translationKey ? t(translationKey) : config.label;

        const activeColor = '#485aff';
        const inactiveColor = '#0f172a';
        const color = isFocused ? activeColor : inactiveColor;

        const onPress = () => {
          if (config.action) {
            config.action();
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center pt-2 pb-0.5"
          >
            <View className="items-center justify-center mb-1.5">{config.icon(color, isFocused)}</View>
            <Text style={{ fontSize: 11, color }} className={`font-sans-medium tracking-tight text-center`}>
              {translatedLabel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
