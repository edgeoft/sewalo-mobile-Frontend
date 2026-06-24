import React from 'react';
import { ScrollView, Text, View, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import Header from '@/components/navigation/Header';
import ContentLayout from '@/components/layout/ContentLayout';
import { useGetBlogBySlugQuery } from '@/api';
import { getImageUrl } from '@/utils/image';

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: blogData, isLoading } = useGetBlogBySlugQuery(slug || '');
  const blog = blogData?.data;

  const cleanDescription = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
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
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-secondary justify-center items-center">
        <ActivityIndicator size="large" color="#485aff" />
      </View>
    );
  }

  if (!blog) {
    return (
      <View className="flex-1 bg-secondary">
        <Header showBackButton />
        <View className="flex-1 justify-center items-center p-5">
          <Feather name="alert-circle" size={48} color="#ef4444" />
          <Text className="text-base font-sans-bold text-gray-900 mt-4">Article Not Found</Text>
          <Text className="text-sm font-sans-medium text-gray-500 text-center mt-2 leading-5">
            The article you are looking for does not exist or has been removed.
          </Text>
        </View>
      </View>
    );
  }

  const imgUri = getImageUrl(blog.img_url) || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643';

  return (
    <View className="flex-1 bg-secondary">
      <Header showBackButton />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-12">
        <Image source={{ uri: imgUri }} className="w-full h-64 bg-gray-100" resizeMode="cover" />

        <ContentLayout>
          {/* Category & Read Time */}
          <View className="flex-row items-center justify-between mt-6 mb-4">
            <View className="rounded-xl bg-[#eef1ff] px-3 py-1">
              <Text className="text-[10px] font-sans-bold uppercase tracking-wider text-primary">
                {blog.category?.name || 'General'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <Feather name="clock" size={13} color="#94a3b8" />
              <Text className="text-xs font-sans-medium text-gray-500">{getReadTime(blog.description)}</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text className="text-2xl font-sans-bold text-gray-900 leading-8 mb-3">{blog.title}</Text>

          {blog.subtitle && (
            <Text className="text-base font-sans-semibold text-gray-500 leading-6 mb-4">{blog.subtitle}</Text>
          )}

          {/* Author info */}
          <View className="flex-row items-center border-y border-gray-100 py-3 mb-6">
            <View className="h-9 w-9 rounded-full bg-gray-200 justify-center items-center mr-3">
              <Feather name="user" size={16} color="#64748b" />
            </View>
            <View>
              <Text className="text-xs font-sans-bold text-gray-800">Published by {blog.author}</Text>
              <Text className="text-[11px] font-sans-medium text-gray-400 mt-0.5">{formatDate(blog.created_at)}</Text>
            </View>
          </View>

          {/* Description / Content Body */}
          <Text className="text-sm font-sans-medium text-gray-700 leading-6 tracking-wide">
            {cleanDescription(blog.description)}
          </Text>
        </ContentLayout>
      </ScrollView>
    </View>
  );
}
