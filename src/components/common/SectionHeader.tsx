import { Text, View } from 'react-native';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionHeader({ eyebrow, title, description, className = '' }: SectionHeaderProps) {
  return (
    <View className={className}>
      {eyebrow ? (
        <Text className="text-xs font-sans-bold uppercase tracking-wider text-primary mb-2">{eyebrow}</Text>
      ) : null}
      <Text className="text-xl font-sans-extrabold text-gray-950 tracking-tight mb-2">{title}</Text>
      {description ? <Text className="text-sm font-sans-medium text-gray-500 leading-6">{description}</Text> : null}
    </View>
  );
}
