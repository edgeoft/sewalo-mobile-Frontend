import { memo, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleProp, View, ViewStyle } from 'react-native';

interface ContentLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  onRefresh?: () => Promise<void> | void;
  refreshing?: boolean;
  scrollRef?: React.Ref<ScrollView>;
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
  const layoutClassName = `${className} px-4`.trim();

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#485aff" colors={['#485aff']} />
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
