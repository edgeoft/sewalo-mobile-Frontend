import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import SectionHeader from '@/components/common/SectionHeader';
import { THEME_COLORS } from '@/constants/colors';

export interface HomeArticleSectionProps {
  title?: string;
  category?: string;
  readTime?: string;
  articleTitle?: string;
  articleDescription?: string;
  onPress?: () => void;
  onViewAllPress?: () => void;
}

export default function HomeArticleSection({
  title,
  category,
  readTime,
  articleTitle,
  articleDescription,
  onPress,
  onViewAllPress,
}: HomeArticleSectionProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('home.insightsAndTips');
  const resolvedCategory = category ?? t('home.growth');
  const resolvedReadTime = readTime ?? t('common.minRead', { time: '4' });
  const resolvedArticleTitle = articleTitle ?? t('home.defaultArticleTitle');
  const resolvedArticleDescription = articleDescription ?? t('home.defaultArticleDescription');
  return (
    <View className="pt-5">
      <SectionHeader
        title={resolvedTitle}
        actionLabel={onViewAllPress ? t('common.viewAll') : undefined}
        onActionPress={onViewAllPress}
        className="mb-5"
      />

      <Pressable
        onPress={onPress}
        className="border border-gray-200 bg-white p-5 rounded-xl active:opacity-95"
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${resolvedArticleTitle}`}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="rounded-xl bg-surface-indigo-subtle px-2.5 py-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{resolvedCategory}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Feather name="clock" size={12} color={THEME_COLORS.slate400} />
            <Text className="text-xs font-sans-medium text-gray-400">{resolvedReadTime}</Text>
          </View>
        </View>

        <Text className="text-base font-sans-bold text-gray-900 leading-6 mb-2">{resolvedArticleTitle}</Text>

        <Text className="text-xs font-sans-medium text-gray-500 leading-5 mb-4">{resolvedArticleDescription}</Text>

        <View className="border-t border-gray-100 my-1" />

        <View className="flex-row items-center justify-between pt-3">
          <Text className="text-xs font-sans-bold text-primary">{t('home.readFullArticle')}</Text>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-indigo-subtle">
            <Feather name="arrow-right" size={13} color={THEME_COLORS.primary} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
