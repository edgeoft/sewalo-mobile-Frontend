import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

interface PasswordRequirementsProps {
  password: string;
  labels: {
    title: string;
    length: string;
    uppercase: string;
    number: string;
    special: string;
  };
}

const requirements = [
  { key: 'length', test: (value: string) => value.length >= 8 },
  { key: 'uppercase', test: (value: string) => /[A-Z]/.test(value) },
  { key: 'number', test: (value: string) => /[0-9]/.test(value) },
  { key: 'special', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

function getRequirementState(password: string, isMet: boolean) {
  if (password.length === 0) {
    return { icon: 'circle' as const, color: '#898f8f', textClassName: 'text-gray-500 font-sans-medium' };
  }

  if (isMet) {
    return { icon: 'check-circle' as const, color: '#10b981', textClassName: 'text-emerald-600 font-sans-medium' };
  }

  return { icon: 'circle' as const, color: '#ef4444', textClassName: 'text-destructive font-sans-medium' };
}

export default function PasswordRequirements({ password, labels }: PasswordRequirementsProps) {
  return (
    <View className="mt-2 px-0.5 gap-y-1">
      <Text className="text-xs font-sans-bold text-gray-500 mb-0.5">{labels.title}</Text>
      {requirements.map((requirement) => {
        const state = getRequirementState(password, requirement.test(password));

        return (
          <View key={requirement.key} className="flex-row items-center">
            <Feather name={state.icon} size={11} color={state.color} style={{ marginRight: 6 }} />
            <Text className={`text-xs ${state.textClassName}`}>{labels[requirement.key]}</Text>
          </View>
        );
      })}
    </View>
  );
}
