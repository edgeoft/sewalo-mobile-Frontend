import { Text, View } from 'react-native';

export interface CountryCodeSelectorProps {
  className?: string;
}

export default function CountryCodeSelector({ className = '' }: CountryCodeSelectorProps) {
  return (
    <View
      className={`flex-row items-center justify-center border border-gray-100 rounded-xl h-14 px-4 bg-white ${className}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.015,
        shadowRadius: 2,
        elevation: 0,
      }}
    >
      <Text className="text-lg mr-1.5">🇳🇵</Text>
      <Text className="text-base font-sans-semibold text-gray-900">+977</Text>
    </View>
  );
}
