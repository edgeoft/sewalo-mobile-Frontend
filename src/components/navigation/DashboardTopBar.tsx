import { StatusBar } from 'expo-status-bar';
import { Animated } from 'react-native';

import Header from './Header';

interface DashboardTopBarProps {
  onMenuPress: () => void;
  onNotificationsPress?: () => void;
  showNotifications?: boolean;
  isScrolled?: boolean;
  scrollYAnimated?: Animated.Value;
}

export default function DashboardTopBar({
  onMenuPress,
  onNotificationsPress,
  showNotifications = false,
  isScrolled = false,
  scrollYAnimated,
}: DashboardTopBarProps) {
  const backgroundColor = scrollYAnimated
    ? scrollYAnimated.interpolate({
        inputRange: [0, 50],
        outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
        extrapolate: 'clamp',
      })
    : isScrolled
      ? 'rgba(255, 255, 255, 1)'
      : 'rgba(255, 255, 255, 0)';

  const borderBottomColor = scrollYAnimated
    ? scrollYAnimated.interpolate({
        inputRange: [0, 50],
        outputRange: ['rgba(226, 232, 240, 0)', 'rgba(226, 232, 240, 1)'],
        extrapolate: 'clamp',
      })
    : isScrolled
      ? 'rgba(226, 232, 240, 1)'
      : 'rgba(226, 232, 240, 0)';

  const shadowOpacity = scrollYAnimated
    ? scrollYAnimated.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 0.04],
        extrapolate: 'clamp',
      })
    : isScrolled
      ? 0.04
      : 0;

  const elevation = scrollYAnimated
    ? scrollYAnimated.interpolate({
        inputRange: [0, 50],
        outputRange: [0, 2],
        extrapolate: 'clamp',
      })
    : isScrolled
      ? 2
      : 0;

  return (
    <Animated.View
      style={{
        backgroundColor,
        borderBottomColor,
        borderBottomWidth: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity,
        shadowRadius: 10,
        elevation,
      }}
      className="-mx-6"
    >
      <StatusBar style="dark" />
      <Header
        variant="menu"
        onMenuPress={onMenuPress}
        onNotificationsPress={onNotificationsPress}
        showNotifications={showNotifications}
        containerClassName="bg-transparent"
        includeBottomBorder={false}
      />
    </Animated.View>
  );
}
