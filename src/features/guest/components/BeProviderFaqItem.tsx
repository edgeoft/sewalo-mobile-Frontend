import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

interface BeProviderFaqItemProps {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

export default function BeProviderFaqItem({ question, answer, defaultOpen = false }: BeProviderFaqItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View className="rounded-xl border border-gray-100/80 bg-white overflow-hidden">
      <Pressable
        onPress={() => setIsOpen((value) => !value)}
        className="flex-row items-center justify-between p-4 active:opacity-80"
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={question}
      >
        <Text className="flex-1 text-sm font-sans-bold text-gray-900 pr-4">{question}</Text>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#64748b" />
      </Pressable>

      {isOpen ? (
        <View className="px-4 pb-4">
          <Text className="text-xs font-sans-medium text-gray-500 leading-5">{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}
