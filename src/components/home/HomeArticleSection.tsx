import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

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
      {/* Standardized Section Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-sans-bold tracking-tight text-gray-900">{resolvedTitle}</Text>
        {onViewAllPress && (
          <Pressable onPress={onViewAllPress} accessibilityRole="button" accessibilityLabel={t('common.viewAll')}>
            <View className="flex-row items-center gap-0.5">
              <Text className="text-[11px] font-sans-medium text-gray-400">{t('common.viewAll')}</Text>
              <Feather name="chevron-right" size={13} color="#9ca3af" />
            </View>
          </Pressable>
        )}
      </View>

      {/* Modern & Premium Article Banner Card */}
      <Pressable
        onPress={onPress}
        style={{
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 0,
          borderRadius: 10,
        }}
        className="border border-gray-200 bg-white p-5 active:opacity-95"
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${resolvedArticleTitle}`}
      >
        {/* Badge & Metadata Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="rounded-xl bg-[#eef1ff] px-2.5 py-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{resolvedCategory}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Feather name="clock" size={12} color="#94a3b8" />
            <Text className="text-xs font-sans-medium text-gray-400">{resolvedReadTime}</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-base font-sans-bold text-gray-900 leading-6 mb-2">{resolvedArticleTitle}</Text>

        {/* Description Preview */}
        <Text className="text-xs font-sans-medium text-gray-500 leading-5 mb-4">{resolvedArticleDescription}</Text>

        {/* Subtle separator */}
        <View className="border-t border-gray-100 my-1" />

        {/* Call to action footer */}
        <View className="flex-row items-center justify-between pt-3">
          <Text className="text-xs font-sans-bold text-primary">{t('home.readFullArticle')}</Text>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-[#eef1ff]">
            <Feather name="arrow-right" size={13} color="#485aff" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
