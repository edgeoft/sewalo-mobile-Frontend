import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { BOTTOM_TAB_CONFIGS, TabConfig } from '@/constants/navigation';
import { THEME_COLORS } from '@/constants/colors';

import type { ComponentProps } from 'react';
import type { Tabs } from 'expo-router';

export type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvents: ('keyboardWillShow' | 'keyboardDidShow')[] = ['keyboardWillShow', 'keyboardDidShow'];
    const hideEvents: ('keyboardWillHide' | 'keyboardDidHide')[] = ['keyboardWillHide', 'keyboardDidHide'];

    const showSubs = showEvents.map((event) => Keyboard.addListener(event, () => setIsKeyboardVisible(true)));
    const hideSubs = hideEvents.map((event) => Keyboard.addListener(event, () => setIsKeyboardVisible(false)));

    return () => {
      showSubs.forEach((sub) => sub.remove());
      hideSubs.forEach((sub) => sub.remove());
    };
  }, []);

  const bottomPadding = insets.bottom;
  const barHeight = 56 + bottomPadding;

  if (isKeyboardVisible) {
    return null;
  }

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
      className="flex-row bg-white border-t border-slate-100 w-full"
    >
      {state.routes
        .filter((route) => route.name !== 'map-services')
        .map((route, index: number) => {
          const { options } = descriptors[route.key];
          const currentRouteName = state.routes[state.index]?.name;
          const isFocused =
            state.routes[state.index]?.key === route.key ||
            (route.name === 'find-services' && currentRouteName === 'map-services');
          const config: TabConfig = BOTTOM_TAB_CONFIGS[route.name] || {
            label: TAB_TRANSLATION_KEYS[route.name] || route.name,
            icon: (focused) => (
              <Feather name="help-circle" size={22} color={focused ? THEME_COLORS.primary : THEME_COLORS.slate900} />
            ),
          };
          const translationKey = TAB_TRANSLATION_KEYS[route.name];
          const translatedLabel = translationKey ? t(translationKey) : config.label;

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

          const opts = options as Record<string, string | undefined>;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={opts.tabBarAccessibilityLabel ?? translatedLabel}
              accessibilityHint={opts.tabBarAccessibilityHint}
              testID={opts.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center pt-2 pb-0.5"
            >
              <View
                className="items-center justify-center mb-1.5"
                importantForAccessibility="no"
                accessibilityElementsHidden
              >
                {config.icon(isFocused)}
              </View>
              <Text
                style={{ fontSize: 11 }}
                className={`font-sans-medium tracking-tight text-center ${isFocused ? 'text-primary' : 'text-gray-900'}`}
              >
                {translatedLabel}
              </Text>
            </Pressable>
          );
        })}
    </View>
  );
}
