import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface TabConfig {
  label: string;
  icon: (color: string, focused: boolean) => React.ReactNode;
  action?: () => void;
}

export const BOTTOM_TAB_CONFIGS: Record<string, TabConfig> = {
  home: {
    label: 'Home',
    icon: (color) => <Feather name="home" size={22} color={color} />,
  },
  'find-services': {
    label: 'Find Services',
    icon: (color) => <Feather name="search" size={22} color={color} />,
  },
  'be-provider': {
    label: 'Be a Provider',
    icon: (color) => <Feather name="briefcase" size={22} color={color} />,
  },
  'get-started': {
    label: 'Get Started',
    icon: (color) => <Feather name="user" size={22} color={color} />,
  },
  bookings: {
    label: 'Bookings',
    icon: (color) => <Feather name="calendar" size={22} color={color} />,
  },
  favourites: {
    label: 'Favourites',
    icon: (color) => <Feather name="heart" size={22} color={color} />,
  },
  account: {
    label: 'Account',
    icon: (color) => <Feather name="user" size={22} color={color} />,
  },
  services: {
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
  },
  earnings: {
    label: 'Earnings',
    icon: (color) => (
      <View
        className="border rounded-full items-center justify-center"
        style={{ width: 22, height: 22, borderColor: color }}
      >
        <Feather name="dollar-sign" size={14} color={color} />
      </View>
    ),
  },
};
