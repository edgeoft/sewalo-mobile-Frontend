import { memo } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { THEME_COLORS } from '@/constants/colors';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  className?: string;
  titleClassName?: string;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onActionPress,
  className = '',
  titleClassName = '',
}: SectionHeaderProps) {
  return (
    <View className={className}>
      {eyebrow ? (
        <Text className="text-xs font-sans-bold uppercase tracking-wider text-primary mb-2">{eyebrow}</Text>
      ) : null}

      <View className="mb-2 flex-row items-center justify-between gap-2">
        <Text className={`flex-1 text-xl font-sans-extrabold text-gray-950 tracking-tight ${titleClassName}`}>
          {title}
        </Text>

        {actionLabel ? (
          <Pressable
            onPress={onActionPress}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            className="flex-row items-center gap-0.5"
          >
            <Text className="text-[11px] font-sans-medium text-gray-400">{actionLabel}</Text>
            <Feather name="chevron-right" size={13} color={THEME_COLORS.slate400} />
          </Pressable>
        ) : null}
      </View>

      {description ? <Text className="text-sm font-sans-medium text-gray-500 leading-6">{description}</Text> : null}
    </View>
  );
}

export default memo(SectionHeader);
