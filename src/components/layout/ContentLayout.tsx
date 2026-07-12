import { memo, ReactNode } from 'react';
import { useRefreshControl } from '@/hooks/useRefreshControl';
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
  enableRefresh?: boolean;
}

function ContentLayout({
  children,
  scrollable = false,
  className = '',
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onRefresh,
  refreshing,
  enableRefresh = false,
}: ContentLayoutProps) {
  const { refreshing: hookRefreshing, onRefresh: hookOnRefresh } = useRefreshControl();

  const handleRefresh = onRefresh || hookOnRefresh;
  const isRefreshing = refreshing !== undefined ? refreshing : hookRefreshing;
  const hasRefresh = !!onRefresh || enableRefresh;

  const layoutClassName = `${className} px-4`.trim();

  if (scrollable) {
    return (
      <ScrollView
        style={style}
        className={layoutClassName}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={
          hasRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#485aff"
              colors={['#485aff']}
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
