import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export interface HomeArticleSectionProps {
  title?: string;
  category?: string;
  readTime?: string;
  articleTitle?: string;
  articleDescription?: string;
  onPress?: () => void;
}

export default function HomeArticleSection({
  title = 'Insights & Tips',
  category = 'Growth',
  readTime = '4 min read',
  articleTitle = 'How to Get More Bookings on Sewalo: Tips for New Service Providers',
  articleDescription = "If you're new to Sewalo, your first goal should be to stand out. Here are practical ways to optimize your profile and attract customers.",
  onPress,
}: HomeArticleSectionProps) {
  return (
    <View className="pt-8">
      {/* Standardized Section Header */}
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-xl font-sans-bold tracking-tight text-gray-900">{title}</Text>
      </View>

      {/* Modern & Premium Article Banner Card */}
      <Pressable
        onPress={onPress}
        style={{
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
        className="rounded-2xl border border-gray-200 bg-white p-5 active:opacity-95"
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${articleTitle}`}
      >
        {/* Badge & Metadata Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="rounded-xl bg-[#eef1ff] px-2.5 py-1">
            <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">{category}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Feather name="clock" size={12} color="#94a3b8" />
            <Text className="text-xs font-sans-medium text-gray-400">{readTime}</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-base font-sans-bold text-gray-900 leading-6 mb-2">{articleTitle}</Text>

        {/* Description Preview */}
        <Text className="text-xs font-sans-medium text-gray-500 leading-5 mb-4">{articleDescription}</Text>

        {/* Subtle separator */}
        <View className="border-t border-gray-100 my-1" />

        {/* Call to action footer */}
        <View className="flex-row items-center justify-between pt-3">
          <Text className="text-xs font-sans-bold text-primary">Read Full Article</Text>
          <View className="h-7 w-7 items-center justify-center rounded-full bg-[#eef1ff]">
            <Feather name="arrow-right" size={13} color="#485aff" />
          </View>
        </View>
      </Pressable>
    </View>
  );
}
