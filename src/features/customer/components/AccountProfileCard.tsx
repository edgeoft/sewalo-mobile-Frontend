import React from 'react';
import { View, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { UserProfile } from '@/types';
import { USER_ROLES, USER_STATUSES } from '@/constants/roles';
import { THEME_COLORS } from '@/constants/colors';
import { getImageUrl } from '@/utils/image';

interface AccountProfileCardProps {
  user: UserProfile | null;
  role: typeof USER_ROLES.Customer | typeof USER_ROLES.Provider;
}

export default function AccountProfileCard({ user, role }: AccountProfileCardProps) {
  const { t } = useTranslation();

  const isProvider = role === USER_ROLES.Provider;
  const isVerified = user?.status === USER_STATUSES.Verified;

  const defaultAvatar = require('@/assets/images/avatar-default.png');
  const avatarSource = user?.avatar ? { uri: getImageUrl(user.avatar) } : defaultAvatar;

  const displayName = isProvider ? user?.name || t('provider.partner') : user?.name || t('customer.guestUser');

  return (
    <View className="rounded-xl border border-gray-200 bg-white p-4 mb-5 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="relative">
          <Image
            source={avatarSource}
            className="h-16 w-16 rounded-full border border-gray-100 bg-gray-50"
            resizeMode="cover"
          />
          {isProvider ? (
            isVerified && (
              <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-primary border-2 border-white items-center justify-center">
                <Feather name="check" size={10} color={THEME_COLORS.primaryForeground} />
              </View>
            )
          ) : (
            <View className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-emerald-500 border-2 border-white items-center justify-center" />
          )}
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-base font-sans-extrabold text-gray-900 leading-5">{displayName}</Text>
          <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
            {user?.email || (isProvider ? t('provider.noEmail') : t('customer.noEmail'))}
          </Text>
          <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">
            {user?.phone || (isProvider ? t('provider.noPhone') : t('customer.noPhone'))}
          </Text>

          {isProvider && (
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <View className="flex-row items-center gap-0.5">
                <Feather name="star" size={10} color={THEME_COLORS.amberStar} />
                <Text className="text-[10px] font-sans-bold text-gray-600">
                  {Number(user?.average_rating || user?.avg_rating || 0).toFixed(1)}
                </Text>
                <Text className="text-[10px] font-sans-medium text-gray-400">
                  ({user?.total_ratings || (user?.avg_rating ? 1 : 0)})
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
