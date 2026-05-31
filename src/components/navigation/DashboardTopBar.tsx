import { View } from 'react-native';

import HeaderIconButton from '@/components/ui/HeaderIconButton';
import TopBar from './TopBar';

interface DashboardTopBarProps {
  onMenuPress: () => void;
  showNotifications?: boolean;
}

export default function DashboardTopBar({ onMenuPress, showNotifications = false }: DashboardTopBarProps) {
  return (
    <View className="-mx-6">
      <TopBar
        containerClassName="bg-transparent"
        includeBottomBorder={false}
        rightContent={
          <View className="flex-row items-center gap-x-3">
            {showNotifications ? <HeaderIconButton icon="bell" accessibilityLabel="Open notifications" /> : null}
            <HeaderIconButton icon="menu" accessibilityLabel="Open menu" onPress={onMenuPress} />
          </View>
        }
      />
    </View>
  );
}
