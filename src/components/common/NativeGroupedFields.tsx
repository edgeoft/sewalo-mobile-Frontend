import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

interface NativeGroupedFieldsProps {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function NativeGroupedFields({ children, className = '', style }: NativeGroupedFieldsProps) {
  const childrenArray = React.Children.toArray(children).filter(Boolean);

  return (
    <View
      style={[{ borderCurve: 'continuous' }, style]}
      className={`bg-white rounded-xl border border-slate-200/80 overflow-hidden ${className}`}
    >
      {childrenArray.map((child, index) => {
        const isLast = index === childrenArray.length - 1;
        return (
          <View key={index} className={`p-3.5 ${!isLast ? 'border-b border-slate-100' : ''}`}>
            {child}
          </View>
        );
      })}
    </View>
  );
}
