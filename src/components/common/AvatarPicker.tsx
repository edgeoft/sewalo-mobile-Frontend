import React from 'react';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from '@/components/ui/Snackbar';
import { THEME_COLORS } from '@/constants/colors';

export interface AvatarPickerProps {
  avatarUri?: string | null;
  onAvatarChange: (uri: string) => void;
  size?: number;
  className?: string;
}

export default function AvatarPicker({ avatarUri, onAvatarChange, size = 96, className = '' }: AvatarPickerProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showSnackbar({
        message: t('common.galleryPermissionRequired', 'Permission to access gallery is required.'),
        type: 'error',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      onAvatarChange(result.assets[0].uri);
    }
  };

  return (
    <View className={`items-center justify-center ${className}`}>
      <Pressable
        onPress={handlePickImage}
        className="relative active:opacity-90"
        accessibilityRole="button"
        accessibilityLabel={t('common.changeAvatar', 'Change profile photo')}
        hitSlop={8}
      >
        <View
          style={{ width: size, height: size, borderRadius: size / 2 }}
          className="bg-secondary border-2 border-background overflow-hidden items-center justify-center"
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: size, height: size }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          ) : (
            <Feather name="user" size={size * 0.45} color={THEME_COLORS.slate400} />
          )}
        </View>
        <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-background items-center justify-center">
          <Feather name="camera" size={14} color={THEME_COLORS.primaryForeground} />
        </View>
      </Pressable>
    </View>
  );
}
