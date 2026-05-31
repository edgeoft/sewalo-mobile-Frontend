import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

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

export interface TabConfig {
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  action?: () => void;
}

export default function BottomNavigationBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Helper to render custom styled icons to match images exactly
  const getTabConfig = (routeName: string): TabConfig => {
    switch (routeName) {
      case 'home':
        return {
          label: 'Home',
          icon: (color) => <Feather name="home" size={22} color={color} />,
        };
      case 'find-services':
        return {
          label: 'Find Services',
          icon: (color) => <Feather name="search" size={22} color={color} />,
        };
      case 'be-provider':
        return {
          label: 'Be a Provider',
          icon: (color) => <Feather name="briefcase" size={22} color={color} />,
        };
      case 'get-started':
        return {
          label: 'Get Started',
          icon: (color) => <Feather name="user" size={22} color={color} />,
          action: () => router.push('/auth'),
        };
      case 'bookings':
        return {
          label: 'Bookings',
          icon: (color) => <Feather name="calendar" size={22} color={color} />,
        };
      case 'favourites':
        return {
          label: 'Favourites',
          icon: (color) => <Feather name="heart" size={22} color={color} />,
        };
      case 'account':
        return {
          label: 'Account',
          icon: (color) => <Feather name="user" size={22} color={color} />,
        };
      case 'services':
        return {
          label: 'Services',
          icon: (color) => (
            <View className="relative items-center justify-center w-6 h-6">
              <Feather name="hexagon" size={22} color={color} />
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: color,
                  position: 'absolute',
                }}
              />
            </View>
          ),
        };
      case 'earnings':
        return {
          label: 'Earnings',
          icon: (color) => (
            <View
              className="border rounded-full items-center justify-center"
              style={{ width: 22, height: 22, borderColor: color }}
            >
              <Feather name="dollar-sign" size={14} color={color} />
            </View>
          ),
        };
      default:
        return {
          label: routeName,
          icon: (color) => <Feather name="help-circle" size={22} color={color} />,
        };
    }
  };

  const bottomPadding = insets.bottom > 0 ? insets.bottom - 12 : 0;
  const barHeight = 56 + bottomPadding;

  return (
    <View
      style={{
        paddingBottom: bottomPadding,
        height: barHeight,
      }}
      className="flex-row bg-white border-t border-gray-100 w-full"
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = getTabConfig(route.name);

        const activeColor = '#485aff'; // Brand primary blue
        const inactiveColor = '#0f172a'; // Slate dark gray
        const color = isFocused ? activeColor : inactiveColor;

        const onPress = () => {
          // If custom action is defined (like guest "Get Started" which redirects to signup/login flow)
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
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
