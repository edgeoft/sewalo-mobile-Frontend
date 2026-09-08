import { useState, useRef, useEffect } from 'react';
import { THEME_COLORS } from '@/constants/colors';
import { View, Text, Share, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { SectionHeader } from '@/components/common';
import Button from '@/components/ui/Button';
import { useReferralCodeQuery, useReferralStatsQuery } from '@/api';
import { useAuth } from '@/providers/AuthProvider';
import { useSnackbar } from '@/components/ui/Snackbar';
import ErrorState from '@/components/ui/ErrorState';
import { extractErrorMessage } from '@/api/client/query/errorHandler';
import { WEB_URLS } from '@/constants/urls';
import { ROUTES } from '@/constants/routes';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import ReferralVerificationIllustration from '@/components/illustrations/ReferralVerificationIllustration';

export default function ReferFriendScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const { isVerified, isCompleted } = useVerificationStatus();

  const {
    data: codeData,
    isLoading: codeLoading,
    isError: codeError,
    error: rawCodeError,
    refetch: refetchCode,
  } = useReferralCodeQuery({ enabled: isVerified });

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    error: rawStatsError,
    refetch: refetchStats,
  } = useReferralStatsQuery({ enabled: isVerified });

  const referralCode = codeData?.data?.referral_code || '';
  const referralLink = referralCode ? WEB_URLS.signupReferral(referralCode) : '';
  const totalReferred = statsData?.data?.total_referred || 0;
  const loyaltyPoints = user?.loyalty_points || 0;

  const { showSnackbar } = useSnackbar();
  const isLoading = isVerified && (codeLoading || statsLoading);
  const isError = isVerified && (codeError || statsError);
  const errorMessage = isError ? extractErrorMessage(rawCodeError || rawStatsError) : '';

  const refetchAll = () => {
    refetchCode();
    refetchStats();
  };

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await Clipboard.setStringAsync(referralLink);
      setCopied(true);
      showSnackbar({ message: t('customer.referLinkCopied'), type: 'success' });
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
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
    } catch (error: unknown) {
      showSnackbar({ message: t('customer.failedToShare', { error: extractErrorMessage(error) }), type: 'error' });
    }
  };

  const cardShadow = {
    shadowColor: THEME_COLORS.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 0,
  };

  const renderHowItWorksAndBenefits = () => (
    <>
      {/* How it Works Card */}
      <View style={cardShadow} className="rounded-lg border border-gray-200 bg-white p-4 mb-5">
        <Text className="text-sm font-sans-bold text-gray-900 mb-3.5">{t('customer.howItWorks')}</Text>

        <View className="gap-y-3.5">
          {/* Step 1 */}
          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-lg bg-surface-indigo-subtle items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="share-2" size={14} color={THEME_COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.shareYourLink')}</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5 leading-snug">
                {t('customer.shareYourLinkDesc')}
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-lg bg-surface-indigo-subtle items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="user-check" size={14} color={THEME_COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.theySignUp')}</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5 leading-snug">
                {t('customer.theySignUpDesc')}
              </Text>
            </View>
          </View>

          {/* Step 3 */}
          <View className="flex-row items-start">
            <View className="h-8 w-8 rounded-lg bg-surface-indigo-subtle items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="gift" size={14} color={THEME_COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">{t('customer.youBothEarn')}</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5 leading-snug">
                {t('customer.youBothEarnDesc')}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Benefits Card */}
      <View style={cardShadow} className="rounded-lg border border-gray-200 bg-white p-4 mb-5">
        <Text className="text-sm font-sans-bold text-gray-900 mb-1">{t('customer.benefits')}</Text>

        <View className="divide-y divide-gray-100">
          <View className="flex-row items-start py-3">
            <View className="h-8 w-8 rounded-lg bg-surface-indigo-subtle items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="users" size={14} color={THEME_COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">
                {t('customer.benefitUnlimitedTitle')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
                {t('customer.benefitUnlimitedDesc')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start py-3">
            <View className="h-8 w-8 rounded-lg bg-amber-50 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="zap" size={14} color={THEME_COLORS.amberStar} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">
                {t('customer.benefitInstantRewardsTitle')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
                {t('customer.benefitInstantRewardsDesc')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start py-3">
            <View className="h-8 w-8 rounded-lg bg-emerald-50 items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <Feather name="shield" size={14} color={THEME_COLORS.emeraldSuccess} />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-sans-bold text-gray-900 leading-4">
                {t('customer.benefitPointsNeverExpireTitle')}
              </Text>
              <Text className="text-[11px] font-sans-medium text-gray-500 mt-0.5 leading-snug">
                {t('customer.benefitPointsNeverExpireDesc')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );

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

        {!isVerified ? (
          <>
            {/* Verification Required Card */}
            <View style={cardShadow} className="rounded-lg border border-gray-200 bg-white p-5 mb-5 items-center">
              <ReferralVerificationIllustration />

              <Text className="text-base font-sans-bold text-gray-900 text-center mt-2 mb-1">
                {t('customer.referralVerificationTitle')}
              </Text>
              <Text className="text-xs font-sans-medium text-gray-500 text-center leading-5 mb-4 px-3 max-w-[300px]">
                {isCompleted ? t('customer.referralUnderReviewDesc') : t('customer.referralVerificationDesc')}
              </Text>

              <Button
                title={isCompleted ? t('customer.viewVerificationStatus') : t('customer.verifyNow')}
                onPress={() => router.push(ROUTES.customer.identityVerification)}
                variant="primary"
                size="sm"
                leftIcon={<Feather name="shield" size={13} color={THEME_COLORS.primaryForeground} />}
              />
            </View>

            {renderHowItWorksAndBenefits()}
          </>
        ) : isError && !isLoading ? (
          <ErrorState
            title={t('common.errorTitle')}
            description={errorMessage || t('common.errorDesc')}
            onRetry={refetchAll}
            className="my-4"
          />
        ) : isLoading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text className="text-xs font-sans-medium text-gray-400 mt-3">{t('customer.referralLoading')}</Text>
          </View>
        ) : (
          <>
            {/* 1. Hero Promo Card */}
            <View style={cardShadow} className="rounded-lg bg-primary overflow-hidden p-6 mb-5 relative">
              <View className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10" />
              <View className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/10" />

              <Text className="text-white text-lg font-sans-extrabold leading-6">{t('customer.referHeroTitle')}</Text>
              <Text className="text-white/80 text-xs font-sans-medium leading-5 mt-2">
                {t('customer.referHeroDesc')}
              </Text>
            </View>

            {/* 2. Referral Link Section */}
            <View style={cardShadow} className="rounded-lg border border-gray-200 bg-white p-5 mb-5">
              <Text className="text-xs font-sans-bold text-gray-400 uppercase tracking-wider mb-3">
                {t('customer.yourReferralLink')}
              </Text>

              <View className="flex-row items-center border border-gray-200 rounded-lg px-3 py-3 mb-4 bg-gray-50">
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
                    <Feather
                      name={copied ? 'check' : 'copy'}
                      size={14}
                      color={copied ? THEME_COLORS.primary : THEME_COLORS.primaryForeground}
                    />
                  }
                />
                <Button
                  title={t('customer.share')}
                  onPress={handleShare}
                  variant="primary"
                  className="flex-1 h-11"
                  leftIcon={<Feather name="share-2" size={14} color={THEME_COLORS.primaryForeground} />}
                />
              </View>
            </View>

            {/* 3. Stats Cards */}
            <View className="flex-row gap-x-3 mb-5">
              <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-lg p-4 items-center">
                <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">
                  {t('customer.friendsReferred')}
                </Text>
                <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">{totalReferred}</Text>
              </View>

              <View style={cardShadow} className="flex-1 bg-white border border-gray-200 rounded-lg p-4 items-center">
                <Text className="text-[10px] font-sans-semibold text-gray-400 uppercase">
                  {t('customer.loyaltyPoints')}
                </Text>
                <Text className="text-lg font-sans-extrabold text-gray-900 mt-1">{loyaltyPoints}</Text>
              </View>
            </View>

            {renderHowItWorksAndBenefits()}
          </>
        )}
      </ContentLayout>
    </View>
  );
}
