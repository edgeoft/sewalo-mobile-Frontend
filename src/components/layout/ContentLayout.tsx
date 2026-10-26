import { memo } from 'react';
import type { ReactNode, Ref } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';

interface ContentLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  scrollRef?: Ref<ScrollView>;
}

function ContentLayout({
  children,
  scrollable = false,
  className = '',
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onRefresh,
  refreshing = false,
  scrollRef,
}: ContentLayoutProps) {
  const layoutClassName = `w-full max-w-2xl self-center px-4 ${className}`.trim();

  if (scrollable) {
    return (
      <ScrollView
        ref={scrollRef}
        style={style}
        className={layoutClassName}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME_COLORS.primary}
              colors={[THEME_COLORS.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={style} className={layoutClassName}>
      {children}
    </View>
  );
}

export default memo(ContentLayout);
