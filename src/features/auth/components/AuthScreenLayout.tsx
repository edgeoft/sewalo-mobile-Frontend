import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  showBackButton?: boolean;
  justifyContent?: 'flex-start' | 'space-between';
  bottomPadding?: number;
  topPadding?: number;
}

export default function AuthScreenLayout({
  title,
  subtitle,
  children,
  showBackButton = false,
  justifyContent = 'flex-start',
  bottomPadding = 24,
  topPadding = 28,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-secondary">
      <Header showBackButton={showBackButton} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent,
          paddingBottom: Math.max(insets.bottom, bottomPadding),
          paddingTop: topPadding,
        }}
      >
        <View className="flex-1 justify-start">
          <View>
            <Text className="text-2xl font-sans-extrabold text-gray-900 text-left mb-1" style={{ letterSpacing: -0.8 }}>
              {title}
            </Text>
            <Text className="text-sm font-sans-medium text-gray-500 text-left leading-5 mb-8">{subtitle}</Text>
          </View>

          {children}
        </View>
      </ContentLayout>
    </KeyboardAvoidingView>
  );
}
