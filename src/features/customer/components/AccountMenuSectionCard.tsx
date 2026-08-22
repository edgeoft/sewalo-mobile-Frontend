import React from 'react';
import { View, Text } from 'react-native';
import type { AccountMenuItemId, AccountMenuSection } from '@/types';
import AccountMenuItem from './AccountMenuItem';

interface AccountMenuSectionCardProps {
  section: AccountMenuSection;
  onItemPress: (itemId: AccountMenuItemId) => void;
  rightContentMap?: Partial<Record<AccountMenuItemId, React.ReactNode>>;
}

export default function AccountMenuSectionCard({
  section,
  onItemPress,
  rightContentMap = {},
}: AccountMenuSectionCardProps) {
  const isActionsSection = section.id === 'actions';

  return (
    <View className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {!isActionsSection && (
        <View className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
          <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider">{section.title}</Text>
        </View>
      )}

      {section.items.map((item) => (
        <AccountMenuItem
          key={item.id}
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          destructive={item.destructive}
          showChevron={item.id !== 'logout' && item.id !== 'language'}
          rightContent={rightContentMap[item.id]}
          onPress={() => onItemPress(item.id)}
        />
      ))}
    </View>
  );
}
