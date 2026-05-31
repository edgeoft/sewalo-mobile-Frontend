import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import Input from '@/components/Input';

interface PasswordFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  error?: string;
}

export default function PasswordField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
}: PasswordFieldProps<TFieldValues>) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          value={String(value ?? '')}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={!isVisible}
          error={error}
          rightIcon={
            <Pressable onPress={() => setIsVisible((current) => !current)} hitSlop={8} className="active:opacity-60">
              <Feather name={isVisible ? 'eye' : 'eye-off'} size={18} color="#898f8f" />
            </Pressable>
          }
        />
      )}
    />
  );
}
