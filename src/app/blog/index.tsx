import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View, Pressable, Image, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import PaginationList from '@/components/common/PaginationList';
import { useGetBlogsQuery, useGetBlogCategoriesQuery } from '@/api';
import { ROUTES } from '@/constants/routes';
import { getImageUrl } from '@/utils/image';
import type { Blog } from '@/types';

export default function BlogListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetBlogCategoriesQuery();
  const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery({
    search: search.trim() ? search : undefined,
    category_id: selectedCategoryId,
    show: 'all',
  });

  const categories = categoriesData?.data || [];
  const blogs = blogsData?.data || [];

  const handleArticlePress = (blog: Blog) => {
    router.push(ROUTES.blog.detail(blog.slug) as any);
  };

  const getReadTime = (description: string) => {
    const words = description.split(/\s+/).length;
    const time = Math.max(1, Math.ceil(words / 200));
    return `${time} min read`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <View className="flex-1 bg-secondary">
      <Header showBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        <ContentLayout>
          {/* Page Title */}
          <View className="py-5">
            <Text className="text-2xl font-sans-bold text-gray-900 tracking-tight">Insights & Tips</Text>
            <Text className="text-sm font-sans-medium text-gray-500 mt-1">
              Discover tips, guides, and trends to grow your skills and find the best services.
            </Text>
          </View>

          {/* Search Input */}
          <View className="mb-5 flex-row items-center border border-gray-200 bg-white rounded-xl px-4 py-2.5 shadow-sm">
            <Feather name="search" size={18} color="#94a3b8" className="mr-2" />
            <TextInput
              placeholder="Search articles..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#94a3b8"
              className="flex-1 text-sm font-sans-medium text-gray-900 p-0"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          {/* Categories Tab Scroll */}
          {categoriesLoading ? (
            <View className="h-10 justify-center">
              <ActivityIndicator size="small" color="#485aff" />
            </View>
          ) : (
            categories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 mb-6">
                <Pressable
                  onPress={() => setSelectedCategoryId(undefined)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategoryId === undefined ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text
                    className={`text-xs font-sans-semibold ${
                      selectedCategoryId === undefined ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    All Topics
                  </Text>
                </Pressable>

                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => setSelectedCategoryId(category.id)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategoryId === category.id ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-sans-semibold ${
                        selectedCategoryId === category.id ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )
          )}

          {/* Blogs List */}
          {blogsLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" color="#485aff" />
            </View>
          ) : (
            <PaginationList
              data={blogs}
              pageSize={5}
              keyExtractor={(item: Blog) => item.id}
              emptyTitle="No articles found"
              emptyDescription="We couldn't find any articles matching your request."
              renderItem={(item: Blog) => {
                const imgUri =
                  getImageUrl(item.img_url) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643';
                return (
                  <Pressable
                    onPress={() => handleArticlePress(item)}
                    style={{
                      shadowColor: '#0f172a',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.04,
                      shadowRadius: 10,
                      elevation: 2,
                    }}
                    className="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-4"
                  >
                    <Image source={{ uri: imgUri }} className="w-full h-44 bg-gray-100" resizeMode="cover" />

                    <View className="p-5">
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="rounded-xl bg-[#eef1ff] px-2.5 py-1">
                          <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">
                            {item.category?.name || 'General'}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1.5">
                          <Feather name="clock" size={12} color="#94a3b8" />
                          <Text className="text-xs font-sans-medium text-gray-400">
                            {getReadTime(item.description)}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-base font-sans-bold text-gray-900 leading-6 mb-2">{item.title}</Text>

                      {item.subtitle && (
                        <Text className="text-xs font-sans-medium text-gray-500 leading-5 mb-3" numberOfLines={2}>
                          {item.subtitle}
                        </Text>
                      )}

                      <View className="border-t border-gray-100 pt-3 flex-row justify-between items-center">
                        <Text className="text-[11px] font-sans-semibold text-gray-400">
                          By {item.author} • {formatDate(item.created_at)}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Text className="text-xs font-sans-bold text-primary">Read More</Text>
                          <Feather name="chevron-right" size={12} color="#485aff" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
