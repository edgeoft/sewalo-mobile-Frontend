import { Text } from 'react-native';

import ContentLayout from '@/components/layout/ContentLayout';

interface PlaceholderScreenProps {
  title: string;
}

export default function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <ContentLayout className="flex-1 items-center justify-center bg-secondary">
      <Text className="text-xl font-sans-bold text-gray-900">{title}</Text>
    </ContentLayout>
  );
}
