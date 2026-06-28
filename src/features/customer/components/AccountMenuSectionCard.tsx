import React from 'react';
import { View, Text } from 'react-native';
import AccountMenuItem from './AccountMenuItem';

export interface AccountMenuItemOption {
  id: string;
  icon: any;
  title: string;
  subtitle: string;
  destructive?: boolean;
}

export interface AccountMenuSection {
  id: string;
  title: string;
  items: AccountMenuItemOption[];
}

interface AccountMenuSectionCardProps {
  section: AccountMenuSection;
  onItemPress: (itemId: string) => void;
  rightContentMap?: Record<string, React.ReactNode>;
}

export default function AccountMenuSectionCard({
  section,
  onItemPress,
  rightContentMap = {},
}: AccountMenuSectionCardProps) {
  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  const isActionsSection = section.id === 'actions';

  return (
    <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
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
