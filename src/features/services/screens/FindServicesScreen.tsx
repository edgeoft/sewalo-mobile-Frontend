import { Feather } from '@expo/vector-icons';
import { useSegments } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { createGuestDrawerConfig, createRoleDrawerConfig } from '@/components/navigation/RoleDrawerConfig';
import SideDrawer from '@/components/navigation/SideDrawer';
import Input from '@/components/ui/Input';

const CATEGORIES = [
  { id: 'computers', label: 'Computers & IT', icon: 'monitor' as const },
  { id: 'legal', label: 'Legal', icon: 'briefcase' as const },
  { id: 'design', label: 'Design', icon: 'pen-tool' as const },
  { id: 'photo_video', label: 'Photo & Video', icon: 'video' as const },
  { id: 'maintenance', label: 'Maintenance', icon: 'tool' as const },
  { id: 'auto_repair', label: 'Auto Repair', icon: 'settings' as const },
  { id: 'electrician', label: 'Electrician', icon: 'zap' as const },
  { id: 'beauty', label: 'Beauty', icon: 'scissors' as const },
  { id: 'moving', label: 'Moving', icon: 'truck' as const },
  { id: 'plumbing', label: 'Plumbing', icon: 'droplet' as const },
];

export default function FindServicesScreen() {
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isGuest = segments.includes('(guest)');

  const drawerConfig = isGuest
    ? createGuestDrawerConfig({
        currentLanguage: i18n.language || 'en',
        onLanguageChange: (code) => i18n.changeLanguage(code),
      })
    : createRoleDrawerConfig({
        currentLanguage: i18n.language || 'en',
        onLanguageChange: (code) => i18n.changeLanguage(code),
        onLogout: () => setDrawerVisible(false),
      });

  // Filter categories based on search query
  const filteredCategories = CATEGORIES.filter((category) =>
    category.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" onMenuPress={() => setDrawerVisible(true)} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 24),
          paddingTop: 20,
        }}
      >
        {/* Page Header (Title + Subtitle) */}
        <View className="mb-6">
          <Text className="text-2xl font-sans-extrabold text-left text-gray-950 mb-1.5 tracking-tight">
            Find Services
          </Text>
          <Text className="text-sm font-sans-medium text-gray-500 leading-relaxed">
            Find and book professional service providers near you.
          </Text>
        </View>

        {/* Search Input */}
        <View className="mb-8">
          <Input
            placeholder="What services are you looking for today?"
            value={searchQuery}
            onChangeText={setSearchQuery}
            inputClassName="pr-12 text-sm"
            containerStyle={{
              shadowColor: '#0f172a',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 18,
              elevation: 4,
            }}
            rightIcon={
              <View className="h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                <Feather name="search" size={16} color="#485aff" />
              </View>
            }
          />
        </View>

        {/* Section Header - Left Aligned */}
        <Text className="text-lg font-sans-bold text-gray-950 mb-4 tracking-tight">Browse providers by category</Text>

        {/* Categories Grid */}
        <View className="flex-row flex-wrap justify-between">
          {filteredCategories.map((category) => (
            <Pressable
              key={category.id}
              className="w-[48%] bg-white border border-gray-200 rounded-xl p-3 flex-row justify-between items-center mb-3 active:opacity-80"
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Text
                className="flex-1 text-xs font-sans-semibold text-gray-900 pr-1"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {category.label}
              </Text>
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-indigo-50/70">
                <Feather name={category.icon} size={15} color="#485aff" />
              </View>
            </Pressable>
          ))}

          {filteredCategories.length === 0 && (
            <View className="w-full py-12 items-center justify-center">
              <Text className="text-xs font-sans-medium text-gray-400">
                {`No categories found matching "${searchQuery}"`}
              </Text>
            </View>
          )}
        </View>
      </ContentLayout>

      {/* Role-based Drawer */}
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        title="Menu"
        sections={drawerConfig.sections}
        footerAction={drawerConfig.footerAction}
      />
    </View>
  );
}
