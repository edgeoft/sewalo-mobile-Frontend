import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

import { useGetBlogsQuery } from '@/api';
import LoadMoreList from '@/components/common/LoadMoreList';
import ContentLayout from '@/components/layout/ContentLayout';
import Header from '@/components/navigation/Header';
import { ROUTES } from '@/constants/routes';
import type { Blog } from '@/types';
import { FALLBACKS, getImageUrl } from '@/utils/image';

import { getReadTime } from '@/utils/text';

export default function BlogListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery({ show: 'all' });

  const handleArticlePress = (blog: Blog) => {
    router.push(ROUTES.blog.detail(blog.slug));
  };

  const sorted = useMemo(() => {
    const blogs = blogsData?.data || [];
    return [...blogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [blogsData]);

  return (
    <View className="flex-1 bg-secondary">
      <Header showBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <ContentLayout>
          {/* Page Title */}
          <View className="py-5">
            <Text className="text-2xl font-sans-bold text-gray-900 tracking-tight">{t('blog.title')}</Text>
            <Text className="text-sm font-sans-medium text-gray-500 mt-1">{t('blog.subtitle')}</Text>
          </View>

          {/* Blogs List */}
          {blogsLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : (
            <LoadMoreList
              data={sorted}
              keyExtractor={(item: Blog) => item.id}
              listClassName="gap-4"
              initialVisibleCount={10}
              pageSize={5}
              renderItem={(item: Blog) => (
                <Pressable
                  onPress={() => handleArticlePress(item)}
                  style={{
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.04,
                    shadowRadius: 10,
                    elevation: 0,
                  }}
                  className="rounded-xl border border-gray-200 bg-white p-3"
                  accessibilityRole="button"
                  accessibilityLabel={`Read article: ${item.title}`}
                >
                  <View className="flex-row gap-3">
                    <Image
                      source={{ uri: getImageUrl(item.img_url) || FALLBACKS.image }}
                      resizeMode="cover"
                      className="h-24 w-24 rounded-xl bg-gray-50"
                    />
                    <View className="flex-1 justify-between py-0.5">
                      <View className="self-start rounded-xl bg-surface-indigo-subtle px-2 py-0.5">
                        <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">
                          {item.category?.name || t('home.growth')}
                        </Text>
                      </View>
                      <Text className="text-base font-sans-bold text-gray-900" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text className="text-xs font-sans-medium text-gray-500" numberOfLines={2}>
                        {item.subtitle || item.description}
                      </Text>
                    </View>
                  </View>
                  <View className="my-2.5 border-t border-gray-100" />
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1">
                        <Feather name="user" size={11} color="#94a3b8" />
                        <Text className="text-[11px] font-sans-medium text-gray-400">{item.author}</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <Feather name="clock" size={11} color="#94a3b8" />
                        <Text className="text-[11px] font-sans-medium text-gray-400">
                          {getReadTime(item.description)}
                        </Text>
                      </View>
                    </View>
                    <View className="rounded-md bg-primary px-4 py-2">
                      <Text className="text-xs font-sans-semibold text-white">{t('common.readMore')}</Text>
                    </View>
                  </View>
                </Pressable>
              )}
              emptyTitle={t('blog.noArticles')}
              emptyDescription={t('blog.noArticlesDesc')}
            />
          )}
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
