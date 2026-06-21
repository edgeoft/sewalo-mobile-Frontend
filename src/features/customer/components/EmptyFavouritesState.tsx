import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface EmptyFavouritesStateProps {
  title?: string;
  description?: string;
}

export default function EmptyFavouritesState({
  title = 'No saved favourites yet',
  description = 'Tap the heart icon on any service provider card to add them to your saved list.',
}: EmptyFavouritesStateProps) {
  return (
    <View className="rounded-2xl border border-gray-200 bg-white px-5 py-10 items-center">
      <Svg width={126} height={96} viewBox="0 0 126 96">
        {/* Card base backdrop */}
        <Rect x="19" y="14" width="88" height="68" rx="14" fill="#fef2f2" />
        <Rect x="25" y="20" width="76" height="56" rx="10" fill="#ffffff" />

        {/* Lines layout mock representing a service card */}
        <Rect x="35" y="32" width="22" height="6" rx="3" fill="#fee2e2" />
        <Rect x="35" y="44" width="56" height="6" rx="3" fill="#f8fafc" />
        <Rect x="35" y="56" width="38" height="6" rx="3" fill="#f8fafc" />

        {/* Floating heart icon badge on top right */}
        <Circle cx="98" cy="26" r="14" fill="#ef4444" />
        <Path d="M98 31s-5-2.7-5-5.5a2.5 2.5 0 0 1 4.5-1.5 2.5 2.5 0 0 1 4.5 1.5c0 2.8-5 5.5-5 5.5z" fill="#ffffff" />

        {/* Bottom design elements */}
        <Circle cx="18" cy="68" r="8" fill="#f1f5f9" />
      </Svg>

      <Text className="text-sm font-sans-bold text-gray-900 mt-4 mb-1">{title}</Text>
      <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 max-w-[280px]">{description}</Text>
    </View>
  );
}
