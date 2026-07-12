import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface TabConfig {
  label: string;
  icon: (focused: boolean) => React.ReactNode;
  action?: () => void;
}

export const BOTTOM_TAB_CONFIGS: Record<string, TabConfig> = {
  home: {
    label: 'Home',
    icon: (focused) => <Feather name="home" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  'find-services': {
    label: 'Find Services',
    icon: (focused) => <Feather name="search" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  'be-provider': {
    label: 'Be a Provider',
    icon: (focused) => <Feather name="briefcase" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  'get-started': {
    label: 'Get Started',
    icon: (focused) => <Feather name="user" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  bookings: {
    label: 'Bookings',
    icon: (focused) => <Feather name="calendar" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  favourites: {
    label: 'Favourites',
    icon: (focused) => <Feather name="heart" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  account: {
    label: 'Account',
    icon: (focused) => <Feather name="user" size={22} color={focused ? '#485aff' : '#111827'} />,
  },
  services: {
    label: 'Services',
    icon: (focused) => (
      <View className="relative items-center justify-center w-6 h-6">
        <Feather name="hexagon" size={22} color={focused ? '#485aff' : '#111827'} />
        <View className={`w-1.5 h-1.5 rounded-full absolute ${focused ? 'bg-primary' : 'bg-gray-900'}`} />
      </View>
    ),
  },
  earnings: {
    label: 'Earnings',
    icon: (focused) => (
      <View
        className={`border rounded-full items-center justify-center w-5.5 h-5.5 ${focused ? 'border-primary' : 'border-gray-900'}`}
      >
        <Feather name="dollar-sign" size={14} color={focused ? '#485aff' : '#111827'} />
      </View>
    ),
  },
};
