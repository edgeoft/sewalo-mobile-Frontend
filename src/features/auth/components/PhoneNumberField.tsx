import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

interface PhoneNumberFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder: string;
  error?: string;
}

export default function PhoneNumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  error,
}: PhoneNumberFieldProps<TFieldValues>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="w-full">
      {label ? <Text className="text-xs font-sans-semibold text-gray-700 mb-1.5 ml-0.5">{label}</Text> : null}
      <View
        className={`form-input-container form-input-container-single ${
          error ? 'form-input-container-error' : isFocused ? 'form-input-container-focus' : ''
        }`}
        style={{
          shadowColor: isFocused ? '#485aff' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isFocused ? 0.08 : 0.015,
          shadowRadius: isFocused ? 4 : 2,
          elevation: isFocused ? 2 : 0,
        }}
      >
        <View className="flex-row items-center pr-2.5">
          <Text className="text-base mr-1">🇳🇵</Text>
          <Text className="text-sm font-sans-semibold text-gray-800">+977</Text>
        </View>

        <View className="w-[1px] h-6 bg-gray-200 mr-3.5" />

        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder={placeholder}
              placeholderTextColor="#898f8f"
              value={String(value ?? '')}
              onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                onBlur();
              }}
              keyboardType="phone-pad"
              maxLength={10}
              className="form-input-text"
              style={{
                includeFontPadding: false,
                textAlignVertical: 'center',
                padding: 0,
              }}
            />
          )}
        />
      </View>

      {error ? <Text className="text-xs font-sans-medium text-destructive mt-1.5 ml-1">{error}</Text> : null}
    </View>
  );
}
