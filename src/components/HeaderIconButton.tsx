import { Feather } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Pressable } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface HeaderIconButtonProps {
  icon: FeatherIconName;
  accessibilityLabel: string;
  onPress?: () => void;
}

export default function HeaderIconButton({ icon, accessibilityLabel, onPress }: HeaderIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name={icon} size={18} color="#0f172a" />
    </Pressable>
  );
}
