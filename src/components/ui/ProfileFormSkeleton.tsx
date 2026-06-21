import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './Skeleton';
import ContentLayout from '../layout/ContentLayout';

export default function ProfileFormSkeleton() {
  return (
    <ContentLayout scrollable className="flex-1" contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
      {/* Title */}
      <View className="mb-6">
        <Skeleton width={150} height={28} className="mb-2" />
        <Skeleton width="100%" height={16} />
      </View>

      {/* Avatar */}
      <View className="items-center mb-8">
        <Skeleton width={100} height={100} borderRadius={50} />
      </View>

      {/* Inputs */}
      <View className="gap-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i}>
            <Skeleton width={100} height={14} className="mb-2" />
            <Skeleton width="100%" height={50} borderRadius={12} />
          </View>
        ))}
      </View>

      <Skeleton width="100%" height={54} borderRadius={27} className="mt-8" />
    </ContentLayout>
  );
}
