import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';

interface ContentLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
}

export default function ContentLayout({
  children,
  scrollable = false,
  className = '',
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: ContentLayoutProps) {
  const layoutClassName = `${className} px-4`.trim();

  if (scrollable) {
    return (
      <ScrollView
        style={style}
        className={layoutClassName}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
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
