import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

interface ProviderHeaderCardProps {
  avatarUri: string;
  name: string;
  isVerified: boolean;
  serviceLabel: string;
  location: string;
  rating: string;
  reviewCount: number;
  isSaved: boolean;
  onReviewPress?: () => void;
  onSharePress?: () => void;
  onFavoritePress?: () => void;
}

export default function ProviderHeaderCard({
  avatarUri,
  name,
  isVerified,
  serviceLabel,
  location,
  rating,
  reviewCount,
  isSaved,
  onReviewPress,
  onSharePress,
  onFavoritePress,
}: ProviderHeaderCardProps) {
  return (
    <View className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-start" style={styles.shadowMd}>
      <Image source={{ uri: avatarUri }} className="h-20 w-20 rounded-xl bg-gray-50 mr-4" resizeMode="cover" />

      <View className="flex-1 justify-between py-0.5">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center flex-wrap mb-1">
              <Text className="text-lg font-sans-extrabold text-gray-950 pr-1">{name}</Text>
              {isVerified && (
                <View className="bg-primary rounded-full h-4 w-4 items-center justify-center">
                  <Feather name="check" size={10} color="#ffffff" />
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-2 mb-2">
              <View className="rounded-xl bg-[#eef1ff] px-2.5 py-0.5">
                <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{serviceLabel}</Text>
              </View>

              <Pressable className="flex-row items-center gap-1.5 active:opacity-60" onPress={onReviewPress}>
                <Feather name="star" size={12} color="#fbbf24" fill="#fbbf24" />
                <Text className="text-[11px] font-sans-bold text-gray-900">{rating}</Text>
                <Text className="text-[11px] font-sans-medium text-gray-400">
                  ({reviewCount > 0 ? `${reviewCount} Reviews` : 'No Reviews'})
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Action buttons (Share & Favorite) inside the card */}
          <View className="flex-row items-center gap-x-2">
            <Pressable
              onPress={onSharePress}
              className="h-7 w-7 items-center justify-center rounded-xl bg-gray-50 active:opacity-75"
            >
              <Feather name="share-2" size={14} color="#64748b" />
            </Pressable>
            <Pressable
              onPress={onFavoritePress}
              className="h-7 w-7 items-center justify-center rounded-xl bg-gray-50 active:opacity-75"
            >
              <MaterialIcons name="favorite" size={14} color={isSaved ? '#ef4444' : '#64748b'} />
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center gap-1 mt-1">
          <Feather name="map-pin" size={12} color="#64748b" />
          <Text className="flex-1 text-xs font-sans-medium text-gray-500" numberOfLines={1}>
            {location}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowMd: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
});
