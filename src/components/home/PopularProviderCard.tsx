import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

export interface PopularProviderCardProps {
  avatarUri: string;
  name: string;
  serviceLabel: string;
  location: string;
  ordersCompleted: string;
  rating: string;
  startingFromPrice: string;
  width?: number;
  onPress?: () => void;
}

export default function PopularProviderCard({
  avatarUri,
  name,
  serviceLabel,
  location,
  ordersCompleted,
  rating,
  startingFromPrice,
  width,
  onPress,
}: PopularProviderCardProps) {
  const renderIcon = (icon: FeatherIconName, color: string, size: number) => (
    <Feather name={icon} size={size} color={color} />
  );

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        },
        width ? { width } : {},
      ]}
      className="shrink-0 rounded-xl border border-gray-200 bg-white p-3"
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      {/* Top Section: Image on Left, Details on Right */}
      <View className="flex-row gap-3">
        {/* Left Side: Photo */}
        <Image source={{ uri: avatarUri }} resizeMode="cover" className="h-24 w-24 rounded-xl bg-gray-50" />

        {/* Right Side: Info & Metadata */}
        <View className="flex-1 justify-between py-0.5">
          {/* Header: Name & Save Icon */}
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-base font-sans-bold text-gray-900" numberOfLines={1}>
              {name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Save ${name}`}
              className="ml-2 h-7 w-7 items-center justify-center rounded-xl bg-gray-50"
            >
              {renderIcon('heart', '#94a3b8', 14)}
            </Pressable>
          </View>

          {/* Middle Row: Tag Badge & Rating */}
          <View className="flex-row items-center gap-2">
            <View className="rounded-xl bg-[#eef1ff] px-2 py-0.5">
              <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{serviceLabel}</Text>
            </View>

            <View className="flex-row items-center gap-1 rounded-xl bg-[#fff6e6] px-2 py-0.5">
              {renderIcon('star', '#fbbf24', 11)}
              <Text className="text-[10px] font-sans-bold text-gray-900">{rating}</Text>
            </View>
          </View>

          {/* Bottom Info: Location & Completed Count */}
          <View className="gap-1 mt-1">
            <View className="flex-row items-center gap-1">
              {renderIcon('map-pin', '#64748b', 12)}
              <Text className="flex-1 text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                {location}
              </Text>
            </View>

            <View className="flex-row items-center gap-1">
              {renderIcon('award', '#64748b', 12)}
              <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={1}>
                {ordersCompleted}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="my-2.5 border-t border-gray-100" />

      {/* Bottom Section: Pricing & Action Button */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-xs font-sans-medium text-gray-400">Starting from </Text>
          <Text className="text-sm font-sans-bold text-primary">{startingFromPrice}</Text>
        </View>

        <View className="rounded-md bg-primary px-4 py-2">
          <Text className="text-xs font-sans-semibold text-white">View Details</Text>
        </View>
      </View>
    </Pressable>
  );
}
