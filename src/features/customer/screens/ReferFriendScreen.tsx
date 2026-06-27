import { useState } from 'react';
import { View, Text, Share, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import { useReferralCodeQuery, useReferralStatsQuery } from '@/api';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/components/ui/Snackbar';

const APP_LINK = 'https://sipalu.com';

export default function ReferFriendScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const { data: codeData, isLoading: codeLoading } = useReferralCodeQuery();
  const { data: statsData, isLoading: statsLoading } = useReferralStatsQuery();

  const referralCode = codeData?.data?.referral_code || '';
  const referralLink = referralCode ? `${APP_LINK}/signup?referral=${referralCode}` : '';
  const totalReferred = statsData?.data?.total_referred || 0;
  const loyaltyPoints = user?.loyalty_points || 0;

  const { showSnackbar } = useSnackbar();
  const isLoading = codeLoading || statsLoading;

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await Clipboard.setStringAsync(referralLink);
      setCopied(true);
      showSnackbar({ message: t('customer.referLinkCopied'), type: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showSnackbar({ message: t('customer.failedToCopy'), type: 'error' });
    }
  };

  const handleShare = async () => {
    if (!referralLink) return;
    try {
      await Share.share({
        message: t('customer.shareMessage', { link: referralLink }),
      });
    } catch (error: any) {
      showSnackbar({ message: t('customer.failedToShare', { error: error.message }), type: 'error' });
    }
  };

  const cardShadow = {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header variant="menu" showBackButton={true} showNotifications={false} />

      <ContentLayout
        scrollable
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <SectionHeader
          title={t('customer.referTitle')}
          description={t('customer.referSubtitle')}
          className="mb-5"
          titleClassName="text-2xl text-gray-950 font-sans-extrabold"
        />

        {isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#485aff" />
          </View>
        ) : (
          <>
            {/* 1. Hero Promo Card */}
            <View style={cardShadow} className="rounded-2xl bg-primary overflow-hidden p-6 mb-5 relative">
              <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
              <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10" />

              <Text className="text-white text-lg font-sans-extrabold leading-6">{t('customer.referHeroTitle')}</Text>
              <Text className="text-white/80 text-xs font-sans-medium leading-5 mt-2">
                {t('customer.referHeroDesc')}
              </Text>
            </View>

            {/* 2. Referral Link Section */}
            <View style={cardShadow} className="rounded-xl border border-gray-200 bg-white p-5 mb-5">
              <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">
                {t('customer.yourReferralLink')}
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-xl px-3 py-3 mb-4 bg-gray-50">
                <Text className="flex-1 text-xs font-sans-medium text-gray-600" numberOfLines={1}>
                  {referralLink || t('customer.noReferralCode')}
                </Text>
              </View>

              <View className="flex-row gap-3">
                <Button
                  title={copied ? t('common.copied') : t('customer.copyLink')}
                  onPress={handleCopyLink}
                  variant={copied ? 'outline' : 'primary'}
                  className="flex-1 h-11"
                  leftIcon={
                    <Feather name={copied ? 'check' : 'copy'} size={14} color={copied ? '#485aff' : '#ffffff'} />
                  }
                />
                <Button
                  title={t('customer.share')}
                  onPress={handleShare}
                  variant="primary"
                  className="flex-1 h-11"
                  leftIcon={<Feather name="share-2" size={14} color="#ffffff" />}
                />
              </View>
            </View>

            {/* 3. Stats Cards */}
            <View className="flex-row gap-x-3 mb-5">
              <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center">
                <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">
                  {t('customer.friendsReferred')}
                </Text>
                <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">{totalReferred}</Text>
              </View>

              <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-xl p-4 items-center">
                <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">
                  {t('customer.loyaltyPoints')}
                </Text>
                <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">{loyaltyPoints}</Text>
              </View>
            </View>

            {/* 4. How it Works */}
            <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('customer.howItWorks')}</Text>
            <View className="gap-y-4 mb-5">
              <View className="flex-row items-start">
                <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
                  <Feather name="send" size={14} color="#485aff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.shareYourLink')}</Text>
                  <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                    {t('customer.shareYourLinkDesc')}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
                  <Feather name="user-plus" size={14} color="#485aff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.theySignUp')}</Text>
                  <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                    {t('customer.theySignUpDesc')}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-0.5">
                  <Feather name="award" size={14} color="#485aff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.youBothEarn')}</Text>
                  <Text className="text-[11px] font-sans-medium text-gray-400 mt-1 leading-4">
                    {t('customer.youBothEarnDesc')}
                  </Text>
                </View>
              </View>
            </View>

            {/* 5. Benefits */}
            <Text className="text-sm font-sans-bold text-gray-900 mb-3 ml-1">{t('customer.benefits')}</Text>
            <View className="gap-y-3 mb-5">
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                <Feather name="users" size={16} color="#485aff" />
                <Text className="text-xs font-sans-medium text-gray-700 ml-3">{t('customer.benefitUnlimited')}</Text>
              </View>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                <Feather name="zap" size={16} color="#485aff" />
                <Text className="text-xs font-sans-medium text-gray-700 ml-3">
                  {t('customer.benefitInstantRewards')}
                </Text>
              </View>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5">
                <Feather name="clock" size={16} color="#485aff" />
                <Text className="text-xs font-sans-medium text-gray-700 ml-3">
                  {t('customer.benefitPointsNeverExpire')}
                </Text>
              </View>
            </View>
          </>
        )}
      </ContentLayout>
    </View>
  );
}
